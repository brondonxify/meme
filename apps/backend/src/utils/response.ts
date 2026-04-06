import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * Standard API response type
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Success response helper
 * Returns a standardized success response
 */
export function success<T>(c: Context, data: T, statusCode: ContentfulStatusCode = 200): Response {
  const response: ApiResponse<T> = {
    success: true,
    data
  };

  return c.json(response, statusCode);
}

/**
 * Error response helper
 * Returns a standardized error response
 */
export function error(
  c: Context,
  code: string,
  message: string,
  statusCode: ContentfulStatusCode = 400
): Response {
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code,
      message
    }
  };

  return c.json(response, statusCode);
}

/**
 * Created response helper (201)
 */
export function created<T>(c: Context, data: T): Response {
  return success(c, data, 201);
}

/**
 * No Content response helper (204)
 */
export function noContent(c: Context): Response {
  return c.body(null, 204);
}

/**
 * Not Found response helper
 */
export function notFound(c: Context, message = 'Resource not found'): Response {
  return error(c, 'NOT_FOUND', message, 404);
}

/**
 * Unauthorized response helper
 */
export function unauthorized(c: Context, message = 'Unauthorized'): Response {
  return error(c, 'UNAUTHORIZED', message, 401);
}

/**
 * Forbidden response helper
 */
export function forbidden(c: Context, message = 'Forbidden'): Response {
  return error(c, 'FORBIDDEN', message, 403);
}

/**
 * Internal Error response helper
 */
export function internalError(c: Context, message = 'Internal server error'): Response {
  return error(c, 'INTERNAL_ERROR', message, 500);
}