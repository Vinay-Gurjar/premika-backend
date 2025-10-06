import {
  // createSubscriptionHandler,
  handleBroadcastmessage,
  handleEnterExitChat,
  handleGetUserStatus,
  handleMessageSeen,
  handleTypingStatus,
  sendMessage,
} from "#sockets/helpers/v1/conversations.js";
import { createSubscriptionHandler } from "#sockets/redis/subscriberHandler.js";
import { socketLisners } from "#sockets/socketListner/socketListner.js";

export const handleConversations = async (socket) => {
  socket.on(socketLisners.SUBSCRIBE_USERS, async (user_ids) => {
    await createSubscriptionHandler("Users", socket, user_ids);
  });

  socket.on(socketLisners.SUBSCRIBE_CONVERSATIONS, async (conversation_ids) => {
    await createSubscriptionHandler("Conversations", socket, conversation_ids);
  });

  socket.on(socketLisners.SEND_MESSAGE, async (data) => {
    await sendMessage(data, socket);
  });

  socket.on(socketLisners.TYPING, async (data) => {
    await handleTypingStatus(data);
  });

  socket.on(socketLisners.MESSAGE_SEEN, async (data) => {
    await handleMessageSeen(data, socket);
  });

  socket.on(socketLisners.GET_USER_STATUS, async ({ id }) => {
    await handleGetUserStatus(id, socket);
  });

  socket.on(socketLisners.ON_ENTER_EXIT_CHAT, async (data) => {
    await handleEnterExitChat(data, socket);
  });

  socket.on("BROADCAST_MESSAGE", async (data) => {
    await handleBroadcastmessage(data, socket);
  });
};


