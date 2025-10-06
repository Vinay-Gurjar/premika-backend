import { isValuePresent, sendResponse } from "#application/application.js"
import Plan from "#models/plan.js";
import Transaction from "#models/transactions.js";
import { DeNormalizationUser } from "../helpers/users.js";
import { denormalizePlan } from "../helpers/plan.js";

export const addTransaction = async (req, res) => {
    try {
        const {user, body} = req
        const { type, plan_id, amount, status, ...restData } = body;

        const planData = await Plan.find({id: plan_id})
        if(!isValuePresent(planData.data)) throw new Error("Invalid plan id.");

        const plan = denormalizePlan(planData)

        const data = {
            PK: user?.PK,
            SK: `TRANSACTION#${new Date().toISOString()}`,
            user_id: user.id,
            user: DeNormalizationUser(user),
            amount,
            status,
            plan_id,
            ...restData,
        };

        data.amount = plan.plan_amount;
        data.plan = plan;

        const transaction = await Transaction.create(data);

        if (transaction) {
            return sendResponse(true, res, transaction, "Transaction added successfully");
        } else {
            return sendResponse(false, res, null, "Failed to add transaction");
        }
    } catch (error) {
        sendResponse(false, res, error, error?.message);
    }
}

export const getAllTransactions = async (req, res) => {
    try {
        const {user} = req;
        const transactions = await Transaction.find({
            PK: user?.PK,
            SK: "TRANSACTION",
            skBegins: true
        });

        sendResponse(true, res, transactions, "Transaction fetched successfully");
    } catch (error) {
        sendResponse(false, res, error, error?.message); 
    }
}

