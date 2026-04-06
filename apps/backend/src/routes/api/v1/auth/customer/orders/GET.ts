import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import pool from '@/db/connection.js';
import { authMiddleware, getCurrentUser } from '@/middleware/auth.js';
import { success, error } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';
import type { RowDataPacket } from 'mysql2';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

interface OrderRow extends RowDataPacket {
  id: number;
  invoice_no: string;
  customer_id: number;
  coupon_id: number | null;
  total_amount: string;
  shipping_cost: string;
  payment_method: string;
  status: string;
  order_time: Date;
  tracking_number: string | null;
  carrier: string | null;
  estimated_delivery: Date | null;
  created_at: Date;
  updated_at: Date;
}

export default createHandler(async (c) => {
  try {
    const authFn = authMiddleware();
    await authFn(c, async () => {});
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as 401);
    }
    throw err;
  }

  try {
    const user = getCurrentUser(c);

    if (!user || user.type !== 'customer') {
      return error(c, 'UNAUTHORIZED', 'Not authenticated as customer', 401);
    }

    const customerId = user.id;
    const parsed = querySchema.parse(c.req.query());
    const { page, limit } = parsed;
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM orders WHERE customer_id = ?',
      [customerId]
    );
    const total = countRows[0].total as number;

    const [orderRows] = await pool.query<OrderRow[]>(
      'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [customerId, limit, offset]
    );

    return success(c, {
      items: orderRows,
      total,
      page,
      limit
    });
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
