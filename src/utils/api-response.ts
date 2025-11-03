import { NextResponse } from 'next/server';
import { handleError } from './error-handler';

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  timestamp: string;
};

export const createSuccessResponse = <T>(
  data: T,
  statusCode: number = 200,
): NextResponse<ApiResponse<T>> => {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode },
  );
};

export const createErrorResponse = (
  error: unknown,
  statusCode?: number,
): NextResponse<ApiResponse> => {
  const handledError = handleError(error);
  
  return NextResponse.json(
    {
      success: false,
      error: {
        message: handledError.message,
        code: handledError.code,
      },
      timestamp: new Date().toISOString(),
    },
    { status: statusCode || handledError.statusCode },
  );
};

