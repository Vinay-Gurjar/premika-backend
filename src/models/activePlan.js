import { Model, Schema } from "./index.js";
import { entity } from "../entities/entities.js";


const ActivePlanSchema = new Schema({
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
        required: true,
        ref: entity.PLANS,
    },
    plan: {
        type: Object,
        required: true,
        ref: entity.PLANS,
    },
    status: {
        type: String,
        required: true,
    },
    subscription_details: {
        type: Object,
        required: true,
    }, 
    subscription_status: {
        type: String,
    },
    entity: { type: String, required: true, default: entity.ACTIVE_PLAN },
});

const ActivePlan = new Model("ActivePlan", ActivePlanSchema, entity.ACTIVE_PLAN, "INFO");
export default ActivePlan;

