import { Model, Schema } from "./index.js";
import { entity } from "../entities/entities.js";

const CredentialSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true
    },
    key_id: {
        type: String, 
        required: true
    },
    secret_key:{
        type: String,
        required: true
    },
    last_use: {
        type: Boolean,
        required: true,
        default: false
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    },
    entity: { type: String, required: true, default: entity.CREDENTIALS },
});

const Credential = new Model("Credentials", CredentialSchema, entity.CREDENTIALS, "INFO");
export default Credential;

