import User from "#models/users.js";
import { socketEmitter, socketLisners } from "#sockets/socketListner/socketListner.js";
import { updateUserStatus } from "./updateUserStatus.js";


export const handleStatusUpdates = async (socket) => {
  const userId = socket.user.id;

  await updateUserStatus(userId, true, socket);

  socket.on('UPDATE_USER_STATUS', async ({ is_online }) => {
    await updateUserStatus(userId, is_online, socket);
  });
  
  socket.on('disconnect', async () => {
    await updateUserStatus(userId, false, socket);
  });

  socket.on(socketLisners.UPDATE_LIVE_STATUS, async ({status}) => {
    const {PK} =  socket.user;
    await User.findAndUpdate({PK}, {live_status: status});
    socket.emit(socketEmitter.LIVE_STATUS_CHANGED, status);});
};
