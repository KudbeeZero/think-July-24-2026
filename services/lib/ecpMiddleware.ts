import { Request, Response, NextFunction } from 'express';
import { entityCacheProxy } from '../../src/server/entityCacheProxy.ts';

export interface ECPMetricsCounters {
  hits: number;
  misses: number;
  coalesces: number;
  totalRequests: number;
}

class ECPMetricsTracker {
  private counters: ECPMetricsCounters = {
    hits: 0,
    misses: 0,
    coalesces: 0,
    totalRequests: 0,
  };

  public recordHit(): void {
    this.counters.hits++;
    this.counters.totalRequests++;
  }

  public recordMiss(): void {
    this.counters.misses++;
    this.counters.totalRequests++;
  }

  public recordCoalesce(): void {
    this.counters.coalesces++;
    this.counters.totalRequests++;
  }

  public getMetrics() {
    const proxyMetrics = entityCacheProxy.getMetrics();
    return {
      tracker: { ...this.counters },
      proxyMetrics,
      hitRatio: this.counters.totalRequests > 0 
        ? ((this.counters.hits / this.counters.totalRequests) * 100).toFixed(2) + '%'
        : '100.00%'
    };
  }

  public reset(): void {
    this.counters = { hits: 0, misses: 0, coalesces: 0, totalRequests: 0 };
  }
}

export const ecpTracker = new ECPMetricsTracker();

/**
 * Express middleware to track and inspect ECP (Entity Cache Proxy / Edge Caching Protocol) metrics.
 */
export function ecpSingleflightMiddleware(req: Request, res: Response, next: NextFunction): void {
  const cacheHeader = req.headers['x-ecp-cache'];

  if (cacheHeader === 'HIT') {
    ecpTracker.recordHit();
  } else if (cacheHeader === 'COALESCED') {
    ecpTracker.recordCoalesce();
  } else if (cacheHeader === 'MISS') {
    ecpTracker.recordMiss();
  }

  res.setHeader('X-ECP-Engine', 'Kudbee-ECP-v1');
  next();
}
