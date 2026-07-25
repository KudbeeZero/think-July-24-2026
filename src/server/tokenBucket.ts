import { getFastRedisClient } from './redis';

const TOKEN_BUCKET_LUA = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = redis.call('TIME')[1]

local bucket = redis.call('HMGET', key, 'tokens', 'last_update')
local tokens = tonumber(bucket[1]) or limit
local last_update = tonumber(bucket[2]) or now

local delta = math.max(0, now - last_update)
tokens = math.min(limit, tokens + delta * refill_rate)

if tokens >= 1 then
    tokens = tokens - 1
    redis.call('HMSET', key, 'tokens', tokens, 'last_update', now)
    return 1
else
    return 0
end
`;

// In-memory token bucket fallback for local/offline operation
const inMemoryBuckets = new Map<string, { tokens: number; lastUpdate: number }>();

export async function consumeTokenBucket(
  key: string,
  limit: number = 100,
  refillRate: number = 10
): Promise<boolean> {
  const fastRedis = getFastRedisClient();

  if (fastRedis.isOpen) {
    try {
      const result = await fastRedis.eval(TOKEN_BUCKET_LUA, {
        keys: [key],
        arguments: [limit.toString(), refillRate.toString()]
      } as any);
      return Number(result) === 1;
    } catch (err) {
      console.warn('[TokenBucket] Redis EVAL failed, falling back to in-memory bucket:', err);
    }
  }

  // In-memory fallback
  const nowSec = Math.floor(Date.now() / 1000);
  const bucket = inMemoryBuckets.get(key) || { tokens: limit, lastUpdate: nowSec };

  const delta = Math.max(0, nowSec - bucket.lastUpdate);
  bucket.tokens = Math.min(limit, bucket.tokens + delta * refillRate);
  bucket.lastUpdate = nowSec;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    inMemoryBuckets.set(key, bucket);
    return true;
  }

  inMemoryBuckets.set(key, bucket);
  return false;
}
