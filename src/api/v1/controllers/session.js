import {cleanModelResponseData, getDataFromResponse, isValuePresent, sendResponse } from "#application/application.js";
import Otp from "#models/otp.js";
import User from "#models/users.js";
import { v4 as uuidv4 } from 'uuid';
import { comparePassword, generateAuthToken, getUserJSON, validPermissions } from "#api/v1/helpers/session.js";
import { entity } from "../../../entities/entities.js";
import { getUserByEmail, updateSelfDeactivationStatus } from "../helpers/users.js";
import { getRoleByName } from "../helpers/role.js";
import { client } from "../../../../firebase.config.js";
import { getRandomAvatar, resolvePromise } from "#utils";



export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!isValuePresent(email)) {
      return sendResponse( false, res, null, 'Email is required');
    }

    const response = await User.find({PK: `${entity.USER}#${email}`});
    let user = getDataFromResponse(response);
    if (!user) {
      // let role = await getRoleByName('user')
      //  role = getDataFromResponse(role);

      // user = await User.create({email:`${phone_number}@gmail.com`, phone_number, PK: `${entity.USER}#${phone_number}`, role_id: role.id,role })
      // user = getDataFromResponse(response);
      return sendResponse( false,res, null, 'User not found', 404);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const jti = uuidv4();
    const expires_at = new Date(Date.now() + (15 * 60 * 1000)).getTime(); 

    await Otp.create({
      id: jti,
      otp,
      SK: `OTP#${new Date().toISOString()}`,
      expires_at,
      userPK: user.PK,
      userSK: user.SK,
      deleted_at: "null"
    });


    return sendResponse( true, res, { identification_token: jti, otp }, 'OTP sent successfully');
  } catch (err) {
    console.error('sendOtp error', err);
    return sendResponse( false,res, null, err.message || 'Error sending OTP');
  }
};


export const submitOtp=async(req,res)=>{
  try{
    const { identification_token = "", otp = "" } = req.body;

    const data = await Otp.find({PK: `${entity.OTP}#${identification_token}`});
    const otpItem = getDataFromResponse(data);

    if (!otpItem) {
      return sendResponse( false,res, null, 'Invalid OTP or identification token', 400);
    }

    const {otp: verification_code} = otpItem
  
    if (verification_code !== otp) {
      return sendResponse( false,res, null, 'Invalid OTP', 401);
    }

    const userData = await User.find({PK: otpItem?.userPK});
    const authToken = await generateAuthToken(getDataFromResponse(userData));
    const user = cleanModelResponseData(userData);
    user.auth_token = authToken;

    return sendResponse( true, res, user, 'OTP verified successfully');

  }catch(err){
    console.error('submitOtp error', err);
    return sendResponse( false,res, null, err.message || 'Error submitting OTP');
  }
};


export const logout = async (req, res) => {
  try {
    const user = req.user;
      user.device_tokens= []
      user.save()
    return sendResponse( true, res, null, 'User logged out successfully');
  } catch (err) {
    console.error('logout error', err);
    return sendResponse( false,res, null, err.message || 'Error logging out');
  }
}

export const siginin = async (req, res) => {
  try {
    const {idToken, user} = req.body.data;
    if (!idToken || !user) throw new Error("Id token or user is missing");

    await client.verifyIdToken({
        idToken,
        audience: process.env.WEB_CLIENT_ID
    })


    let currentUser = await getUserByEmail(user.email, false)
    if (isValuePresent(currentUser)) {
      if (currentUser.deleted_at) {
        throw new Error(
          "Your account has been deleted. Please contact customer care if this is incorrect."
        );
      }
    }

    if (!isValuePresent(currentUser)) {
      const {data} = await getRoleByName("user");
      const role = data[0];
      const {name, photo,  ...rest} = user
      currentUser = await User.create({
        PK: `USER#${user.email}`,

        name: user?.name?.toLowerCase?.(),
        google_name: user.name || "Anonymous",
        name,
        ...rest,
        google_image: user?.photo,
        photo: getRandomAvatar(),
        role,
        role_id: role.id
      })
    }

    const token = await resolvePromise(generateAuthToken(currentUser));
    req.session.user_id = currentUser.id;
    req.session.token = token;
    
    let userData = cleanModelResponseData({data: [currentUser]});
    userData.auth_token = token
    
    if (currentUser.self_deactivate) {
      await updateSelfDeactivationStatus(currentUser.PK, false)
    }

    const userJson = getUserJSON(currentUser, token);
    return sendResponse(true, res, userJson, "Successfully login");
  } catch (error) {
    console.log(error?.message)
    sendResponse(false, res, error, error.message)
  }
}

export const passwordLogin = async (req, res) => {
  try {
    let {email, password} = req.body;

    if(!email || !password) throw new Error("Invalid email or password.")

    const user = await getUserByEmail(email);
    if(!user) throw new Error(`User with email ${email} doesn't exists`);

    const isPasswordMatched = await comparePassword(password, user.password);
    if(!isPasswordMatched) throw new Error("Wrong passwod");

    const token = await resolvePromise(generateAuthToken(user));
    req.session.user_id = user.id;
    req.session.token = token;
    
    let userData = cleanModelResponseData({data: [user]});
    userData.auth_token = token
    userData.role = userData.role.name
    userData.permissions = [ ...(user?.role?.name === "super_admin" ? ["ADMIN", "DASHBOARD"] : []), ...validPermissions]
    sendResponse(true, res, userData, "Successfully login");
  } catch (error) {
    sendResponse(false, res, error, error?.message);
  }
}
