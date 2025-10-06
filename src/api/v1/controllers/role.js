import { cleanModelResponseData, sendResponse } from "#application/application.js";
import { rolesList } from "../helpers/role.js";

const getRoles = async (req, res) => {
    try {
        const {limit = 20, ...rest} = req.query
        const data = await rolesList(rest, limit);
        const roles = cleanModelResponseData(data);
        sendResponse(true, res, roles, 'Roles Fetched Successfully');
    } catch (error) {
        console.error("Error fetching roles:", error);
        sendResponse(false, res, error.message || '', '')
    }
}