import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { getKafkaClient } from '@/lib/kafka';

export async function GET() {
  const services: Record<string, string> = {};
  let allHealthy = true;

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    services.database = 'connected';
  } catch (error) {
    services.database = 'disconnected';
    allHealthy = false;
  }

  try {
    // Check Redis connection
    await redis.ping();
    services.redis = 'connected';
  } catch (error) {
    services.redis = 'disconnected';
    allHealthy = false;
  }

  try {
    // Check Kafka connection
    const kafkaClient = getKafkaClient();
    // Note: This is a basic check. In production, you might want to
    // actually test producer/consumer connections
    services.kafka = 'available';
  } catch (error) {
    services.kafka = 'unavailable';
    allHealthy = false;
  }

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services,
    },
    { status: allHealthy ? 200 : 503 },
  );
}

