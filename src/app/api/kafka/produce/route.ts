import { NextRequest, NextResponse } from 'next/server';
import { kafka } from '@/lib/kafka';
import { createSuccessResponse, createErrorResponse } from '@/utils/api-response';
import { z } from 'zod';

const produceSchema = z.object({
  topic: z.string().min(1),
  message: z.unknown(),
  key: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, message, key } = produceSchema.parse(body);

    if (key) {
      await kafka.produceWithKey(topic, key, message);
    } else {
      await kafka.produce(topic, message);
    }

    return createSuccessResponse(
      {
        topic,
        message: 'Message produced successfully',
      },
      201,
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}

