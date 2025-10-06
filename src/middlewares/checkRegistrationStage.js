import { sendResponse } from "#application/application.js";


const checkRegistrationStage = async (req, res, next) => {
    try {
        const user = req.user;
        const {step} = req.query;

        if(!step){
            return sendResponse(false,res, null, "step is missing.");
        }

        if(step < 1 || step > 5){
            return sendResponse(false,res, null, "Invalid step.")
        }

        if(user?.registration_stage !== step){
            return sendResponse(false,res, null, "Invalid step please complete previous steps first.")
        }

        
        next();
    } catch (error) {
        console.log(error)
        return sendResponse(false,res, error, "Try again.");
    }
}

export {
    checkRegistrationStage
}