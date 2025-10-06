import shortUUID from "short-uuid";
import nodeDynamoDb from '@techveda/node-dynamodb';
export const { Model, Schema, initDynamoDB, GSI_Model } = nodeDynamoDb;
import dayjs from "dayjs";
import crypto from "crypto"
import { setCredentialsUsedUnused } from "#api/v1/helpers/credentials.js";


const SECRET_KEY = crypto.createHash('sha256').update(process.env.CREDENTIALS_KEY).digest();
export const getUserJSON = async (user, token) => {
    try {
        return {
            id: user.id,
            age: user.age,
            name: user.name,
            email: user?.email,
            phone_number: user.phone_number,
            photo: user?.photo,
            role: user.role,
            auth_token: token,
            registration_complete: user.registration_complete,
            fcm_token: user?.fcm_token,
            is_plan_active: user?.is_plan_active,
            subscription_plan_date: user?.subscription_plan_date,
            is_new_user: user.new || false
            //permissions: roles[user.role].cards,
        };
    } catch (error) {
        console.error('Error in getUserJSON:', error);
    }
}



export const getShortUUID = () => shortUUID().new();
    
export const isValuePresent = (value) => {
    return (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        value !== false &&
        !(Array.isArray(value) && value.length === 0) &&
        !(typeof value === 'object' && Object.keys(value).length === 0)
    );
};

export const denormalizeEntity = (data, fields) => {
    return Object.keys(data).reduce((acc, curr) => {
        if(fields.includes(curr)){
            acc[curr] = data[curr]
        }
        return acc
    }, {})
}

export const generateOtp = () => {
    let otp = ''
    for (let i = 0; i < 6; i++) {
        otp += Math.floor(Math.random() * 10)
    }
    return otp
}

export const Delay = async (delayTime = 1000) => {
    await new Promise(resolve => setTimeout(resolve, delayTime));
}

export const capitalizeFirstLetter = (str) => {
    return str.trim()[0].toUpperCase() + str.trim().slice(1).toLowerCase()
}


export const checkAndCreateFolder = async (folderPath) => {
    const resolvedPath = path.resolve(folderPath);
  
    if (!fs.existsSync(resolvedPath)) {
      fs.mkdirSync(resolvedPath, { recursive: true });
    }
};


export const sendResponse = (
  success,
  res,
  payload,
  message= "Something went wrong",
  statusCode
) => {
  const msg = message || (success ? "Data fetched successfully" : "An error occurred");
  const statusCodeNew  = statusCode ? statusCode : success ?  200 : 500
  if (success) {
    res.status(statusCodeNew).json({
      status: true,
      message: msg,
      data: payload,
    });
  } else {
    res.status(statusCode || 400).json({
      status: false,
      message: msg,
      error: payload,
    });
  }
};

export const getDataFromResponse = (data) => {
  if (data?.data && data.data.length > 0) {
     return data?.data[0];
  }
}

export const cleanModelResponseData = (modelData) => {
  const data = getDataFromResponse(modelData);
  return data ? cleanModelData(data) : {};
};

export const cleanModelData = (data) => {
    const schema = data?.schema ? [...data?.schema, {key:"created_at"},{key:"updated_at"}] : []
    const cleanData = {}

    schema?.forEach((item) => {
       if ( ['entity', 'deleted_at', 'PK', "SK", "password"].includes(item.key)) return
        if (data[item.key] === undefined) return
       cleanData[item.key] = data[item.key]
    })

    cleanData.id = data?.id
    return cleanData
}

export const cleanModelResponses = (data) => {
  const cleanResponses = [] 
  data?.data.forEach((item) => {
   const cleanItem = cleanModelData(item)
    cleanResponses.push(cleanItem)
  })
  return cleanResponses
}

export const dateNow = () => dayjs().toISOString();

export const toBoolean = (value) => {
  return String(value).toLowerCase() === 'true';
}


export const isUserPlanActive = (user) => {
    user.plan
}

export const sendRegistrationStage = async (res, user, message) => {
    const { registration_complete, registration_stage, approve_status , id} = user;
    const userData = await getUserJSON(user, user.auth_token)
    const data = {
        registration_stage,
        registration_complete,
        approve_status,
        _id:id,
        ...userData
    }

    sendResponse(true, res, data, message );
}


export const getAllEntities = (model) => async (req, res) => {
  try {
    const {limit = 10} = req.query;
    const data = await model.find({})
    sendResponse(
      true,
      res,
      data,
      "Plans fetched successfully"
    )
  } catch (error) {
    sendResponse(false, res, error, error?.message);
  }
}



export const isSuperUser = (user) => {
  const superRoles = ["admin", "super_admin"];
  return superRoles.includes(user?.role.name);
};

export const getCredentialData = async (credentials = []) => {
  if (credentials?.length === 0) return
  const index = credentials.findIndex((cred) => cred.last_use === true);

        let data  = {}
        if (index >= 0) {
            if (credentials.length === index+1) {
                data  = credentials[0]
                setCredentialsUsedUnused(credentials[0].id, true)
            } else {
                data  = credentials[index+1]
                setCredentialsUsedUnused(credentials[index+1].id, true)
            }
            setCredentialsUsedUnused(credentials[index].id, false)
        } else {
            data  = credentials[0]
            setCredentialsUsedUnused(credentials[0].id, true)
        }
        return data
}

export const encryptObject = async (obj)  => {
    const text = JSON.stringify(obj);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return {
      iv: iv.toString('base64'),
      content: encrypted
    };
}