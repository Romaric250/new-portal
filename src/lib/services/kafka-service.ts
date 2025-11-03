/**
 * Example Kafka Service
 * This file demonstrates how to set up Kafka consumers for your application
 */

import { subscribe, MessageHandler } from '@/lib/kafka';
import { KAFKA_TOPICS, type KafkaEvent } from '@/lib/kafka-events';
import { logger } from '@/utils/logger';
import { withRetry, sendToDeadLetterQueue } from '@/utils/kafka-helpers';

// Example: User events handler
const handleUserEvent: MessageHandler<KafkaEvent> = async (event, metadata) => {
  try {
    logger.info('Processing user event', { event, metadata });

    switch (event.type) {
      case 'user.created':
        // Handle user creation
        logger.info('User created', { userId: event.userId, email: event.email });
        // Add your business logic here
        break;

      case 'user.updated':
        // Handle user update
        logger.info('User updated', { userId: event.userId, changes: event.changes });
        // Add your business logic here
        break;

      default:
        logger.warn('Unknown event type', { event });
    }
  } catch (error) {
    logger.error('Error processing user event', error, { event, metadata });
    throw error;
  }
};

// Example: Email events handler
const handleEmailEvent: MessageHandler<KafkaEvent> = async (event, metadata) => {
  try {
    if (event.type === 'email.sent') {
      logger.info('Email sent event received', { to: event.to, subject: event.subject });
      // Add your business logic here (e.g., logging, analytics)
    }
  } catch (error) {
    logger.error('Error processing email event', error, { event, metadata });
    throw error;
  }
};

/**
 * Initialize Kafka consumers
 * Call this function when your application starts
 */
export const initializeKafkaConsumers = async (): Promise<void> => {
  try {
    // Subscribe to user events with retry logic
    await subscribe(
      KAFKA_TOPICS.USERS,
      async (event, metadata) => {
        await withRetry(async () => {
          await handleUserEvent(event, metadata);
        }, 3).catch(async (error) => {
          await sendToDeadLetterQueue(KAFKA_TOPICS.USERS, event, error as Error);
        });
      },
    );

    // Subscribe to email events
    await subscribe(KAFKA_TOPICS.EMAILS, handleEmailEvent);

    logger.info('Kafka consumers initialized');
  } catch (error) {
    logger.error('Failed to initialize Kafka consumers', error);
    throw error;
  }
};

