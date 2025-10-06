import { getDataFromResponse } from "#application/application.js";
import { entity } from "#entities/entities.js"
import ActivePlan from "#models/activePlan.js";
import GSI_ENTITY_ID from "#models/GSI_ID_ENTITY.js"
import { denormalizePlan } from "./plan.js";
import { DeNormalizationUser } from "./users.js";

export const activePlanList = async (filters, limit) => {
  return await GSI_ENTITY_ID.find(
    { PK: entity.ACTIVE_PLAN, ...filters },
    limit
  );
};

export const getActivePlanById = async (id) => {
    return await activePlanList({SK: id})
}

export const getActivePlanByUserId = async (userId) => {
    const plan = await activePlanList({user_id: userId})
    return getDataFromResponse(plan);
}


export const createOrUpdateActivePlan = async (user, status, transaction) => {
 try {
     const existPlan = await getActivePlanByUserId(user.id)
    const newData = {
      status,
      user: DeNormalizationUser(user),
      user_id: user.id,
      plan: denormalizePlan(transaction.plan),
      plan_id: transaction.plan.id,
      subscription_details: transaction.subscription_details,
    };

    if (transaction.id) {
      existPlan.transaction_ids =[transaction.id]
    }

    if (existPlan) {
      if (existPlan?.transaction_ids) {
        existPlan.transaction_ids = [...existPlan?.transaction_ids, transaction.id];
      }
      return await ActivePlan.findAndUpdate({ PK: existPlan.PK }, newData);
    } else {
      return await ActivePlan.create(newData);
    }
 } catch (error) {
  console.log("error in createOrUpdateActivePlan", error)
 }
}

export const updateUserActivePlan = async (userId, updates) => {
   const existPlan = await getActivePlanByUserId(userId)
   if (!existPlan) throw new Error("Invalid User id");
   return await ActivePlan.findAndUpdate({ PK: existPlan.PK, SK: existPlan.SK }, updates)
}

