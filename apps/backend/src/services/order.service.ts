import pool from '../db/connection.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';

export interface Order {
    id?: number;
    order_date?: Date;
    status: OrderStatus;
    payment_status: PaymentStatus;
    total_amount: number;
    customer_id: number;
    tracking_number?: string;
    estimated_delivery?: Date;
}

export const OrderService = {
    async getAll(): Promise<Order[]> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM orders');
        return rows as Order[];
    },

    async getById(id: number): Promise<Order | null> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM orders WHERE id = ?', [id]);
        return rows.length > 0 ? (rows[0] as Order) : null;
    },

    async getByCustomer(customerId: number): Promise<Order[]> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM orders WHERE customer_id = ? ORDER BY order_date DESC', [customerId]);
        return rows as Order[];
    },

    async create(data: { customer_id: number; total_amount?: number }): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO orders (customer_id, total_amount, status, payment_status) VALUES (?, ?, ?, ?)',
            [data.customer_id, data.total_amount || 0, 'pending', 'unpaid']
        );
        return result.insertId;
    },

    async updateStatus(id: number, status: OrderStatus): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    },

    async updatePaymentStatus(id: number, status: PaymentStatus): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE orders SET payment_status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    },

    async updateTracking(id: number, data: { tracking_number: string; carrier?: string; estimated_delivery?: Date }): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE orders SET tracking_number = ?, carrier = ?, estimated_delivery = ? WHERE id = ?',
            [data.tracking_number, data.carrier || null, data.estimated_delivery || null, id]
        );
        return result.affectedRows > 0;
    },

    async refund(id: number): Promise<boolean> {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Get order details to restore stock
            const [details] = await connection.query<RowDataPacket[]>(
                'SELECT article_id, quantity FROM order_details WHERE order_id = ?',
                [id]
            );

            // 2. Restore stock
            for (const item of details) {
                await connection.query(
                    'UPDATE article SET stock_quantity = stock_quantity + ? WHERE id = ?',
                    [item.quantity, item.article_id]
                );
            }

            // 3. Update order status
            const [result] = await connection.query<ResultSetHeader>(
                'UPDATE orders SET status = "cancelled", payment_status = "refunded" WHERE id = ?',
                [id]
            );

            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async updateTotal(id: number, total_amount: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE orders SET total_amount = ? WHERE id = ?',
            [total_amount, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM orders WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};
