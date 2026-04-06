import type { Context, Next } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { ApiError } from '@/utils/api-error.js';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export async function errorHandler(c: Context, next: Next): Promise<Response | void> {
  try {
    await next();
  } catch (error) {
    const requestId = c.get('requestId') || 'unknown';
    const path = c.req.path;
    const method = c.req.method;

    let response: ErrorResponse;
    let statusCode: ContentfulStatusCode = 500;

    if (error instanceof ApiError) {
      response = {
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      };

      console.error(`[ERROR] ${error.code}: ${error.message}`, {
        requestId,
        path,
        method,
        statusCode: error.statusCode
      });

      statusCode = error.statusCode as ContentfulStatusCode;
    } else if (error instanceof Error) {
      response = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: process.env.NODE_ENV === 'development' 
            ? error.message 
            : 'An unexpected error occurred'
        }
      };

      console.error(`[ERROR] ${error.name}: ${error.message}`, {
        requestId,
        path,
        method,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });

      statusCode = 500;
    } else {
      response = {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred'
        }
      };

      console.error(`[ERROR] Unknown error:`, {
        requestId,
        path,
        method,
        error
      });

      statusCode = 500;
    }

    c.header('X-Request-Id', requestId);

    return c.json(response, statusCode);
  }
}