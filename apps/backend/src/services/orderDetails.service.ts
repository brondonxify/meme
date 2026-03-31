import pool from '../db/connection.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface OrderDetail {
    order_id: number;
    article_id: number;
    quantity: number;
    unit_price: number;
}

export const OrderDetailsService = {
    async getByOrder(orderId: number): Promise<OrderDetail[]> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM order_details WHERE order_id = ?', [orderId]);
        return rows as OrderDetail[];
    },

    async getByOrderWithArticle(orderId: number): Promise<any[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT od.*, a.name as article_name, a.image_url 
             FROM order_details od 
             JOIN article a ON od.article_id = a.id 
             WHERE od.order_id = ?`,
            [orderId]
        );
        return rows;
    },

    async create(data: OrderDetail): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO order_details (order_id, article_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
            [data.order_id, data.article_id, data.quantity, data.unit_price]
        );
        return result.affectedRows > 0;
    },

    async update(orderId: number, articleId: number, data: Partial<Pick<OrderDetail, 'quantity' | 'unit_price'>>): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.quantity !== undefined) { fields.push('quantity = ?'); values.push(data.quantity); }
        if (data.unit_price !== undefined) { fields.push('unit_price = ?'); values.push(data.unit_price); }

        if (fields.length === 0) return false;

        values.push(orderId, articleId);
        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE order_details SET ${fields.join(', ')} WHERE order_id = ? AND article_id = ?`,
            values
        );
        return result.affectedRows > 0;
    },

    async delete(orderId: number, articleId: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM order_details WHERE order_id = ? AND article_id = ?',
            [orderId, articleId]
        );
        return result.affectedRows > 0;
    },

    async deleteAllForOrder(orderId: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM order_details WHERE order_id = ?', [orderId]);
        return result.affectedRows > 0;
    }
};
