import { handleConversations } from "#sockets/controllers/v1/conversations.js";
import { handleSubscriptions } from "#sockets/redis/subscriptionHandler.js";
import { handleStatusUpdates } from "./statusHandler.js";

export const handleSocketEvents = async(socket) => {
  try {
    socket.join(socket.user.id)
    await handleConversations(socket);
    await handleStatusUpdates(socket);
    await handleSubscriptions(socket);
  } catch (error) {
    console.log("Error Ocurred in handle socket events",error);
  }
};
