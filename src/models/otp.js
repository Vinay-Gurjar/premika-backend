import { Model, Schema } from "./index.js";
import { entity } from "../entities/entities.js";


const OtpSchema = new Schema({
    expires_at: {
        type: Number,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    userPK: {
        type: String, 
        required: true
    },
    userSK:{
        type: String,
        required: true
    },
    entity: { type: String, required: true, default: entity.OTP },
});

const Otp = new Model("Otp", OtpSchema, entity.OTP, "INFO");
export default Otp;

