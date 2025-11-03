import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/utils/rate-limit';

export const withRateLimit = (
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: { interval: number; maxRequests: number },
) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    const limitResult = await rateLimit(ip, options);

    if (!limitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
          },
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': limitResult.remaining.toString(),
            'X-RateLimit-Reset': limitResult.reset.toString(),
            'Retry-After': Math.ceil(
              (limitResult.reset - Date.now()) / 1000,
            ).toString(),
          },
        },
      );
    }

    const response = await handler(req);
    response.headers.set(
      'X-RateLimit-Remaining',
      limitResult.remaining.toString(),
    );
    response.headers.set('X-RateLimit-Reset', limitResult.reset.toString());

    return response;
  };
};

