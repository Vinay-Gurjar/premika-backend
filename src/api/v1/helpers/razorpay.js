import Razorpay from "razorpay";
import { getUserById, updateCustomerIdToUser } from "./users.js";
import { isValuePresent } from "#application/application.js";
// import { getUser, updateUserCustomerId } from "./users.js";
// import { isValuePresent } from "../utils.js";


export const getRazorpay = async (credential) => {
  return new Razorpay({
    key_id: credential.key_id,
    key_secret: credential.secret_key,
  })
}; 


export const createPlan = async (razorpay, planDetails) => {
  try {
    if (!razorpay) throw new Error("Can't find razorpay");
    const params = {
      period: planDetails.timeFrame?.toLowerCase(), 
      interval: planDetails.duration,
      item: {
        name: planDetails.name,
        amount: toPaise(planDetails.finalPrice || planDetails.final_price),
        currency: "INR",
        description:
          planDetails.description ||
          `${toPaise(planDetails.finalPrice || planDetails.final_price)} INR (paisa) per ${planDetails.timeFrame} subscription`,
      },
      notes: planDetails.notes || {},
    }

    return await razorpay.plans.create(params);
  } catch (error) {
    console.log(error, "error");
    throw new Error(error);
    
}
};


const toPaise = (amountInRupees) => {
  return Math.round(Number(amountInRupees) * 100);
};

export const addSubscription = async (razorpay, planId, systemPlan, userId) => {
  try {

    // Prepare add-ons if trial exists
    const addOns = [];
    const trialCharge = Number(systemPlan.trial_charge || 0);
    const trialDays = Number(systemPlan.trial_days || 0);

    if (trialCharge > 0 && trialDays > 0) {
      addOns.push({
        item: {
          name: "Trial Charge",
          amount: toPaise(trialCharge), // convert to paise
          currency: "INR",
        },
        quantity: 1, // mandatory for Razorpay
      });
    }

    // Find or create customer in Razorpay
    const customer_id = await findOrCreateRazorpayUser(razorpay, userId);

    // Calculate subscription start time (now + trial days)
    const startAt = Math.floor(Date.now() / 1000) + trialDays * 24 * 60 * 60;

    // Prepare subscription parameters
    const subsParams = {
      plan_id: planId,
      customer_id,
      total_count: subscriptionCycle(systemPlan),
      start_at: startAt,
      customer_notify: 1, // send notification to customer
      notes: {
        uid: userId,
        pid: systemPlan.id,
        rpi: planId,
      },
    };

    if (addOns.length > 0) {
      subsParams.addons = addOns; // only include if any addon exists
    }

    // Create subscription
    const subscription = await razorpay.subscriptions.create(subsParams);
    return subscription;

  } catch (error) {
    console.error("Error creating subscription:", error);
    throw new Error(error.error?.description || error.message);
  }
};



const subscriptionCycle = (plan) => {
  const MAX_CYCLE_MONTHS = 120; 
  const d = plan.duration;
  let cycleMonths = 60;

  if (plan.timeframe === "Daily") {
    const ranges = [
      { max: 15, months: 0.5 },
      { max: 28, months: 1 },
      { max: 56, months: 2 },
      { max: 90, months: 3 },
      { max: 180, months: 6 },
      { max: 365, months: 12 },
    ];

    for (const range of ranges) {
      if (d <= range.max) {
        cycleMonths = range.months;
        break;
      }
    }
  }

  if (plan.timeframe === "Weekly") {
    const ranges = [
      { max: 4, months: 1 },
      { max: 8, months: 2 },
      { max: 12, months: 3 },
      { max: 24, months: 6 },
      { max: 52, months: 12 },
    ];

    for (const range of ranges) {
      if (d <= range.max) {
        cycleMonths = range.months;
        break;
      }
    }
  }

  if (plan.timeframe === "Monthly") {
    const ranges = [
      { max: 1, months: 1 },
      { max: 3, months: 3 },
      { max: 6, months: 6 },
      { max: 12, months: 12 },
    ];

    for (const range of ranges) {
      if (d <= range.max) {
        cycleMonths = range.months;
        break;
      }
    }
  }

  if (plan.timeframe === "Yearly") {
    const ranges = [
      { max: 1, months: 12 },
      { max: 2, months: 24 },
      { max: 5, months: 60 },
      { max: 10, months: 120 },
    ];

    for (const range of ranges) {
      if (d <= range.max) {
        cycleMonths = range.months;
        break;
      }
    }
  }
  return MAX_CYCLE_MONTHS / cycleMonths;
};




export const findOrCreateRazorpayUser = async (razorpay, userId) => {
  try {
    const userData = await getUserById(userId);
    if (!userData) throw new Error("Invalid User id");
    
    let customerId;
    if ( isValuePresent(userData.customer_ids)) {
      customerId = userData.customer_ids[razorpay.key_id];
    }

    if (customerId) {
      try {
        const customer = await razorpay.customers.fetch(customerId);
        return customer.id;
      } catch (fetchError) {
        console.log('Stored customer ID invalid, creating new customer:', fetchError);
      }
    }

    const customer = await getOrCreateCustomer(razorpay, userData.email, userData.whatsapp_number, userData.name);

    await updateCustomerIdToUser(userData.PK, {[razorpay.key_id]: customer.id});
    return customer.id;
  } catch (error) {
    console.error('Error in findOrCreateRazorpayUser:', error);
    throw new Error(error.message);
  }
};

const sanitizeName = (name, email) => {
  if (!name || name.trim().length < 2) {
    const emailName = email?.split('@')[0] || '';
    name = emailName.length >= 2 ? emailName : 'Customer' + Math.floor(Math.random() * 10000);
  }

  name = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();

  if (name.length < 2) {
    name = 'Customer' + Math.floor(Math.random() * 10000);
  }

  return name;
};

const getOrCreateCustomer = async (razorpay, email, contact, name) => {
  try {

    
    if (!name || name.length <= 2) {
      name = email.split('@')[0];
      if (!name || name.length <= 2) {
        name = "Customer" + Math.floor(Math.random() * 10000);
      }
    }

    const newCustomer = await razorpay.customers.create({
         name: sanitizeName(name, email),
         email,
        contact,
      });
    return newCustomer;

  } catch (error) {
    if (
      error.statusCode === 400 &&
      error.error?.code === "BAD_REQUEST_ERROR" &&
      error.error?.description?.includes("already exists")
    ) {
      const customers = await razorpay.customers.all({
        email, // Razorpay allows filtering by email
        contact,
        count: 1,
      });

      if (customers.items.length > 0) {
        const existingCustomer = customers.items[0];
        console.log("Found existing customer:", existingCustomer.id);
        return existingCustomer;
      }

      throw new Error("Customer exists but could not be found");
    }
    console.error("Error in getOrCreateCustomer:", error, email, contact, name);
    throw error; 
  }
};
