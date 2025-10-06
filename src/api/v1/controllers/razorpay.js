import { createPlan, getRazorpay } from "../helpers/razorpay.js";
import { getCredentialById, getCredentialsByFilters } from "../helpers/credentials.js";
import { getPlanById } from "../helpers/plan.js";
import { getDataFromResponse, isValuePresent, sendResponse } from "#application/application.js";
import { addSubscription } from "../helpers/razorpay.js";

export const createRazorpayPlan = async (planDetails) => {
  try {

    const credentialsData = await getCredentialsByFilters();
    const credentials = credentialsData?.data
    const plans = [];
    if (credentials?.length > 0) {
      for (const credential of credentials) {
        const razorpay = await getRazorpay(credential);
        const plan = await createPlan(razorpay, planDetails);
        const data = {};
        data[credential.key_id] = plan.id;
        plans.push(data);
      }
      return plans;
    }

    throw new Error("Credentials not find");
  } catch (error) {
    throw new Error(error.message);
  }
};


export const createSubscription = async (req, res) => {
  try {
    const {cid, pid, uid} = req.body
    const credentials = await getCredentialById(cid)
    if (credentials?.length > 0) {
        const credential = credentials[0]
        const planData = await getPlanById(pid)
        const plan = getDataFromResponse(planData)
        if (plan && plan.razorpay_plans.length > 0) {
            const planObj = plan.razorpay_plans.find(
              (p) => p[credential.key_id] !== undefined
            );

            if (isValuePresent(planObj)) {
              const razorpay = await getRazorpay(credential);
              const subscription = await addSubscription(razorpay, planObj[credential.key_id], plan, uid)
              const {id, short_url, customer_id} = subscription
              return sendResponse(true,res, {id, short_url, customer_id}, "Subscription Created Susseccfully")
            }
        }
    }
    throw new Error("Invalid Plan Or Credential details");
  } catch (error) {
    console.log(error,"ERROR")
   return sendResponse(false,res, error, error.message || "Something wents wrong to create subscriptions")    
  }
};
