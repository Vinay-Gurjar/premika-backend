import GSI_ENTITY_ID from "#models/GSI_ID_ENTITY.js"
import { entity } from "../../../entities/entities.js"

export const rolesList = async (filters, limit) => {
  const roles = await GSI_ENTITY_ID.find({PK: entity.ROLE, ...filters}, limit)
  return roles
}

export const getRoleById = async (id) => {
    return await rolesList({SK: id})
}

export const getRoleByName = async (name) => {
    return await rolesList({name: name})
}