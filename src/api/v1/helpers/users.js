import { dateNow, getDataFromResponse, isValuePresent } from "#application/application.js";
import GSI_ENTITY_ID from "#models/GSI_ID_ENTITY.js";
import Subscription from "#models/subscription.js";
import User from "#models/users.js";
import { entity } from "../../../entities/entities.js";
import { getRoleByName } from "./role.js";
import geohash from "ngeohash"
import { getUsersInRadius } from "./userList.js";
import e from "express";


export const getUserById = async (id) => {
  try {
    const data = await getUsersList({ SK: id }, true)

    if (data && data.length > 0) {
        return data[0];
    }
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw new Error('Error fetching user');
  }
}


export const getUsersList = async (options, onlyList = false) => {
  try {
    const {limit = 200, ...rest} = options
    
    const roleData = await getRoleByName('user')
    const role  = getDataFromResponse(roleData)
    const params = {PK: entity.USER, role_id:  role.id,  ...rest}

    const data = await GSI_ENTITY_ID.find(params, Number(limit));
    return onlyList ?  data.data || [] : data
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Error fetching users');
  }
}

export const getUsersListCount = async (options) => {
  try {
    const {limit = 200, ...rest} = options
    
    const roleData = await getRoleByName('user')
    const role  = getDataFromResponse(roleData)
    const params = {PK: entity.USER, role_id:  role.id,  ...rest}

    return await GSI_ENTITY_ID.count(params);

  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Error fetching users');
  }
}




export const DeNormalizationUser = (user) => {
  const {id, name, email, role, photo} = user;
  return {id, name, email, role, photo };
};

export const getUserActiveSubscription = async (user) => {
  try {
    const subscribtionData = GSI_ENTITY_ID.find({
      PK: entity.PLANS,
      user_id: user?.id,
      status: "ACTIVE",
    });

    const subscription = getDataFromResponse(subscribtionData);

    let status = true;
    if (isValuePresent(subscription)) {
      const expireDate = subscription?.expire_date;
      const isExpire = expireDate && dayjs(expireDate).isAfter(dateNow());

      if (isExpire) {
        status = subscription;
      } else {
        await Subscription.findAndUpdate(
          { PK: subscription.PK },
          { status: "EXPIRED" }
        );
      }
    }

    return status
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getUserByEmail = async (email = "", showError = true) => {
  try {
    const response = await User.find({PK: `${entity.USER}#${email}`});
    const data = getDataFromResponse(response)
    if(!data && showError){
      throw new Error("Invalid email. User Not found")
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export const registrationSteps = async (step, data, user, file) => {
  const newData = { status: true };

  const nextStage = user.registration_stage + 1;

  const setError = (message) => {
    newData.status = false;
    newData.message = message;``
  };

  switch (step) {
    case "Step1": {
      const { name } = data || {};
      newData.data = {
        name,
        registration_stage: nextStage,
      };
      break;
    }

    case "Step2": {
      const { age } = data;
      if (age < 18 || age > 80 || isNaN(age)) return setError("Invalid age.");
      newData.data = {
        age,
        registration_stage: nextStage,
      };
      break;
    }

    case "Step3": {
      const profession = data.profession;
      newData.data = {
        profession,
        registration_stage: nextStage,
      };
      break;
    }

    case "Step4": {
      const { have_place } = data;
      if (have_place !== true && have_place !== false)
        return setError("Invalid data. Have place can only be boolean.");
      newData.data = { have_place, registration_stage: nextStage };
      break;
    }

    case "Step5": {
      const { position } = data;
      const validPositions = [
        "Top",
        "Verse Top",
        "Bottom",
        "Vers Bottom",
        "Versatile",
      ];
      if (!validPositions.includes(position))
        return setError(
          `Invalid position. Possible positions are ${validPositions}`
        );
      newData.data = {
        position,
        registration_stage: nextStage,
      };
      break;
    }

    case "Step6": {
      let { photo } = data;

      newData.data = {
        registration_stage: nextStage,
        registration_complete: true,
      };

      if (isValuePresent(photo)) {
        newData.data.photo = photo; // only add photo if it’s valid
      }

      break;
    }
    default:
      return setError("Invalid step.");
  }

  return newData;
};

export const updateUserSubscriptionDetails = async (userId, updates) => {
  try {
     const user = await getUserById(userId)
    await User.findAndUpdate({PK: user.PK}, updates)
  } catch (error) {
    console.log("error in updateUserSubscriptionDetails",error)
  }
};


export const updateSelfDeactivationStatus = async (userPk, status = true) => {
  await User.findAndUpdate(
    { PK: userPk },
    { self_deactivate: status,
      device_tokens: []
    }
  );
};

export const updateCustomerIdToUser = async (userPK, customerId) => {
  return await User.findAndUpdate({PK:userPK},{customer_ids:customerId})
}

export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const saveUserWithLocation = async (user, locationData) => {
  const { latitude, longitude } = locationData;
  const geoHash = geohash.encode(latitude, longitude, 7);
  const prefixKeys = {};

  geoHash.split("").forEach((char, index) => {
    const prefixLength = index + 1;
    prefixKeys[`geo_hash_prefix_${prefixLength}`] = geoHash.substring(
      0,
      prefixLength
    );
  });

  const location = { latitude, longitude };

  return await User.findAndUpdate(
    { PK: user.PK },
    { location, geo_hash: geoHash, ...prefixKeys }
  );
};


export const getNearByUsers = async (filters, user) => {
  const {
    age = [],
    distance = [],
    availability,
    have_place,
    position,
    current_location,
    start_key,
    limit = 20,
  } = filters;

  const query = {
    have_place,
    position,
    availability,
    age: age.length > 0 ? age[0] : null,
    limit,
    start_key,
    email:`notInclude:-${user.email}`
  };

  const cleanQuery = Object.fromEntries(
    Object.entries(query).filter(([_, value]) => isValuePresent(value))
  );
  const location = current_location || user.location;

  if (location?.latitude && location?.longitude) {
    const [minDistance = 1, maxDistance = 3000] = distance;

    try {
      const { searchPrefixes, precision } = await getUsersInRadius(
        parseFloat(location.latitude),
        parseFloat(location.longitude),
        parseFloat(minDistance),
        parseFloat(maxDistance)
      );

      if (searchPrefixes && searchPrefixes.length > 0) {
        cleanQuery[
          `geo_hash_prefix_${precision}`
        ] = `multi:-${searchPrefixes.join(",")}`;
      }
    } catch (error) {
      console.error("Error in location-based filtering:", error);
    }
  }

  const result = await getUsersList(cleanQuery);
  const count = await getUsersListCount(cleanQuery);

  if (count) result.total = count;
  return result;
};
