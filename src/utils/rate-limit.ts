import { redis } from '@/lib/redis';

export interface RateLimitOptions {
  interval: number; // Time window in seconds
  maxRequests: number; // Maximum requests per interval
}

export const rateLimit = async (
  key: string,
  options: RateLimitOptions,
): Promise<{ allowed: boolean; remaining: number; reset: number }> => {
  const { interval, maxRequests } = options;
  const now = Date.now();
  const windowStart = Math.floor(now / 1000 / interval) * interval;

  const redisKey = `rate-limit:${key}:${windowStart}`;

  try {
    const current = await redis.incr(redisKey);
    await redis.expire(redisKey, interval);

    const remaining = Math.max(0, maxRequests - current);
    const reset = (windowStart + interval) * 1000;

    return {
      allowed: current <= maxRequests,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open - allow request if Redis is down
    return {
      allowed: true,
      remaining: maxRequests,
      reset: now + interval * 1000,
    };
  }
};

