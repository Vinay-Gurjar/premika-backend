import { entity } from "../entities/entities.js";
import { Model, Schema } from "./index.js";


export const UserSchema = new Schema({
  name: {
    type: String,
  },
  bio: {
    type: String,
  },
  email: {
    type: "email",
    required: true,
  },
  role: {
    type: Object,
    required: true,
  },
  role_id: { type: String, required: true },
  live_status: {
    type: Boolean,
    default: true
  },
  status: {
    type: Boolean,
    required: true,
    default: true,
  },
  phone_number: {
    type: Number,
  },
  age: {
    type: Number,
  },
  have_place: {
    type: Boolean,
    default: true,
  },
  position: {
    type: String,
    enum: ["Top", "Verse Top", "Bottom", "Verse Bottom", "Versatile"],
  },
  distance: {
    type: Number,
  },
  photo: {
    type: String,
  },
  device_tokens: {
    type: Array,
  },
  activate: {
    type: Boolean,
    default: true,
  },
  registration_stage: {
    type: Number,
    default: 1
  },
  registration_complete: {
    type: Boolean,
    default: false
  },
  skip_registration: {
    type: Boolean,
    default: false
  },
  profession: {
    type: String, 
  },
  password: {
    type: String,
  },
  geo_hash: {
    type: String,
  },
  geo_hash_prefix: {
    type: String,
  },
  geo_hash_prefix_1: {
    type: String,
  },
  geo_hash_prefix_2: {
    type: String,
  },
  geo_hash_prefix_3: {
    type: String,
  },
  geo_hash_prefix_4: {
    type: String,
  },
  geo_hash_prefix_5: {
    type: String,
  },
  geo_hash_prefix_6: {
    type: String,
  },
  geo_hash_prefix_7: {
    type: String,
  },
  subscription_status: {
    type: String,
  },
  subscription_status_change_date: {
    type: String,
  },
  self_deactivate: {
    type: Boolean,
    default: false
  },
  customer_ids: {
    type: Object
  },
  location: {
    type: Object
  },
  subscription_details: {
    type: Object,
    required: true,
    default: {}
  },
    entity: {
    type: String,
    default: entity.USER,
  },
});

const User = new Model("User", UserSchema, entity.USER, "INFO");

export default User;
