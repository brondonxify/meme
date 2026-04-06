import pool from '../db/connection.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { ApiError } from '../utils/api-error.js';
import { CouponService } from './coupon.service.js';

export interface OrderItem {
  article_id: number;
  quantity: number;
  unit_price: number;
}

export interface CreateOrderData {
  customer_id: number;
  items: OrderItem[];
  shipping_cost: number;
  payment_method: 'om' | 'mtn' | 'cash';
  coupon_code?: string;
}

export interface UpdateOrderData {
  customer_id?: number;
  shipping_cost?: number;
  payment_method?: 'om' | 'mtn' | 'cash';
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
}

export interface OrderRow extends RowDataPacket {
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

export interface OrderDetailRow extends RowDataPacket {
  detail_id: number;
  article_id: number;
  quantity: number;
  unit_price: string;
  article_name: string;
  article_image_url: string | null;
}

export interface OrderWithDetails {
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
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  items: {
    id: number;
    article_id: number;
    quantity: number;
    unit_price: string;
    article_name: string;
    image_url: string | null;
  }[];
}

function generateInvoiceNo(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `INV-${year}${month}${day}-${random}`;
}

export const OrderService = {
  async getAll(page: number, limit: number, status?: string): Promise<{ items: OrderRow[]; total: number }> {
    const offset = (page - 1) * limit;

    let countQuery = 'SELECT COUNT(*) as total FROM orders';
    let dataQuery = `SELECT * FROM orders`;
    const params: (string | number)[] = [];
    const dataParams: (string | number)[] = [];

    if (status) {
      countQuery += ' WHERE status = ?';
      dataQuery += ' WHERE status = ?';
      params.push(status);
      dataParams.push(status);
    }

    countQuery += ' LIMIT 1';
    dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    dataParams.push(limit, offset);

    const [countRows] = await pool.query<RowDataPacket[]>(countQuery, params);
    const total = countRows[0].total as number;

    const [dataRows] = await pool.query<OrderRow[]>(dataQuery, dataParams);

    return { items: dataRows, total };
  },

  async getById(id: number): Promise<OrderWithDetails | null> {
    const [orderRows] = await pool.query<RowDataPacket[]>(
      `SELECT o.*, c.first_name, c.last_name, c.email, c.phone 
       FROM orders o
       JOIN customer c ON o.customer_id = c.id
       WHERE o.id = ?`,
      [id]
    );

    if (orderRows.length === 0) {
      return null;
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

    return {
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
      customer: {
        first_name: order.first_name,
        last_name: order.last_name,
        email: order.email,
        phone: order.phone
      },
      items: detailRows.map(d => ({
        id: d.detail_id,
        article_id: d.article_id,
        quantity: d.quantity,
        unit_price: d.unit_price.toString(),
        article_name: d.article_name,
        image_url: d.article_image_url
      }))
    };
  },

  async create(data: CreateOrderData): Promise<OrderWithDetails> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Validate stock availability
      for (const item of data.items) {
        const [stockRows] = await connection.query<RowDataPacket[]>(
          'SELECT stock FROM article WHERE id = ? FOR UPDATE',
          [item.article_id]
        );

        if (stockRows.length === 0) {
          throw ApiError.notFound(`Article with id ${item.article_id} not found`);
        }

        const availableStock = stockRows[0].stock as number;
        if (availableStock < item.quantity) {
          throw ApiError.unprocessable(
            `Insufficient stock for article ${item.article_id}. Available: ${availableStock}, Requested: ${item.quantity}`
          );
        }
      }

      // Calculate total from items
      const itemsTotal = data.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );

      // Lookup coupon if provided
      let couponId: number | null = null;
      let discountAmount = 0;

      if (data.coupon_code) {
        const result = await CouponService.validate(data.coupon_code, itemsTotal);

        if (!result.valid) {
          throw ApiError.badRequest(`Invalid or expired coupon code. Reason: ${result.reason}`);
        }

        couponId = result.coupon.id;
        discountAmount = result.discountAmount;
      }

      const totalAmount = Math.max(0, itemsTotal - discountAmount) + data.shipping_cost;
      const invoiceNo = generateInvoiceNo();

      // Create order
      const [orderResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO orders (invoice_no, customer_id, coupon_id, total_amount, shipping_cost, payment_method)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [invoiceNo, data.customer_id, couponId, totalAmount, data.shipping_cost, data.payment_method]
      );

      const orderId = orderResult.insertId;

      // Create order details and reduce stock
      for (const item of data.items) {
        await connection.query<ResultSetHeader>(
          'INSERT INTO order_details (order_id, article_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
          [orderId, item.article_id, item.quantity, item.unit_price]
        );

        await connection.query(
          'UPDATE article SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.article_id]
        );
      }

      await connection.commit();

      // Fetch the created order with details
      const order = await this.getById(orderId);
      if (!order) {
        throw ApiError.internal('Failed to retrieve created order');
      }

      return order;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async update(id: number, data: UpdateOrderData): Promise<OrderWithDetails> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Check order exists
      const [orderRows] = await connection.query<OrderRow[]>(
        'SELECT * FROM orders WHERE id = ? FOR UPDATE',
        [id]
      );

      if (orderRows.length === 0) {
        throw ApiError.notFound('Order not found');
      }

      const existing = orderRows[0];

      const updates: string[] = [];
      const params: (string | number | null)[] = [];

      if (data.customer_id !== undefined) {
        updates.push('customer_id = ?');
        params.push(data.customer_id);
      }
      if (data.shipping_cost !== undefined) {
        updates.push('shipping_cost = ?');
        params.push(data.shipping_cost);
      }
      if (data.payment_method !== undefined) {
        updates.push('payment_method = ?');
        params.push(data.payment_method);
      }
      if (data.tracking_number !== undefined) {
        updates.push('tracking_number = ?');
        params.push(data.tracking_number);
      }
      if (data.carrier !== undefined) {
        updates.push('carrier = ?');
        params.push(data.carrier);
      }
      if (data.estimated_delivery !== undefined) {
        updates.push('estimated_delivery = ?');
        params.push(data.estimated_delivery);
      }

      if (updates.length > 0) {
        params.push(id);
        await connection.query<ResultSetHeader>(
          `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
          params
        );
      }

      await connection.commit();

      const order = await this.getById(id);
      if (!order) {
        throw ApiError.internal('Failed to retrieve updated order');
      }

      return order;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async updateStatus(id: number, status: string): Promise<OrderWithDetails> {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      throw ApiError.badRequest(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      );
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [orderRows] = await connection.query<OrderRow[]>(
        'SELECT * FROM orders WHERE id = ? FOR UPDATE',
        [id]
      );

      if (orderRows.length === 0) {
        throw ApiError.notFound('Order not found');
      }

      const updateParams: (string | number | null)[] = [status];

      if (status === 'cancelled') {
        // Restore stock
        const [detailsRows] = await connection.query<RowDataPacket[]>('SELECT article_id, quantity FROM order_details WHERE order_id = ?', [id]);
        for (const item of detailsRows) {
          await connection.query('UPDATE article SET stock = stock + ? WHERE id = ?', [item.quantity, item.article_id]);
        }

        await connection.query<ResultSetHeader>(
          'UPDATE orders SET status = ?, cancellation_reason = COALESCE(cancellation_reason, ?), cancelled_at = NOW() WHERE id = ?',
          [status, 'Cancelled by admin', id]
        );
      } else {
        await connection.query<ResultSetHeader>(
          'UPDATE orders SET status = ? WHERE id = ?',
          [status, id]
        );
      }

      await connection.commit();

      const order = await this.getById(id);
      if (!order) {
        throw ApiError.internal('Failed to retrieve updated order');
      }

      return order;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async delete(id: number): Promise<void> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM orders WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw ApiError.notFound('Order not found');
    }
  }
};
