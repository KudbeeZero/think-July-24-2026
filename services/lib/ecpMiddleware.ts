import { Request, Response, NextFunction } from 'express';
import { entityCacheProxy } from '../../src/server/entityCacheProxy.ts';

export interface ECPMetricsCounters {
  hits: number;
  misses: number;
  coalesces: number;
  totalRequests: number;
  l1Hits: number;
  l2Hits: number;
  dbHits: number;
  invalidations: number;
  lastUpdated: string | null;
}

export interface EntityTypeMetrics {
  hits: number;
  misses: number;
  coalesces: number;
  total: number;
}

export interface ECPMetricsSummary {
  tracker: ECPMetricsCounters & {
    hitRatioPercent: string;
    missRatioPercent: string;
    coalesceRatioPercent: string;
  };
  proxyMetrics: ReturnType<typeof entityCacheProxy.getMetrics>;
  hitRatio: string;
  missRatio: string;
  coalesceRatio: string;
  byEntityType: Record<string, EntityTypeMetrics>;
  systemStatus: {
    engine: string;
    singleflightActive: boolean;
    activeCoalescedCalls: number;
    uptimeSeconds: number;
  };
}

class ECPMetricsTracker {
  private counters: ECPMetricsCounters = {
    hits: 0,
    misses: 0,
    coalesces: 0,
    totalRequests: 0,
    l1Hits: 0,
    l2Hits: 0,
    dbHits: 0,
    invalidations: 0,
    lastUpdated: null,
  };

  private entityMetricsMap = new Map<string, EntityTypeMetrics>();
  private startTime = Date.now();

  private getOrCreateEntityMetrics(entityType: string): EntityTypeMetrics {
    let metrics = this.entityMetricsMap.get(entityType);
    if (!metrics) {
      metrics = { hits: 0, misses: 0, coalesces: 0, total: 0 };
      this.entityMetricsMap.set(entityType, metrics);
    }
    return metrics;
  }

  public recordHit(entityType?: string, tier: 'L1' | 'L2' = 'L1'): void {
    this.counters.hits++;
    this.counters.totalRequests++;
    if (tier === 'L1') this.counters.l1Hits++;
    if (tier === 'L2') this.counters.l2Hits++;
    this.counters.lastUpdated = new Date().toISOString();

    if (entityType) {
      const em = this.getOrCreateEntityMetrics(entityType);
      em.hits++;
      em.total++;
    }
  }

  public recordMiss(entityType?: string): void {
    this.counters.misses++;
    this.counters.dbHits++;
    this.counters.totalRequests++;
    this.counters.lastUpdated = new Date().toISOString();

    if (entityType) {
      const em = this.getOrCreateEntityMetrics(entityType);
      em.misses++;
      em.total++;
    }
  }

  public recordCoalesce(entityType?: string): void {
    this.counters.coalesces++;
    this.counters.totalRequests++;
    this.counters.lastUpdated = new Date().toISOString();

    if (entityType) {
      const em = this.getOrCreateEntityMetrics(entityType);
      em.coalesces++;
      em.total++;
    }
  }

  public recordInvalidation(): void {
    this.counters.invalidations++;
    this.counters.lastUpdated = new Date().toISOString();
  }

  public incrementHit(count = 1): void {
    this.counters.hits += count;
    this.counters.totalRequests += count;
    this.counters.lastUpdated = new Date().toISOString();
  }

  public incrementMiss(count = 1): void {
    this.counters.misses += count;
    this.counters.totalRequests += count;
    this.counters.lastUpdated = new Date().toISOString();
  }

  public incrementCoalesce(count = 1): void {
    this.counters.coalesces += count;
    this.counters.totalRequests += count;
    this.counters.lastUpdated = new Date().toISOString();
  }

  public get hits(): number {
    return this.counters.hits;
  }

  public get misses(): number {
    return this.counters.misses;
  }

  public get coalesces(): number {
    return this.counters.coalesces;
  }

  public get totalRequests(): number {
    return this.counters.totalRequests;
  }

  public get hitRatio(): string {
    if (this.counters.totalRequests === 0) return '100.00%';
    return ((this.counters.hits / this.counters.totalRequests) * 100).toFixed(2) + '%';
  }

  public get missRatio(): string {
    if (this.counters.totalRequests === 0) return '0.00%';
    return ((this.counters.misses / this.counters.totalRequests) * 100).toFixed(2) + '%';
  }

  public get coalesceRatio(): string {
    if (this.counters.totalRequests === 0) return '0.00%';
    return ((this.counters.coalesces / this.counters.totalRequests) * 100).toFixed(2) + '%';
  }

  public getMetrics(): ECPMetricsSummary {
    const proxyMetrics = entityCacheProxy.getMetrics();

    const mergedHits = Math.max(this.counters.hits, proxyMetrics.l1Hits + proxyMetrics.l2Hits);
    const mergedMisses = Math.max(this.counters.misses, proxyMetrics.dbHits);
    const mergedCoalesces = Math.max(this.counters.coalesces, proxyMetrics.coalescedRequests);
    const mergedTotal = Math.max(this.counters.totalRequests, proxyMetrics.totalRequests);

    const hitPct = mergedTotal > 0 ? ((mergedHits / mergedTotal) * 100).toFixed(2) : '100.00';
    const missPct = mergedTotal > 0 ? ((mergedMisses / mergedTotal) * 100).toFixed(2) : '0.00';
    const coalescePct = mergedTotal > 0 ? ((mergedCoalesces / mergedTotal) * 100).toFixed(2) : '0.00';

    const byEntityTypeRecord: Record<string, EntityTypeMetrics> = {};
    for (const [key, value] of this.entityMetricsMap.entries()) {
      byEntityTypeRecord[key] = { ...value };
    }

    return {
      tracker: {
        ...this.counters,
        hits: mergedHits,
        misses: mergedMisses,
        coalesces: mergedCoalesces,
        totalRequests: mergedTotal,
        hitRatioPercent: `${hitPct}%`,
        missRatioPercent: `${missPct}%`,
        coalesceRatioPercent: `${coalescePct}%`,
      },
      proxyMetrics,
      hitRatio: `${hitPct}%`,
      missRatio: `${missPct}%`,
      coalesceRatio: `${coalescePct}%`,
      byEntityType: byEntityTypeRecord,
      systemStatus: {
        engine: 'Kudbee-ECP-Singleflight-v1',
        singleflightActive: true,
        activeCoalescedCalls: proxyMetrics.activeCoalescedCalls || 0,
        uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      }
    };
  }

  public reset(): void {
    this.counters = {
      hits: 0,
      misses: 0,
      coalesces: 0,
      totalRequests: 0,
      l1Hits: 0,
      l2Hits: 0,
      dbHits: 0,
      invalidations: 0,
      lastUpdated: new Date().toISOString(),
    };
    this.entityMetricsMap.clear();
    this.startTime = Date.now();
  }
}

export const ecpTracker = new ECPMetricsTracker();

/**
 * Express middleware to track and inspect ECP (Entity Cache Proxy / Edge Caching Protocol) metrics.
 */
export function ecpSingleflightMiddleware(req: Request, res: Response, next: NextFunction): void {
  const cacheHeader = (req.headers['x-ecp-cache'] || req.headers['x-cache']) as string | undefined;
  const entityType = req.params?.type || (req.headers['x-ecp-entity-type'] as string);

  if (cacheHeader) {
    const normalized = cacheHeader.toUpperCase();
    if (normalized.includes('HIT')) {
      ecpTracker.recordHit(entityType);
    } else if (normalized.includes('COALESCE')) {
      ecpTracker.recordCoalesce(entityType);
    } else if (normalized.includes('MISS')) {
      ecpTracker.recordMiss(entityType);
    }
  }

  res.on('finish', () => {
    const resCacheHeader = res.getHeader('X-ECP-Cache') as string | undefined;
    if (resCacheHeader && !cacheHeader) {
      const normalized = resCacheHeader.toUpperCase();
      if (normalized.includes('HIT')) {
        ecpTracker.recordHit(entityType);
      } else if (normalized.includes('COALESCE')) {
        ecpTracker.recordCoalesce(entityType);
      } else if (normalized.includes('MISS')) {
        ecpTracker.recordMiss(entityType);
      }
    }
  });

  res.setHeader('X-ECP-Engine', 'Kudbee-ECP-v1');
  res.setHeader('X-ECP-Hit-Ratio', ecpTracker.hitRatio);
  res.setHeader('X-ECP-Hits', ecpTracker.hits.toString());
  res.setHeader('X-ECP-Misses', ecpTracker.misses.toString());
  res.setHeader('X-ECP-Coalesces', ecpTracker.coalesces.toString());

  next();
}

