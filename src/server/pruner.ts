import { getSlowRedisClient } from './redis';

const PRUNER_LOCK_KEY = 'kudbee:pruner:lock';
const LOCK_TTL_SECONDS = 600; // 10 minutes TTL

export async function runPrunerCycle(): Promise<{ locked: boolean; prunedDLQKeys: number }> {
  const slowRedis = getSlowRedisClient();

  if (!slowRedis.isOpen) {
    console.log('[Pruner] Slow Redis disconnected, skipping distributed pruner lock.');
    return { locked: false, prunedDLQKeys: 0 };
  }

  try {
    // Acquire distributed lock via SETNX with 10-minute TTL
    const acquired = await slowRedis.set(PRUNER_LOCK_KEY, `pruner_${Date.now()}`, {
      NX: true,
      EX: LOCK_TTL_SECONDS
    });

    if (!acquired) {
      console.log('[Pruner] Distributed lock kudbee:pruner:lock active on another worker. Skipping cycle.');
      return { locked: false, prunedDLQKeys: 0 };
    }

    console.log('[Pruner] Acquired kudbee:pruner:lock. Executing 6-hour DLQ pruning cycle...');

    // Prune dead letter queue keys older than 7 days
    const deadKeys = await slowRedis.keys('kudbee:jobs:*:dead');
    let pruned = 0;

    for (const key of deadKeys) {
      // Set 7-day TTL enforcement (604800 seconds)
      await slowRedis.expire(key, 604800);
      pruned++;
    }

    console.log(`[Pruner] Applied 7-day TTL enforcement to ${pruned} DLQ keys.`);

    return { locked: true, prunedDLQKeys: pruned };
  } catch (err) {
    console.error('[Pruner] Error executing pruner cycle:', err);
    return { locked: false, prunedDLQKeys: 0 };
  }
}

export async function getPrunerLockStatus(): Promise<{ locked: boolean; key: string; ttlSeconds: number }> {
  const slowRedis = getSlowRedisClient();
  if (!slowRedis.isOpen) {
    return { locked: false, key: PRUNER_LOCK_KEY, ttlSeconds: 0 };
  }

  try {
    const val = await slowRedis.get(PRUNER_LOCK_KEY);
    const ttl = await slowRedis.ttl(PRUNER_LOCK_KEY);
    return {
      locked: !!val,
      key: PRUNER_LOCK_KEY,
      ttlSeconds: ttl > 0 ? ttl : 0
    };
  } catch {
    return { locked: false, key: PRUNER_LOCK_KEY, ttlSeconds: 0 };
  }
}
