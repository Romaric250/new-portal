import Redis from 'ioredis';

let redisClient: Redis | null = null;

const getRedisClient = (): Redis => {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError: (err: Error) => {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
  });

  redisClient.on('error', (err: Error) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Redis Client Connected');
  });

  return redisClient;
};

export const redis = getRedisClient();

// Cache utility functions
export const cache = {
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const value = await redis.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  set: async (
    key: string,
    value: unknown,
    expiryInSeconds?: number,
  ): Promise<void> => {
    try {
      const stringValue = JSON.stringify(value);
      if (expiryInSeconds) {
        await redis.setex(key, expiryInSeconds, stringValue);
      } else {
        await redis.set(key, stringValue);
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  },

  delete: async (key: string): Promise<void> => {
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  },

  deletePattern: async (pattern: string): Promise<void> => {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  },

  exists: async (key: string): Promise<boolean> => {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  },
};

// Graceful shutdown
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    if (redisClient) {
      redisClient.disconnect();
    }
  });
}

