import { dateNow, encryptObject, getCredentialData, sendResponse } from "#application/application.js";
import { entity } from "#entities/entities.js";
import Credential from "#models/credentials.js";
import GSI_ENTITY_ID from "#models/GSI_ID_ENTITY.js";
import { getCredentialsByFilters } from "../helpers/credentials.js";

export const creteCredentials = async (req, res) => {
    try {
        const {name, type, key_id, secret_key} = req.body
        if (!name, !type, !key_id, !secret_key) throw new Error("Invalid Details");

        const credentialsByName = await getCredentialsByFilters({ name }, true);

        if (credentialsByName && credentialsByName.length > 0) {
          throw new Error("Credential Already Exist with name");
        }

        const credentialsByKeyId = await getCredentialsByFilters({ key_id }, true);

        if (credentialsByKeyId && credentialsByKeyId.length > 0) {
          throw new Error("Credential Already Exist with key id.");
        }
        
        const credentialsBySecretKey = await getCredentialsByFilters({ secret_key }, true);

        if (credentialsBySecretKey && credentialsBySecretKey.length > 0) {
          throw new Error("Credential Already Exist with name");
        }

        const newCrednetial = await Credential.create({name, type, key_id, secret_key})
        sendResponse(true, res, newCrednetial, "Credentials Created Successfully")
    } catch (error) {
        console.log(error)
       return sendResponse(false, res, error, error.message || "Something went wrong to create credentials", 400)
    }
}


export const getCredentials = async (req, res) => {
  try {
    const credentials = await getCredentialsByFilters(req.query);
        const encryptedObject = await encryptObject(credentials)
    return sendResponse(
      true,
      res,
      {data:encryptedObject},
      "Credentials fetched Successfully"
    );
  } catch (error) {
    console.log(error);
    return sendResponse(
      false,
      res,
      error.message || "Something went wrong to fetch credentials"
    );
  }
};

export const getCredential = async (req, res) => {
  try {
    const credentials = await getCredentialsByFilters(req.query);
        const data = await getCredentialData(credentials.data)
        const encryptedObject = await encryptObject(data)
    return sendResponse(
      true,
      res,
      {data:encryptedObject},
      "Credentials fetched Successfully"
    );
  } catch (error) {
    console.log(error);
    return sendResponse(
      false,
      res,
      error.message || "Something went wrong to fetch credentials"
    );
  }
};


export const updateCredentials = async (req, res) => {
  try {
    let { id, PK, SK, delete_data, ...rest } = req.body;
    const credentialData = await GSI_ENTITY_ID.find({ PK:  `${entity.CREDENTIALS}`, SK: id });
    
    const credential = credentialData.data[0]
    if (!credential && !credential.length > 0)
      throw new Error("Invalid Credential Id");
 
    id = '1234'
    const updatedCredential = await Credential.findAndUpdate(
      {PK: `${entity.CREDENTIALS}#${id}`},
      rest
    );
    
    if (delete_data) {
        rest.deleted_at = dateNow()
    }
    return sendResponse(
      true,
      res,
      updatedCredential,
      "Credentials updated Successfully"
    );
  } catch (error) {
    console.log(error);
    return sendResponse(
      false,
      res,
      error.message || "Something went wrong to fetch credentials",
      400
    );
  }
};