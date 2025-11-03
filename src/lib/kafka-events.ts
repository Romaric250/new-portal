/**
 * Kafka Event Types and Handlers
 * Define your event types and handlers here for type safety
 */

// Example event types
export type UserCreatedEvent = {
  type: 'user.created';
  userId: string;
  email: string;
  name?: string;
  timestamp: string;
};

export type UserUpdatedEvent = {
  type: 'user.updated';
  userId: string;
  changes: Record<string, unknown>;
  timestamp: string;
};

export type EmailSentEvent = {
  type: 'email.sent';
  to: string;
  subject: string;
  template?: string;
  timestamp: string;
};



export type KafkaEvent = UserCreatedEvent | UserUpdatedEvent | EmailSentEvent;

// Event topic mapping
export const KAFKA_TOPICS = {
  USERS: 'users',
  EMAILS: 'emails',
  NOTIFICATIONS: 'notifications',
  AUDIT: 'audit',
} as const;

export type KafkaTopic = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];

// Example event producers
export const emitUserCreated = async (event: Omit<UserCreatedEvent, 'type' | 'timestamp'>): Promise<void> => {
  const { kafka } = await import('./kafka');
  await kafka.produce<KafkaEvent>(KAFKA_TOPICS.USERS, {
    type: 'user.created',
    ...event,
    timestamp: new Date().toISOString(),
  });
}



export const emitUserUpdated = async (event: Omit<UserUpdatedEvent, 'type' | 'timestamp'>): Promise<void> => {
  const { kafka } = await import('./kafka');
  await kafka.produce<KafkaEvent>(KAFKA_TOPICS.USERS, {
    type: 'user.updated',
    ...event,
    timestamp: new Date().toISOString(),
  });
};

export const emitEmailSent = async (event: Omit<EmailSentEvent, 'type' | 'timestamp'>): Promise<void> => {
  const { kafka } = await import('./kafka');
  await kafka.produce<KafkaEvent>(KAFKA_TOPICS.EMAILS, {
    type: 'email.sent',
    ...event,
    timestamp: new Date().toISOString(),
  });
};

