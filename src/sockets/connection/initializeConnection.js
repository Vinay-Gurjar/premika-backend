
import { handleSocketEvents } from "#sockets/handler/mainHandler.js";
import { io } from "../../../server.js";
import { authenticateSocket } from "./authentication.js";
import { initializeFileUpload } from "./fileUpload.js";
// import { handleSocketEvents } from "../handlers/mainHandler.js";


export const initializeSocketConnection = () => {
  try {
      io.use(authenticateSocket);
      io.use(initializeFileUpload);
      io.on("connection", (socket) => {
        handleSocketEvents(socket)
      });
  } catch (error) {
    console.log(error, "error");
  }
};
