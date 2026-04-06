import { createHandler } from 'hono-file-router';
import { authMiddleware } from '@/middleware/auth.js';
import pool from '@/db/connection.js';
import { success, error } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';
import type { RowDataPacket } from 'mysql2';

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
  cancellation_reason: string | null;
  cancelled_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export default createHandler(async (c) => {
  try {
    const authFn = authMiddleware('admin');
    await authFn(c, async () => {});

    const customerId = parseInt(c.req.param('id'), 10);

    if (isNaN(customerId)) {
      return error(c, 'INVALID_ID', 'Invalid customer ID', 400);
    }

    const [rows] = await pool.query<OrderRow[]>(
      'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC',
      [customerId]
    );

    return success(c, { items: rows, total: rows.length });
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as 400);
    }
    throw err;
  }
});