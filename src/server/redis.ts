import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Default to dummy clients if no URL is explicitly provided to avoid connection spam in AI Studio
const shouldDisableRedis = !process.env.REDIS_URL && !process.env.REDIS_SLOW_URL && !process.env.REDIS_FAST_URL && process.env.NODE_ENV !== 'production';

// Fast Redis DB for volatile telemetry, real-time SSE, and rate-limiters
export const fastRedisClient = createClient({
  url: (process.env.REDIS_FAST_URL || process.env.REDIS_URL || 'redis://localhost:6379').replace(/^https:\/\//i, 'rediss://'),
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

// Slow Redis DB for immutable governance, core reasoning, Crucible logic, JobQueue & DLQ
export const slowRedisClient = createClient({
  url: (process.env.REDIS_SLOW_URL || process.env.REDIS_URL || 'redis://localhost:6380').replace(/^https:\/\//i, 'rediss://'),
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

export const mainRedisClient = fastRedisClient;
export const agentRedisClient = slowRedisClient;

/**
 * Ensures reasoning and governance are isolated from telemetry jitter.
 */
export function getSlowRedisClient() {
  return slowRedisClient;
}

export function getFastRedisClient() {
  return fastRedisClient;
}

fastRedisClient.on('error', (err: any) => {
  if (err?.code !== 'ECONNREFUSED') console.error('Fast Redis Client Error', err);
});

slowRedisClient.on('error', (err: any) => {
  if (err?.code !== 'ECONNREFUSED') console.error('Slow Redis Client Error', err);
});

export async function connectRedis() {
  if (shouldDisableRedis) {
    console.warn('Redis disabled in dev environment (no connection URLs provided).');
    return;
  }
  await Promise.all([
    fastRedisClient.connect().catch(() => console.warn('Fast Redis connection failed (running in-memory fallback)')),
    slowRedisClient.connect().catch(() => console.warn('Slow Redis connection failed (running in-memory fallback)'))
  ]);
}

