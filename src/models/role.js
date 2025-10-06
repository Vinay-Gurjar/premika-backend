import { Model, Schema } from "./index.js";
import { entity } from "../entities/entities.js";


export const RoleSchema = new Schema({
    name: {
        type: String,
        minLength: [2, "User name should contain at least 2 letters"],
        required: true
    },
    permissions: {
        type: Array
    },
    permission_ids: {
        type: Array
    },
    entity: {
        type: String,
        default: entity.ROLE
    },
});

const Role = new Model("Role", RoleSchema, entity.ROLE, "INFO");

export default Role