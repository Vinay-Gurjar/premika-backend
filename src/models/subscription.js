import { Model, Schema } from "./index.js";
import { entity } from "../entities/entities.js";


export const SubscriptionSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    plan: {
        type: Object,
        required: true
    },
    plan_id: {
        type: String,
        required: true
    }, 
    status: {
        type: String,
        enum: ['ACTIVE', 'EXPIRED'],
        required: true,
        default: "ACTIVE"
    },
    expired_date: {
        type: String,
        required: true
    },       
    entity: {
        type: String,
        default: entity.SUBSCRIPTION
    },
});

export const Subscription = new Model("Subscription", SubscriptionSchema, entity.SUBSCRIPTION, "INFO");

export default Subscription