import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Default to dummy clients if no URL is explicitly provided to avoid connection spam in AI Studio
const shouldDisableRedis = !process.env.REDIS_URL && process.env.NODE_ENV !== 'production';

export const mainRedisClient = createClient({
  url: (process.env.REDIS_URL || 'redis://localhost:6379').replace(/^https:\/\//i, 'rediss://'),
  password: process.env.UPSTASH_REDIS_REST_TOKEN_2 || undefined,
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => {
      if (shouldDisableRedis) return new Error('Redis disabled in dev');
      if (retries > 3) return new Error('Max retries reached');
      return Math.min(retries * 50, 500);
    }
  }
});

export const agentRedisClient = createClient({
  url: (process.env.AGENT_REDIS_URL || 'redis://localhost:6380').replace(/^https:\/\//i, 'rediss://'),
  password: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => {
      if (shouldDisableRedis) return new Error('Redis disabled in dev');
      if (retries > 3) return new Error('Max retries reached');
      return Math.min(retries * 50, 500);
    }
  }
});

mainRedisClient.on('error', (err) => {
  if (err.code !== 'ECONNREFUSED') console.error('Main Redis Client Error', err);
});

agentRedisClient.on('error', (err) => {
  if (err.code !== 'ECONNREFUSED') console.error('Agent Redis Client Error', err);
});

export async function connectRedis() {
  if (shouldDisableRedis) {
    console.warn('Redis disabled in dev environment (no connection URLs provided).');
    return;
  }
  await Promise.all([
    mainRedisClient.connect().catch(() => console.warn('Main Redis connection failed (running locally without redis?)')),
    agentRedisClient.connect().catch(() => console.warn('Agent Redis connection failed (running locally without redis?)'))
  ]);
}
