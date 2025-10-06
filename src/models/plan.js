import { Model, Schema } from "./index.js";
import { entity } from "#entities/entities.js";

const PlanSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    base_price: {
        type: Number,
        required: true
    },
    final_price: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    timeframe: {
        type: String,
        required: true
    },
    discount_percentage: {
        type: Number,
        required: true
    },
    discount_amount: {
        type: Number,
        required: true
    },
    trial_days: {
        type: Number,
        required: true
    },
    trial_charge: {
        type: Number,
        required: true
    },
    razorpay_plans: {
        type: Array,
        required: true
    },
    entity: {
        type: String, 
        required: true,
        default: entity.PLANS
    },
    description: {
        type: String, 
        required: true,
    },
    status: {
        type: Boolean, 
        required: true,
        default: true
    },
    deleted_at: {
        type: String, 
    },
})

const Plan = new Model("Plan", PlanSchema, entity.PLANS, "INFO")

export default Plan