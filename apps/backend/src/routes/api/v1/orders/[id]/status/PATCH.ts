import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import { authMiddleware } from '@/middleware/auth.js';
import { OrderService } from '@/services/order.service.js';
import { success, error } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

const statusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
});

export default createHandler(async (c) => {
  try {
    const authFn = authMiddleware('admin');
    await authFn(c, async () => {});

    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
      return error(c, 'VALIDATION_ERROR', 'Invalid order ID', 400);
    }

    let body;
    try {
      body = await c.req.json();
    } catch (e) {
      return error(c, 'VALIDATION_ERROR', 'Missing or invalid JSON body', 400);
    }
    
    const parsed = statusSchema.parse(body);

    const order = await OrderService.updateStatus(id, parsed.status);

    return success(c, order);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as any);
    }
    if (err instanceof z.ZodError) {
      return error(c, 'VALIDATION_ERROR', err.errors[0].message, 400);
    }
    throw err;
  }
});
