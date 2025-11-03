/**
 * Helper utilities for working with Kafka
 */

import { kafka, subscribe, MessageHandler } from '@/lib/kafka';
import { logger } from './logger';

/**
 * Create a typed message producer for a specific topic
 */
export const createProducer = <T>(topic: string) => {
  return {
    send: async (message: T): Promise<void> => {
      await kafka.produce<T>(topic, message);
    },
    sendWithKey: async (key: string, message: T): Promise<void> => {
      await kafka.produceWithKey<T>(topic, key, message);
    },
  };
};

/**
 * Create a typed message consumer for a specific topic
 */
export const createConsumer = <T>(
  topic: string | string[],
  handler: MessageHandler<T>,
  groupId?: string,
) => {
  return {
    start: async (): Promise<void> => {
      await subscribe(topic, handler, groupId);
    },
  };
};

/**
 * Retry mechanism for Kafka message processing
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> => {
  let lastError: Error | unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        logger.warn(`Retry attempt ${attempt}/${maxRetries}`, { error });
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError;
};

/**
 * Dead letter queue handler
 */
export const sendToDeadLetterQueue = async (
  topic: string,
  originalMessage: unknown,
  error: Error,
): Promise<void> => {
  try {
    await kafka.produce('dead-letter-queue', {
      originalTopic: topic,
      originalMessage,
      error: {
        message: error.message,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
    });
    logger.error('Message sent to dead letter queue', { topic, error });
  } catch (dlqError) {
    logger.error('Failed to send message to dead letter queue', dlqError);
  }
};

