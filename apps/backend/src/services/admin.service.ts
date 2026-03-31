import pool from '../db/connection.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Admin {
    id?: number;
    username: string;
    email: string;
    password: string;
    created_at?: Date;
}

export const AdminService = {
    async getAll(): Promise<Admin[]> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM admin');
        return rows as Admin[];
    },

    async getById(id: number): Promise<Admin | null> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM admin WHERE id = ?', [id]);
        return rows.length > 0 ? (rows[0] as Admin) : null;
    },

    async getByEmail(email: string): Promise<Admin | null> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM admin WHERE email = ?', [email]);
        return rows.length > 0 ? (rows[0] as Admin) : null;
    },

    async create(data: Omit<Admin, 'id' | 'created_at'>): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO admin (username, email, password) VALUES (?, ?, ?)',
            [data.username, data.email, data.password]
        );
        return result.insertId;
    },

    async update(id: number, data: Partial<Omit<Admin, 'id' | 'created_at'>>): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.username) { fields.push('username = ?'); values.push(data.username); }
        if (data.email) { fields.push('email = ?'); values.push(data.email); }
        if (data.password) { fields.push('password = ?'); values.push(data.password); }

        if (fields.length === 0) return false;

        values.push(id);
        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE admin SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result.affectedRows > 0;
    },

    async delete(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM admin WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    async getDashboardStats() {
        // 1. Total Revenue
        const [revenueRow] = await pool.query<RowDataPacket[]>('SELECT SUM(total_amount) as total FROM orders WHERE status != "cancelled" AND payment_status = "paid"');

        // 2. Active Orders (Pending + Shipped)
        const [activeOrdersRow] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM orders WHERE status IN ("pending", "shipped")');

        // 3. New Customers (Registered in the last 30 days)
        const [customersRow] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM customer');

        // 4. Low Stock Units (Stock < 5)
        const [stockAlertsRow] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM article WHERE stock_quantity < 5');

        return {
            totalRevenue: revenueRow[0].total || 0,
            activeOrders: activeOrdersRow[0].count || 0,
            totalCustomers: customersRow[0].count || 0,
            stockAlerts: stockAlertsRow[0].count || 0
        };
    }
};
