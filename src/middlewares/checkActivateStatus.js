import { sendResponse } from "#application/application.js";



const checkActivateStatus = async (req, res, next) => {
       next();
    // try {
    //     if(!req.user.activate){
    //         return sendResponse(false, res, null, "Your account has been suspended/deactivated. Please contact support.", 403);
    //     }
    //     next();
    // } catch (err) {
    //     return sendResponse(false,res, null, err.message);
    // }
}

export default checkActivateStatus;