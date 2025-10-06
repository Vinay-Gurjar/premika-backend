import { connectionMaps } from "#sockets/connection/connectionMaps.js";
import { redis } from "../../../server.js";


export const publish = async (channel, data) => {
  try {
    const result = await redis?.publisher.publish(channel, data);
    if (result === 0) {
      console.warn(`No subscribers on channel ${channel}`);
    }
    return result;
  } catch (error) {
    console.error("Redis publish failed:", error);
    throw error;
  }
};

export const convertToRedisDataString = (eventName, targetId, data) => {
  return JSON.stringify({
    targetId,
    event: eventName,
    data,
    timestamp: Date.now(),
  });
};

export const flashData = async (socketEvent, targetId, data, fleshEvent) => {
   const redisData = convertToRedisDataString(
    socketEvent,
    targetId,
    data
  );
  await publish(fleshEvent, redisData);
};

export function createSubscriptionHandler(type, socket, ids) {
  try {
    if (!Array.isArray(ids)) {
      return socket.emit("error", {
        code: "INVALID_INPUT",
        message: `Expected array of ${type} IDs`,
      });
    }

    const processedIds = ids
      .map((id) => id?.toString().trim())
      .filter((id) => id);

    const userId = socket.user?.id;
    if (!userId) {
      return socket.emit("error", {
        code: "UNAUTHORIZED",
        message: "User ID missing in socket context",
      });
    }

    const failedIds = [];
    const successfulIds = [];

    for (const id of processedIds) {
      try {
        if (type === "Users") {
          if (!connectionMaps.users.has(id)) {
            connectionMaps.users.set(id, new Set());
          }
          connectionMaps.users.get(id).add(socket.id);

          if (!connectionMaps.socketToUsers.has(socket.id)) {
            connectionMaps.socketToUsers.set(socket.id, new Set());
          }
          connectionMaps.socketToUsers.get(socket.id).add(id);

          socket.join(id);
        } else if (type === "Conversations") {
          if (!connectionMaps.conversations.has(id)) {
            connectionMaps.conversations.set(id, new Set());
          }
          connectionMaps.conversations.get(id).add(userId);

          if (!connectionMaps.userConversations.has(userId)) {
            connectionMaps.userConversations.set(userId, new Set());
          }
          connectionMaps.userConversations.get(userId).add(id);

          socket.join(id);
        }
        successfulIds.push(id);
      } catch (error) {
        console.error(`Failed to subscribe to ${type} ${id}:`, error);
        failedIds.push(id);
      }
    }
  } catch (error) {
    console.error(`Subscription error (${type}):`, error);
    socket.emit("error", {
      code: "SUBSCRIPTION_ERROR",
      message: `Failed to process ${type} subscriptions`,
    });
  }
}

const cleanupSocketSubscriptions = (socketId) => {
  try {
    const subscribedUsers =
      connectionMaps.socketToUsers.get(socketId) || new Set();
    subscribedUsers.forEach((userId) => {
      const userSockets = connectionMaps.users.get(userId);
      if (userSockets) {
        userSockets.delete(socketId);
        if (userSockets.size === 0) {
          connectionMaps.users.delete(userId);
        }
      }
    });
    connectionMaps.socketToUsers.delete(socketId);

    connectionMaps.userConversations.forEach((conversations, userId) => {
      const userSockets = connectionMaps.users.get(userId);
      if (userSockets && userSockets.has(socketId)) {
        conversations.forEach((conversationId) => {
          const conversationUsers =
            connectionMaps.conversations.get(conversationId);
          if (conversationUsers) {
            conversationUsers.delete(userId);
            if (conversationUsers.size === 0) {
              connectionMaps.conversations.delete(conversationId);
            }
          }
        });
        connectionMaps.userConversations.delete(userId);
      }
    });
  } catch (error) {
    console.error("Failed to clean up socket subscriptions:", error);
  }
};
