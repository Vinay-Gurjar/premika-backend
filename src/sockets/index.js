import { initializeSocketConnection } from "./connection/initializeConnection.js";
import { initializeRedisHandlers } from "./redis/subscriber.js";

export const handleSocketConnection = () => {
  initializeSocketConnection();
  initializeRedisHandlers();
};