
import { getUserById } from "#api/v1/helpers/users.js";
import { dateNow } from "#application/application.js";
import User from "#models/users.js";
import { addUserPrefix } from "#sockets/indexHelper.js";
import {
  convertToRedisDataString,
  publish,
} from "../redis/subscriberHandler.js";

export const updateUserStatus = async (
  userId,
  is_online,
  socket,
) => {
  try {
    const user = await getUserById(userId);
    if (!user) return;
    user.is_online = is_online
    user.last_seen = dateNow()
    user.socket_id= is_online ? socket?.id: ""

   await User.findAndUpdate({PK: user.PK},{is_online, last_seen: dateNow(), socket_id: is_online ? socket?.id: ""})
    const redisData = convertToRedisDataString(
      "USER_LIVE_STATUS", 
      addUserPrefix(userId),
      {
        id: user.id,
        is_online: is_online,
        last_seen: user.last_seen,
      }
    );

    await publish("status", redisData);
  } catch (error) {
    console.error("Failed to update user status:", error);
  }
};
