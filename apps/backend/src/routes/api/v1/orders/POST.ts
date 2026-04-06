import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import { OrderService } from '@/services/order.service.js';
import { success, error } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { authMiddleware, getCurrentUser, type AuthUser } from '@/middleware/auth.js';

const createOrderSchema = z.object({
  customer_id: z.number().int().min(1).optional(),
  items: z.array(z.object({
    article_id: z.number().int().min(1),
    quantity: z.number().int().min(1),
    unit_price: z.number().min(0)
  })).min(1),
  shipping_cost: z.number().min(0).default(0),
  payment_method: z.enum(['om', 'mtn', 'cash']),
  coupon_code: z.string().optional()
});

export default createHandler(async (c) => {
  let user: AuthUser | undefined = undefined;

  // Try to authenticate optionally - if auth fails, user remains undefined
  try {
    const authHandler = authMiddleware();
    await authHandler(c, async () => {});
    user = getCurrentUser(c);
  } catch {
    // Auth failed, user remains undefined - continue without authentication
    user = undefined;
  }

  try {
    const body = await c.req.json();
    const parsed = createOrderSchema.parse(body);

    let customerId: number;

    if (user && user.type === 'customer') {
      // Customer is authenticated - use their JWT id
      customerId = user.id;
    } else if (user && user.type === 'admin') {
      // Admin is authenticated - use customer_id from body
      if (!parsed.customer_id) {
        return error(c, 'VALIDATION_ERROR', 'customer_id is required for admin orders', 400);
      }
      customerId = parsed.customer_id;
    } else {
      // Not authenticated - require customer_id in body
      if (!parsed.customer_id) {
        return error(c, 'VALIDATION_ERROR', 'customer_id is required', 400);
      }
      customerId = parsed.customer_id;
    }

    const orderData = {
      ...parsed,
      customer_id: customerId
    };

    const order = await OrderService.create(orderData);

    return success(c, order, 201);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as ContentfulStatusCode);
    }
    if (err instanceof z.ZodError) {
      return error(c, 'VALIDATION_ERROR', err.errors[0].message, 400);
    }
    throw err;
  }
});
