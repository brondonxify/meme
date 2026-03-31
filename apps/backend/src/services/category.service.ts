import pool from '../db/connection.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Category {
    id?: number;
    name: string;
    description?: string;
}

export const CategoryService = {
    async getAll(): Promise<Category[]> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM category');
        return rows as Category[];
    },

    async getById(id: number): Promise<Category | null> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM category WHERE id = ?', [id]);
        return rows.length > 0 ? (rows[0] as Category) : null;
    },

    async create(data: Omit<Category, 'id'>): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO category (name, description) VALUES (?, ?)',
            [data.name, data.description || null]
        );
        return result.insertId;
    },

    async update(id: number, data: Partial<Omit<Category, 'id'>>): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.name) { fields.push('name = ?'); values.push(data.name); }
        if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }

        if (fields.length === 0) return false;

        values.push(id);
        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE category SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result.affectedRows > 0;
    },

    async delete(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM category WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};
