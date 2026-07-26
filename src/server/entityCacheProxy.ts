import { getFastRedisClient } from './redis.ts';

interface CacheStats {
  l1Hits: number;
  l2Hits: number;
  dbHits: number;
  coalescedRequests: number;
  invalidations: number;
  totalRequests: number;
}

interface InFlightRequest<T> {
  promise: Promise<T>;
}

class EntityCacheProxy {
  private l1Cache = new Map<string, { data: any; expiresAt: number }>();
  private inFlightMap = new Map<string, InFlightRequest<any>>();
  private maxL1Size = 10000; // Cap L1 in-memory records
  private stats: CacheStats = {
    l1Hits: 0,
    l2Hits: 0,
    dbHits: 0,
    coalescedRequests: 0,
    invalidations: 0,
    totalRequests: 0,
  };

  /**
   * Transparent Read-Through Fetch with Multi-Tier Cache (L1 -> L2 -> DB)
   * & Singleflight Request Coalescing to prevent Thundering Herd / Cache Stampedes.
   */
  async getOrFetch<T>(
    entityType: string,
    id: string,
    fetchFn: () => Promise<T>,
    ttlSeconds = 300
  ): Promise<T> {
    this.stats.totalRequests++;
    const key = `kudbee:ecp:${entityType}:${id}`;
    const now = Date.now();

    // 1. Check L1 In-Memory LRU Cache
    const l1Item = this.l1Cache.get(key);
    if (l1Item && l1Item.expiresAt > now) {
      this.stats.l1Hits++;
      return l1Item.data as T;
    }

    // 2. Singleflight Request Coalescing (In-flight dedup)
    if (this.inFlightMap.has(key)) {
      this.stats.coalescedRequests++;
      return this.inFlightMap.get(key)!.promise as Promise<T>;
    }

    // 3. Initiate Singleflight Execution
    const requestPromise = (async () => {
      try {
        // Check L2 Redis Cache
        const fastRedis = getFastRedisClient();
        if (fastRedis.isOpen) {
          try {
            const cachedString = await fastRedis.get(key);
            if (cachedString && typeof cachedString === 'string') {
              const data = JSON.parse(cachedString) as T;
              this.stats.l2Hits++;
              // Populate L1 cache for hot access
              this.setL1(key, data, ttlSeconds);
              return data;
            }
          } catch (err) {
            console.warn(`[ECP:${entityType}] Redis L2 get error, bypassing to DB:`, err);
          }
        }

        // Fetch from Primary Storage (DB Hit)
        this.stats.dbHits++;
        const freshData = await fetchFn();

        if (freshData !== null && freshData !== undefined) {
          // Populate L1 In-Memory Cache
          this.setL1(key, freshData, ttlSeconds);

          // Populate L2 Redis Cache
          if (fastRedis.isOpen) {
            try {
              await fastRedis.set(key, JSON.stringify(freshData), { EX: ttlSeconds });
            } catch (err) {
              console.warn(`[ECP:${entityType}] Redis L2 write error:`, err);
            }
          }
        }

        return freshData;
      } finally {
        // Clean up in-flight promise map
        this.inFlightMap.delete(key);
      }
    })();

    this.inFlightMap.set(key, { promise: requestPromise });
    return requestPromise;
  }

  /**
   * Transparent Write-Through Mutation with Instant Multi-Tier Invalidation
   */
  async writeThrough<T>(
    entityType: string,
    id: string,
    data: T,
    persistFn: (data: T) => Promise<T>,
    ttlSeconds = 300
  ): Promise<T> {
    const key = `kudbee:ecp:${entityType}:${id}`;

    // 1. Write to Primary Storage
    const savedData = await persistFn(data);

    // 2. Update L1 In-Memory Cache
    this.setL1(key, savedData, ttlSeconds);

    // 3. Update L2 Redis Cache
    const fastRedis = getFastRedisClient();
    if (fastRedis.isOpen) {
      try {
        await fastRedis.set(key, JSON.stringify(savedData), { EX: ttlSeconds });
      } catch (err) {
        console.warn(`[ECP:${entityType}] Redis L2 write-through error:`, err);
      }
    }

    return savedData;
  }

  /**
   * Explicit Entity Invalidation across L1 and L2
   */
  async invalidate(entityType: string, id: string): Promise<void> {
    this.stats.invalidations++;
    const key = `kudbee:ecp:${entityType}:${id}`;

    // Remove from L1
    this.l1Cache.delete(key);

    // Remove from L2
    const fastRedis = getFastRedisClient();
    if (fastRedis.isOpen) {
      try {
        await fastRedis.del(key);
      } catch (err) {
        console.warn(`[ECP:${entityType}] Redis L2 deletion error:`, err);
      }
    }
  }

  private setL1(key: string, data: any, ttlSeconds: number) {
    if (this.l1Cache.size >= this.maxL1Size) {
      // Evict oldest entry
      const oldestKey = this.l1Cache.keys().next().value;
      if (oldestKey && typeof oldestKey === 'string') this.l1Cache.delete(oldestKey);
    }
    this.l1Cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Get ECP Operational Metrics
   */
  getMetrics() {
    const totalHits = this.stats.l1Hits + this.stats.l2Hits;
    const hitRatePercent = this.stats.totalRequests > 0
      ? ((totalHits / this.stats.totalRequests) * 100).toFixed(2)
      : '100.00';

    return {
      ...this.stats,
      hitRatePercent,
      l1Size: this.l1Cache.size,
      activeCoalescedCalls: this.inFlightMap.size,
      tierDistribution: {
        l1Percent: this.stats.totalRequests > 0 ? ((this.stats.l1Hits / this.stats.totalRequests) * 100).toFixed(1) : '0',
        l2Percent: this.stats.totalRequests > 0 ? ((this.stats.l2Hits / this.stats.totalRequests) * 100).toFixed(1) : '0',
        dbPercent: this.stats.totalRequests > 0 ? ((this.stats.dbHits / this.stats.totalRequests) * 100).toFixed(1) : '0',
      }
    };
  }
}

export const entityCacheProxy = new EntityCacheProxy();
