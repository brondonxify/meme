import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import { authMiddleware } from '@/middleware/auth.js';
import { OrderService } from '@/services/order.service.js';
import { success, error } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

const updateOrderSchema = z.object({
  customer_id: z.number().int().min(1).optional(),
  shipping_cost: z.number().min(0).optional(),
  payment_method: z.enum(['om', 'mtn', 'cash']).optional(),
  tracking_number: z.string().max(100).optional(),
  carrier: z.string().max(100).optional(),
  estimated_delivery: z.string().date().optional()
});

export default createHandler(async (c) => {
  try {
    const authFn = authMiddleware('admin');
    await authFn(c, async () => {});

    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
      return error(c, 'VALIDATION_ERROR', 'Invalid order ID', 400);
    }

    const body = await c.req.json();
    const parsed = updateOrderSchema.parse(body);

    const order = await OrderService.update(id, parsed);

    return success(c, order);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as 401);
    }
    if (err instanceof z.ZodError) {
      return error(c, 'VALIDATION_ERROR', err.errors[0].message, 400);
    }
    throw err;
  }
});
