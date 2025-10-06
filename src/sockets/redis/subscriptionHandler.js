import { connectionMaps } from '#sockets/connection/connectionMaps.js';
import { detectIdType, removePrefix } from '#sockets/indexHelper.js';
import { io } from '../../../server.js';
// import { connectionMaps } from '../redis/connectionMaps.js';

export const handleSubscriptions = async (socket) => {
  const userId = socket.user.id.toString();
  
  if (!connectionMaps.users.has(userId)) {
    connectionMaps.users.set(userId, new Set());
  }
  connectionMaps.users.get(userId).add(socket.id);

  // socket.on('disconnect', () => {
  //   cleanupSocketSubscriptions(socket.id);
  // });
};


export const handleRedisSubscribers = async (channel, message) => {
  try { 
  await resolveTargetSockets(message);
  } catch (error) {
    console.error('Message processing failed:', {
      channel,
      error: error.message,
      rawMessage: message
    });
  }
}

const safeEmit = async (socketOrInstance, event, payload) => {
  try {
    JSON.stringify(payload);
    socketOrInstance.emit(event, payload);
  } catch (err) {
    console.error(`Payload for ${event} is not JSON-safe:`, err);
  }
};


const resolveTargetSockets = async (message) => {
  const { targetId, event, data } = JSON.parse(message);
  const type = detectIdType(targetId); 
  const rawId = removePrefix(targetId);  

  if (type === "socket") {
    const socket = io.sockets.sockets.get(rawId);
    if (socket) {
      safeEmit(socket, event, data);
    } else {
      // console.log(`Socket ID ${rawId} not connected.`);
    }

  } else {
    const room = io.sockets.adapter.rooms.get(rawId);

    if (room && room.size > 0) {
      safeEmit(io.to(rawId), event, data);
    } else {
      // console.log(`Room/User ${rawId} not connected.`);
    }
  } 
};
