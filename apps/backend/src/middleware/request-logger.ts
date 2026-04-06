import type { Context, Next } from 'hono';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID middleware
 * Generates a UUID for each request and adds it to the context
 */
export async function requestIdMiddleware(c: Context, next: Next): Promise<void> {
  // Generate or extract request ID
  const requestId = c.req.header('X-Request-Id') || uuidv4();

  // Store request ID in context
  c.set('requestId', requestId);

  // Add request ID to response headers
  c.header('X-Request-Id', requestId);

  await next();
}

/**
 * Request logger middleware with timing
 */
export async function requestLogger(c: Context, next: Next): Promise<void> {
  const start = Date.now();
  const requestId = c.get('requestId') || 'unknown';
  const method = c.req.method;
  const path = c.req.path;

  // Log incoming request
  console.log(`[REQUEST] ${method} ${path}`, {
    requestId,
    timestamp: new Date().toISOString()
  });

  await next();

  // Calculate duration
  const duration = Date.now() - start;

  // Log response
  const status = c.res.status;
  console.log(`[RESPONSE] ${method} ${path} ${status}`, {
    requestId,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString()
  });
}