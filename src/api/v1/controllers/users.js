import {cleanModelResponseData, dateNow, getDataFromResponse, isValuePresent, sendRegistrationStage, sendResponse } from "#application/application.js"
import GSI_ENTITY_ID from "#models/GSI_ID_ENTITY.js"
import User from "#models/users.js"
import {entity} from "../../../entities/entities.js";
import { getNearByUsers, getUserById, getUsersList, registrationSteps, saveUserWithLocation, updateSelfDeactivationStatus } from "../helpers/users.js";

export const updateUser = async (req, res) => {
  try {
    const {body, user: currentUser, isAdmin, isSuperAdmin } = req
    const { id, PK, SK, deleted_at, ...updates } = body;

    const user = await getUserById(id)

    if (user && (user.id === currentUser.id || isAdmin || isSuperAdmin)) {
      const updatedUser = await User.findAndUpdate(
        { PK: user.PK },
        updates
      );

      const newUser = getDataFromResponse(updatedUser);
      return sendResponse(true, res, newUser, "User updated successfully");
    }

    return sendResponse(false, res, null, "User not found or ID mismatch");  
  } catch (error) {
    console.error("Something went wrong in updateUser:", error);
    return sendResponse(false, res, error, error.message);
  }
};


export const getUsers = async (req, res) => {
  try {
    const {query, user} = req
    const cleanData = await getUsersList({});
    return sendResponse(true, res, cleanData, "Users fetched successfully");
  } catch (error) {
    console.error("Something went wrong in getUsers:", error);
    return sendResponse(false, res, error, error.message);
  }
};

export const fetchUsersByLocation = async (req, res) => {
    try {
    const {query, user} = req
    const cleanData = await getNearByUsers(query, user);
    return sendResponse(true, res, cleanData, "Users fetched successfully");
  } catch (error) {
    console.error("Something went wrong in getUsers:", error);
    return sendResponse(false, res, error, error.message);
  }
}


export const deleteUser  = async (req, res) => {
  try {
    const { id } = req.body;

    if (!isValuePresent(id)) {
      return sendResponse(false, res, null, "User ID is required");
    }

    const user = await getUserById(id);

    if (user && user.id === id) {
      await User.findAndUpdate(
        { PK: user.PK },
        { deleted_at: dateNow() }
      );

      return sendResponse(true, res, null, "User deleted successfully");
    }

    return sendResponse(false, res, null, "User not found or ID mismatch");
  } catch (error) {
    console.error("Something went wrong in deleteUser:", error);
    return sendResponse(false, res, error, error.message);
  }
}

export const deleteAccount = async (req, res) => {
  try {
    const {idToken} = req.body.data;
    const entity = getUsersEntityByPlatform(platform);
    if (!idToken) {
      throw new Error("Id token is missing.");
    }

    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${idToken}`);
    const data = await response.json();

    if (data.aud !== process.env.WEB_CLIENT_ID) {
      return res.status(401).json({ error: 'Invalid audience' });
    }


    const userResponse = await User.find({PK: `${entity.USER}#${email}`});
    let currentUser = getDataFromResponse(response);

    if(!isValuePresent(currentUser)){
      return sendFailure(res, `User with email id ${currentUser?.email} don't exists.`, `User with this email ${currentUser?.email} don't exists.`)
    }

    if (isValuePresent(currentUser)) {
      if (currentUser.deleted_at) {
        throw new Error(`It looks like the account linked email ${currentUser?.email} address has already been deleted`)
      }

      await User.findAndUpdate(currentUser.PK, currentUser.SK, {deleted_at: new Date().toISOString()})
    }

    sendResponse(true, res, "Account Deleted Successfully", "Account Deleted Successfully");
  } catch (error) {
    sendResponse(false, res, error, error?.message); 
  }
}

export const restoreUser = async (req, res) => {
  try {
    const { id } = req.body;

    if (!isValuePresent(id)) {
      return sendResponse(false, res, null, "User ID is required");
    }

    const data = await GSI_ENTITY_ID.findAll({ SK: id, PK: entity.USER });
    const user = getDataFromResponse(data); 

    if (user) {
     const result = await User.restore(
        { PK: user.PK, SK: user.SK }
      );

      const data = cleanModelResponseData(result);
      return sendResponse(true, res, data, "User restored successfully");
    }

    return sendResponse(false, res, null, "User not found");
  } catch (error) {
    console.error("Something went wrong in restoreUser:", error);
    return sendResponse(false, res, error, error.message);
  }
};

export const consultantRegistration = async (req, res) => {
    try {
        const user = req.user;
        const { step } = req.query;

        if(user.registration_complete){
            throw new Error("Invalid request. Registration is already completed.")
        }
       const result  = await registrationSteps(`Step${step}`, req.body, user, req.files?.file, user)
       if (result?.status) {
        const newData = await User.findAndUpdate({PK: user.PK, SK: user.SK}, result.data)
        sendResponse(true, res, newData, "Details updated successfully");
       } else {
        throw new Error(result?.message)
       }

    } catch (error) {
        console.log(error)
        sendResponse(false, res, error, error.message || "Error in registration process.");
    }
}

export const getRegisrationStage = async (req, res) => {
  try {
    const {user} = req
      return sendRegistrationStage(res, user, "Registration stage fetched successfully.");
  } catch (error) {
    sendResponse(false, res, error, error?.message);
  }
}

export const addDeviceToken = async (req, res) => {
  try {
    const {user, body} = req;
    const {token} = body;

    const {device_tokens = []} = user;
    if(!device_tokens.includes(token)){
      await User.findAndUpdate(
        {PK: user?.PK, SK: user?.SK}, 
        {device_tokens: [...device_tokens, token]}
      )
    }

    sendResponse(true, res, null, "Token added sucessfully");
  } catch (error) {
    sendResponse(false, res, error, error?.message);
  }
}

export const removeToken = async (req, res) => {
  try {
    const {user, body} = req;
    const {token} = body;

    const device_tokens = user?.device_tokens?.filter((tkn) => token !== tkn)

    await User.findAndUpdate(
      {PK: user?.PK, SK: user?.SK},
      { device_tokens }
    )

    sendResponse(true, res, null, "Tokens removed successfully")
  } catch (error) {
    sendResponse(false, res, error, error?.message);
  }
}


export const selfDeactivateAccount = async (req, res) => {
  try {
    await updateSelfDeactivationStatus(req.user.PK, true)
    return sendResponse(true, res, null, "account deactivated")
  } catch (error) {
    return sendResponse(false, res, null, error.message || "something wents wrong to deactivate account")
  }
}

export const skipRegistration = async (req, res) => {
  try {
      const updatedUser = await User.findAndUpdate({PK: req.user.PK},{skip_registration: true})   
     return sendResponse(true, res, updatedUser, "registration Skiped")
  } catch (error) {
    return sendResponse(false, res, null, error.message || "something wents wrong to skip registration")
  }
}

export const checkUser = async (req, res) => {
  try {
     return sendResponse(true, res, req.user, "updated User's details")
  } catch (error) {
    return sendResponse(false, res, null, error.message || "something wents wrong to skip registration")
  }    
}

export const handleUserLocation = async (req, res) => {
  try {
    const {user, body} = req
     await saveUserWithLocation(user, body.location)
     return sendResponse(true, res, req.user, "updated user location")
  } catch (error) {
    console.log(error)
    return sendResponse(false, res, null, error.message || "something wents wrong to skip registration")
  }    
}

