import { socketEmitter } from "./socketListner/socketListner.js";

export const addUserPrefix = (id) => `user::${id}`;
export const addConvoPrefix = (id) => `conv::${id}`;
export const addRoomPrefix = (id) => `room::${id}`;
export const addSocketPrefix = (id) => `socket::${id}`;

export const isPrefixedId = (id, type) => id.startsWith(`${type}::`);

export const removePrefix = (prefixedId) => {
  const parts = prefixedId.split('::');
  return parts.length > 1 ? parts[1] : prefixedId;
};

export const detectIdType = (id) => {
  if (isPrefixedId(id, 'user')) return 'user';
  if (isPrefixedId(id, 'conv')) return 'conversation';
  if (isPrefixedId(id, 'room')) return 'room';
  if (isPrefixedId(id, 'socket')) return 'socket';
  return 'unknown';
};

export const sendErrorEvent = (socket, message) => {
   try {
    socket.emit(socketEmitter.ERROR, message);
   } catch (error) {
    console.log("ERROR", error)
   }
}