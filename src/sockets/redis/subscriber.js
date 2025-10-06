
import { handleRedisSubscribers } from './subscriptionHandler.js';
import { redis } from '../../../server.js';

export const initializeRedisHandlers = async () => {
  try {
    const {setupValkeyPubSub} = redis
    const channels = ['status', 'calling', 'chat', 'message', 'notification', 'leave_all', 'balance', 'payment'];

    setupValkeyPubSub(channels,handleRedisSubscribers)
  } catch (error) {
    console.error('Failed to initialize Redis subscribers:', error);
    process.exit(1);
  }
};


