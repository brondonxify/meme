import pool from '../db/connection.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Customer {
    id?: number;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    created_at?: Date;
}

export const CustomerService = {
    async getAll(): Promise<Customer[]> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM customer');
        return rows as Customer[];
    },

    async getById(id: number): Promise<Customer | null> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM customer WHERE id = ?', [id]);
        return rows.length > 0 ? (rows[0] as Customer) : null;
    },

    async getByEmail(email: string): Promise<Customer | null> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM customer WHERE email = ?', [email]);
        return rows.length > 0 ? (rows[0] as Customer) : null;
    },

    async create(data: Omit<Customer, 'id' | 'created_at'>): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO customer (first_name, last_name, email, password, phone, address, city, postal_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [data.first_name, data.last_name, data.email, data.password, data.phone || null, data.address || null, data.city || null, data.postal_code || null]
        );
        return result.insertId;
    },

    async update(id: number, data: Partial<Omit<Customer, 'id' | 'created_at'>>): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.first_name) { fields.push('first_name = ?'); values.push(data.first_name); }
        if (data.last_name) { fields.push('last_name = ?'); values.push(data.last_name); }
        if (data.email) { fields.push('email = ?'); values.push(data.email); }
        if (data.password) { fields.push('password = ?'); values.push(data.password); }
        if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
        if (data.address !== undefined) { fields.push('address = ?'); values.push(data.address); }
        if (data.city !== undefined) { fields.push('city = ?'); values.push(data.city); }
        if (data.postal_code !== undefined) { fields.push('postal_code = ?'); values.push(data.postal_code); }

        if (fields.length === 0) return false;

        values.push(id);
        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE customer SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result.affectedRows > 0;
    },

    async delete(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM customer WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};
