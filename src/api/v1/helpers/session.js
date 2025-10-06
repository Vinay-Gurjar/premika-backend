import User from '#models/users.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET;
const saltRounds = 10;

export const validPermissions = ["USER", "CREDENTIALS", "PLANS", "ROLES", "PERMISSIONS", "TRANSACTIONS"];

export const generateAuthToken = async (user) => {
  const { id, PK, SK, email } = user;

  const payload = {
    data: { id, PK, SK, email }
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '90d' });
}


export const createDefaultUser = async(data) => {
     await User.create(data)
}

export const getUserJSON = (user = {}, token) => {
  try {
    const {
      id,
      age,
      name,
      bio,
      role,
      position,
      distance,
      live_status,
      have_place,
      status,
      email,
      registration_stage,
      phone_number,
      photo,
      registration_complete,
      fcm_token,
      new: isNewUser,
      skip_registration,
      profession,
      subscription_status,
      subscription_status_change_date,
      subscription_details,
      location,
    } = user;

    return {
      id,
      age,
      name,
      bio,
      role: role || {},
      position,
      distance,
      live_status,
      have_place,
      status,
      email,
      registration_stage,
      phone_number,
      photo,
      auth_token: token,
      registration_complete,
      fcm_token,
      is_new_user: isNewUser || false,
      skip_registration,
      profession,
      subscription_status,
      subscription_status_change_date,
      subscription_details,
      location,
    };
  } catch (error) {
    console.error("Error in getUserJSON:", error);
    return null;
  }
};


export const comparePassword = async (password, hashedPassword) => {
  try {
    const result =  await bcrypt.compare(password, hashedPassword);
    return result === true;
  } catch (error) {
    throw error
  }
}

export const generateHashedPassword = async (password) => {
  const salt = await bcrypt.genSalt(Number(saltRounds));
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword
};


