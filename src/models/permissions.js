import { Model, Schema } from "./index.js";
import { entity } from "../entities/entities.js";


export const PermissionSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
        minLength: [10, 'description should contain at least 10 letters.']
    },
    entity: { type: String, required: true, default: entity.PERMISSION },
});

const Permission = new Model("Permission", PermissionSchema, entity.PERMISSION, "INFO")

export default Permission