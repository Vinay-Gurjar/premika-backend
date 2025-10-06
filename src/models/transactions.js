import { Model, Schema } from "./index.js";
import { entity } from "../entities/entities.js";


const TransactionsSchema = new Schema({
    user_id: {
        type: String,
        required: true,
        ref: entity.USER,
    },
    user: {
        type: Object,
        required: true,
        ref: entity.USER,
    },
    plan_id: {
        type: String,
        ref: entity.PLANS,
    },
    plan: {
        type: Object,
        ref: entity.PLANS,
    },
    amount: {
        type: Number,
        required: true,
    },
    payment_status: {
        type: String,
    },
    transaction_mode: {
        type: String,
        default: "razorpay"
    },
    payment_method:{
         type: String,
    },
    payment_id: {
        type: String,
    },
    invoice_id: {
        type: String,
    },
    customer_id: {
        type: String,
        required: true,
    },
    pay_token_id: {
        type: String,
    },
    razorpay_plan_id: {
        type: String,
    },
    error_description: {
        type: String,
    },
    subscription_details: {
        type: Object,
    },
    entity: { type: String, required: true, default: entity.TRANSACTIONS },
});

const Transaction = new Model("Transaction", TransactionsSchema, entity.TRANSACTIONS, "INFO");
export default Transaction;

