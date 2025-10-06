
import { sendResponse } from "#application/application.js";
import User from "#models/users.js";
import jwt from "jsonwebtoken";

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const platform = req.headers.platform;
    if (!token) {
      return sendResponse(false,res, null, "No token provided", 401);
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return sendResponse(false,res, null, "Token expired", 401);
      } else if (error instanceof jwt.JsonWebTokenError) {
        return sendResponse(false,res, error.message, "Invalid token", 401);
      }
      throw error; 
    }

    const data = await User.find({PK:decoded.data.PK});



    const user = data.data[0];

    if (!user) {
      return sendResponse(false,res, null, "Authentication failed", 401);
    }

   
    // console.log(user,"user")
    // if (!user?.activate) {
    //   return sendResponse(false,
    //     res,
    //     null,
    //     "Your account is inactive . Please contact customer care if this is incorrect."
    //   );
    // }


    req.user = user;
    req.isUser = user.role === "user";
    req.isAdmin = user.role === "admin"
    req.isSuperAdmin =  user.role === "super_admin";

    next();
  } catch (error) {
    return sendResponse(false,res, error.message, "Authentication failed", 500);
  }
};

export default authenticate;
