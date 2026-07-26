import { getFastRedisClient } from './redis.ts';

export interface ModelRateLimit {
  modelName: string;
  provider: string;
  requestsPerMinute: number;
  tokensPerMinute: number;
}

export const modelConfigs: Record<string, ModelRateLimit> = {
  'deepseek-reasoner': {
    modelName: 'deepseek-reasoner',
    provider: 'DeepSeek',
    requestsPerMinute: 60, // As per typical DeepSeek R1 rate limits
    tokensPerMinute: 100000,
  },
  'deepseek-chat': {
    modelName: 'deepseek-chat',
    provider: 'DeepSeek',
    requestsPerMinute: 60,
    tokensPerMinute: 100000,
  },
  'grok-3-fast': {
    modelName: 'grok-3-fast',
    provider: 'xAI',
    requestsPerMinute: 100,
    tokensPerMinute: 250000,
  },
  'llama-3.3-70b-versatile': {
    modelName: 'llama-3.3-70b-versatile',
    provider: 'Groq',
    requestsPerMinute: 30,
    tokensPerMinute: 6000,
  },
  'gemini-3.1-pro-preview': {
    modelName: 'gemini-3.1-pro-preview',
    provider: 'Google',
    requestsPerMinute: 15,
    tokensPerMinute: 2000000,
  },
  'gemini-3.6-flash': {
    modelName: 'gemini-3.6-flash',
    provider: 'Google',
    requestsPerMinute: 15,
    tokensPerMinute: 2000000,
  }
};

export class ModelRateLimiter {
  private async checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    const redis = getFastRedisClient();
    if (!redis.isOpen) return true; // Fail open if no redis

    const now = Date.now();
    const windowStart = now - windowMs;
    const redisKey = `ratelimit:${key}`;

    try {
      // Remove old entries
      await redis.zRemRangeByScore(redisKey, 0, windowStart);
      
      // Count current entries
      const requestCount = await redis.zCard(redisKey);
      
      if (requestCount >= limit) {
        return false;
      }
      
      // Add new entry
      await redis.zAdd(redisKey, [{ score: now, value: `${now}-${Math.random()}` }]);
      await redis.expire(redisKey, Math.ceil(windowMs / 1000));
      return true;
    } catch (e) {
      console.error(`Rate limit check failed for ${key}`, e);
      return true; // Fail open
    }
  }

  async checkRequestLimit(modelId: string): Promise<boolean> {
    const config = modelConfigs[modelId];
    if (!config) return true; // No limit defined

    // 1 minute window
    return this.checkRateLimit(`model:req:${modelId}`, config.requestsPerMinute, 60000);
  }

  async checkTokenLimit(modelId: string, estimatedTokens: number): Promise<boolean> {
    const config = modelConfigs[modelId];
    if (!config) return true;
    
    // We could implement a token bucket for this, but for now we'll do a basic check
    // In a real scenario, we'd add the estimatedTokens to a rolling counter
    return true; 
  }
}

export const globalModelRateLimiter = new ModelRateLimiter();
