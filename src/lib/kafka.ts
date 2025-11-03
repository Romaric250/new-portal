import { Kafka, KafkaConfig, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import { logger } from '@/utils/logger';
import { env } from '@/config/env';

let kafkaClient: Kafka | null = null;
let kafkaProducer: Producer | null = null;
let kafkaConsumer: Consumer | null = null;

const getKafkaConfig = (): KafkaConfig => {
  const brokers = env.KAFKA_BROKERS.split(',').map((b) => b.trim());

  return {
    clientId: env.KAFKA_CLIENT_ID,
    brokers,
    retry: {
      initialRetryTime: 100,
      retries: 8,
    },
    connectionTimeout: 3000,
    requestTimeout: 30000,
  };
};

export const getKafkaClient = (): Kafka => {
  if (kafkaClient) {
    return kafkaClient;
  }

  try {
    kafkaClient = new Kafka(getKafkaConfig());
    logger.info('Kafka client initialized');
    return kafkaClient;
  } catch (error) {
    logger.error('Failed to initialize Kafka client', error);
    throw error;
  }
};

export const getKafkaProducer = async (): Promise<Producer> => {
  if (kafkaProducer) {
    return kafkaProducer;
  }

  try {
    const client = getKafkaClient();
    kafkaProducer = client.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
    });

    await kafkaProducer.connect();
    logger.info('Kafka producer connected');
    return kafkaProducer;
  } catch (error) {
    logger.error('Failed to connect Kafka producer', error);
    kafkaProducer = null;
    throw error;
  }
};

export const getKafkaConsumer = async (
  groupId?: string,
): Promise<Consumer> => {
  const consumerGroupId = groupId || env.KAFKA_GROUP_ID;

  try {
    const client = getKafkaClient();
    kafkaConsumer = client.consumer({
      groupId: consumerGroupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      maxBytesPerPartition: 1048576,
    });

    await kafkaConsumer.connect();
    logger.info(`Kafka consumer connected with group ID: ${consumerGroupId}`);
    return kafkaConsumer;
  } catch (error) {
    logger.error('Failed to connect Kafka consumer', error);
    kafkaConsumer = null;
    throw error;
  }
};

// Producer utility functions
export const kafka = {
  produce: async <T = unknown>(topic: string, messages: T | T[]): Promise<void> => {
    try {
      const producer = await getKafkaProducer();
      const messagesArray = Array.isArray(messages) ? messages : [messages];

      const kafkaMessages = messagesArray.map((message) => ({
        value: JSON.stringify(message),
      }));

      await producer.send({
        topic,
        messages: kafkaMessages,
      });

      logger.debug(`Published ${messagesArray.length} message(s) to topic: ${topic}`);
    } catch (error) {
      logger.error(`Failed to produce message to topic ${topic}`, error);
      throw error;
    }
  },

  produceWithKey: async <T = unknown>(
    topic: string,
    key: string,
    message: T,
  ): Promise<void> => {
    try {
      const producer = await getKafkaProducer();

      await producer.send({
        topic,
        messages: [
          {
            key,
            value: JSON.stringify(message),
          },
        ],
      });

      logger.debug(`Published message with key ${key} to topic: ${topic}`);
    } catch (error) {
      logger.error(`Failed to produce message to topic ${topic}`, error);
      throw error;
    }
  },
};

// Consumer utility functions
export type MessageHandler<T = unknown> = (
  message: T,
  metadata: {
    topic: string;
    partition: number;
    offset: string;
    timestamp: string;
  },
) => Promise<void>;

export const subscribe = async <T = unknown>(
  topic: string | string[],
  handler: MessageHandler<T>,
  groupId?: string,
): Promise<void> => {
  try {
    const consumer = await getKafkaConsumer(groupId);
    const topics = Array.isArray(topic) ? topic : [topic];

    await consumer.subscribe({ topics, fromBeginning: false });

    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        try {
          const { topic, partition, message } = payload;
          const offset = message.offset;
          const timestamp = message.timestamp || Date.now().toString();

          if (!message.value) {
            logger.warn('Received message with no value', { topic, partition, offset });
            return;
          }

          const parsedMessage = JSON.parse(message.value.toString()) as T;

          await handler(parsedMessage, {
            topic,
            partition,
            offset,
            timestamp: timestamp.toString(),
          });
        } catch (error) {
          logger.error('Error processing Kafka message', error, {
            topic: payload.topic,
            partition: payload.partition,
            offset: payload.message.offset,
          });
          // In production, you might want to implement retry logic or dead letter queue
        }
      },
    });

    logger.info(`Subscribed to topic(s): ${topics.join(', ')}`);
  } catch (error) {
    logger.error(`Failed to subscribe to topic(s): ${Array.isArray(topic) ? topic.join(', ') : topic}`, error);
    throw error;
  }
};

// Graceful shutdown
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    try {
      if (kafkaProducer) {
        await kafkaProducer.disconnect();
        logger.info('Kafka producer disconnected');
      }
      if (kafkaConsumer) {
        await kafkaConsumer.disconnect();
        logger.info('Kafka consumer disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting Kafka clients', error);
    }
  });
}

