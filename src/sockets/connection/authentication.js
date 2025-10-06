import jwt from 'jsonwebtoken';
import User from '#models/users.js';
import { sendResponse } from '#application/application.js';
import { sendErrorEvent } from '#sockets/indexHelper.js';


export const authenticateSocket = async (socket, next) => {
  try {

    const token = socket.handshake.headers.authorization || socket.handshake.query.token;
    const platform = socket.handshake.headers.platform || socket.handshake.query.platform;

    // if (!platform) throw new Error('Platform is required');
    
    if (!token) throw new Error('No token provided');
    
      let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return sendErrorEvent(socket,"Token expired");
      } else if (error instanceof jwt.JsonWebTokenError) {
        return sendErrorEvent(socket,"Invalid token");
      }
      throw error; 
    }

    const data = await User.find({PK:decoded.data.PK});

    const user = data.data[0];
    if (!user) {
       return sendErrorEvent(socket,"Authentication failed");
    }

   
    if (!user?.activate) {
      return sendResponse(false,
        res,
        null,
        "Your account is inactive . Please contact customer care if this is incorrect."
      );
    }
    
    socket.user = user;
    socket.isUser = user.role === "user";
    socket.isAdmin = user.role === "admin"
    socket.isSuperAdmin =  user.role === "super_admin";
    
    next();
  } catch (error) {
    console.error('Socket Authentication Error:', error);
    next(new Error(`Authentication invalid: ${error.message}`));
  }
};