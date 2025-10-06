import { entity } from "../../../entities/entities.js"
import GSI_ENTITY_ID from "#models/GSI_ID_ENTITY.js"
import Credential from "#models/credentials.js"


export const getCredentialsByFilters = async (filters = {}, onlyData) => {
   const {id, limit ,...restFilters} = filters
   const params = {PK: entity.CREDENTIALS, ...restFilters}
   const data =  await GSI_ENTITY_ID.find(params, Number(limit))
   let result = data || undefined
   if (data && data?.data && data.data.length > 0 && onlyData) {
    result = data.data
   }
   return result
}

export const getCredentialById = async (id) => {
   return getCredentialsByFilters({SK:id}, true)
}

export const setCredentialsUsedUnused = async(id, status) => {
  await Credential.findAndUpdate({PK:`PAYMENT_CREDENTIAL#${id}`}, {last_use:status})
}

