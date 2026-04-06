import { createHandler } from 'hono-file-router';
import pool from '@/db/connection.js';
import { authMiddleware, getCurrentUser } from '@/middleware/auth.js';
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

interface OrderDetailRow extends RowDataPacket {
  detail_id: number;
  article_id: number;
  quantity: number;
  unit_price: string;
  article_name: string;
  article_image_url: string | null;
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
    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
      return error(c, 'VALIDATION_ERROR', 'Invalid order ID', 400);
    }

    const [orderRows] = await pool.query<OrderRow[]>(
      'SELECT * FROM orders WHERE id = ? AND customer_id = ?',
      [id, customerId]
    );

    if (orderRows.length === 0) {
      return error(c, 'NOT_FOUND', 'Order not found', 404);
    }

    const order = orderRows[0];

    const [detailRows] = await pool.query<OrderDetailRow[]>(
      `SELECT 
        od.id as detail_id,
        od.article_id,
        od.quantity,
        od.unit_price,
        a.name as article_name,
        a.image_url as article_image_url
      FROM order_details od
      JOIN article a ON od.article_id = a.id
      WHERE od.order_id = ?`,
      [id]
    );

    return success(c, {
      id: order.id,
      invoice_no: order.invoice_no,
      customer_id: order.customer_id,
      coupon_id: order.coupon_id,
      total_amount: order.total_amount.toString(),
      shipping_cost: order.shipping_cost.toString(),
      payment_method: order.payment_method,
      status: order.status,
      order_time: order.order_time,
      tracking_number: order.tracking_number,
      carrier: order.carrier,
      estimated_delivery: order.estimated_delivery,
      cancellation_reason: order.cancellation_reason,
      cancelled_at: order.cancelled_at,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: detailRows.map(d => ({
        id: d.detail_id,
        article_id: d.article_id,
        quantity: d.quantity,
        unit_price: d.unit_price.toString(),
        article_name: d.article_name,
        image_url: d.article_image_url
      }))
    });
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as 401);
    }
    throw err;
  }
});
