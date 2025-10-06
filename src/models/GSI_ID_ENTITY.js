import { GSI_Model, Schema } from "./index.js";


const GSI_SCHEMA = new Schema({
    PK: { type: String, required: true },
    SK: { type: String, required: true }, 
})

const GSI_ENTITY_ID = new GSI_Model("GSI_ENTITY_ID", GSI_SCHEMA, "entity", "id");

export default GSI_ENTITY_ID