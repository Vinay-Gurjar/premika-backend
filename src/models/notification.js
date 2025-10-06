import { Model, Schema } from "./index.js";
import { entity } from "#entities/entities.js";

const NotificationSchema = new Schema({
    title: {
        type: String, 
        required: true,
    },
    sub_title: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    user: {
        type: Object,
        required: true
    },
    is_seen: {
        type: Boolean,
        required: true,
        default: false
    },
    type: {
        type: String,
        enum: ["chat"],
        required: true
    },
    entity: {
        type: String,
        default: "NOTIFICATION"
    }
})

const Notification = new Model("Notification", NotificationSchema, entity.NOTIFICATION, "INFO" )