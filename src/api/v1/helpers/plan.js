import { capitalizeFirstLetter, cleanModelResponseData, dateNow, getDataFromResponse, isValuePresent } from "#application/application.js"
import { entity } from "#entities/entities.js";
import GSI_ENTITY_ID from "#models/GSI_ID_ENTITY.js";
import Plan from "#models/plan.js";
import { createRazorpayPlan } from "../controllers/razorpay.js";


export const denormalizePlan = (plan) => {
   if (!plan || typeof plan !== "object") throw new Error("Invalid Plan Details");

  const { id, name, base_price, timeframe, duration, entity, PK, SK } = plan;
  return {
    id,
    name,
    base_price,
    timeframe,
    duration,
    entity,
    PK,
    SK,
  };
}

export const getPlanById = async (id) => {
 return await Plan.find({PK: `${entity.PLANS}#${id}`})
}

export const getPlanByFilters = async(filters = {}, limit = 1) => {
    return await GSI_ENTITY_ID.find({PK: entity.PLANS, ...filters}, Number(limit))
}


export const addPlan = async (data) => {
  const {
    name,
    price,
    discount,
    duration,
    timeframe,
    description,
    trial_days,
    trial_charge
  } = data || {};
  const timeFrame = capitalizeFirstLetter(timeframe);

  const existPlanData = await getPlanByFilters({ timeFrame, duration });

  const existPlan = getDataFromResponse(existPlanData);

  if (existPlan)
    throw new Error(
      `Plan ALready exist with this ${duration} duration and ${timeFrame} time frame`
    );

  const calculation = calculatePrice({
    price,
    discount,
    gstPercentage: process.env.GST_PERCENTAGE || 18,
  });

  const {
    originalPrice,
    discountPercentage,
    discountAmount,
    basePrice,
    finalPrice,
  } = calculation;

  const razapayPlans = await createRazorpayPlan({
    ...calculation,
    timeFrame,
    name,
    duration,
  });

  console.log(razapayPlans,"razapayPlans")

  if (!isValuePresent(razapayPlans)) throw new Error("Plan is not created");
  
  const newData = {
    base_price: basePrice,
    final_price: finalPrice,
    duration,
    discount_percentage: discountPercentage,
    timeframe: timeFrame,
    discount_amount: discountAmount,
    description,
    trial_days,
    name,
    razorpay_plans:razapayPlans,
    trial_charge
  };

  return Plan.create(newData);
}

const calculatePrice = ({ price, discount = 0, gstPercentage = 18 }) => {
  const discountAmount = (price * discount) / 100;
  const basePrice = price - discountAmount;

  const gstAmount = (basePrice * gstPercentage) / 100;

  const finalPrice = basePrice;

  return {
    originalPrice: roundRupees(price),
    discountPercentage: discount,
    discountAmount: roundRupees(discountAmount),
    basePrice: roundRupees(basePrice),
    gstPercentage,
    gstAmount: roundRupees(gstAmount),
    finalPrice: roundRupees(finalPrice),
    finalPriceInPaise: toPaise(finalPrice),
  };
};

const roundRupees = (amountInRupees) => {
  return Math.round(Number(amountInRupees));
};

const toPaise = (amountInRupees) => {
  return Math.round(Number(amountInRupees) * 100);
};

export const handleDeletePlan =async (planId, user) => {
    if (!planId) throw new Error("plan id is required");
    
    const plan = await Plan.findAndUpdate({PK: `${entity.PLANS}#${planId}`},{deleted_at: dateNow()})

    if (!plan) throw new Error("Invalid Plan Id");
    return 
}