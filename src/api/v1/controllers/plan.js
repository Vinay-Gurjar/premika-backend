import { cleanModelResponses, getAllEntities, isSuperUser, isValuePresent, sendResponse } from "#application/application.js";
import Plan from "#models/plan.js";
import { addPlan, getPlanByFilters, handleDeletePlan } from "../helpers/plan.js";

export const createPlan = async (req, res) => {

  try {
      const {body, user} = req
      if (!isSuperUser(user)) throw new Error("ACCESS DENIED");

      const plan = await addPlan(body);
      return sendResponse(
        true,
        res,
        plan,
        `Recharge added successfully`,
        200
      );

  } catch (error) {
    console.error(`Error in Adding plan:`, error);
    return sendResponse(false, res, error.message, `Failed to add plan`);
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const {limit = 20, start_key, ...rest} =  req.query
    const plans = await getPlanByFilters(rest, limit);
    sendResponse(true, res, plans, "Plans fetched successfully")
  } catch (error) {
    console.error(`Error in getting plans list:`, error);
    return sendResponse(res, error.message, "Failed to add Query");
  }
};

export const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await Plan.find({name: "SUBSCRIPTIONS"})
    const data = cleanModelResponses(plans)
    sendResponse(true, res, data, "Plans fetched successfully")
  } catch (error) {
    sendResponse(false, res, error, error?.message)
  }
}

export const deletePlan = async (req, res) => {
  try {
    const {query,user} = req
    if (!isSuperUser(user)) {
      throw new Error("ACCESS DENIED!"); 
    }

    await handleDeletePlan(query.id, user)

    return sendResponse(true, res, null, "Plan Deleted Successfully")
  } catch (error) {
    return sendResponse(false, res, null, error.message || "Something wents wrong to delete plan")
  }
}
