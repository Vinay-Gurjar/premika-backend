import { entity } from "../entities/entities.js"
import { Model, Schema } from "./index.js";


const ConversationsSchema = new Schema({
    user_ids: { type: Array, required: true, ref:"USER"},
    users: { type: Array, required: true},
    entity: { type: String, required: true, default: entity.CONVERSATION },
    active_members:{type: Array, }
})


const Conversation = new Model("Conversations", ConversationsSchema, entity.CONVERSATION, "INFO", )


const MessageSchema = new Schema({
    sender_id: { type: String, ref: "USER", required: true },
    user_ids: { type: Array, required: true, ref:"USER"},
    type: { type: String, required: true, enum: ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'ONE_TIME'] },
    content: { type: String, required: true },
    is_seen: { type: Boolean, required: true, default: false },
    is_deleted: { type: Boolean, required: true, default: false },
    is_delivered: { type: Boolean, required: true, default: false },
    entity: { type: String, required: true, default: entity.MESSAGE },
    conversation_id: { type: String, ref: "CONVERSATION", required: true },
});

const Message = new Model("Message", MessageSchema, entity.MESSAGE, "INFO");


export { Conversation, Message };