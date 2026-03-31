import pool from '../db/connection.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Article {
    id?: number;
    name: string;
    description?: string;
    price: number;
    stock_quantity: number;
    image_url?: string;
    category_id: number;
    created_at?: Date;
}

export const ArticleService = {
    async getAll(filters?: { category?: number; search?: string, specs?: number[] }): Promise<Article[]> {
        let query = 'SELECT DISTINCT a.* FROM article a';
        const params: any[] = [];
        const joins: string[] = [];
        const conditions: string[] = ['1=1'];

        if (filters?.category) {
            conditions.push('a.category_id = ?');
            params.push(filters.category);
        }

        if (filters?.search) {
            conditions.push('(a.name LIKE ? OR a.description LIKE ?)');
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (filters?.specs && filters.specs.length > 0) {
            joins.push('JOIN article_specification asp ON a.id = asp.article_id');
            conditions.push(`asp.specification_id IN (${filters.specs.map(() => '?').join(',')})`);
            params.push(...filters.specs);
        }

        const finalQuery = `${query} ${joins.join(' ')} WHERE ${conditions.join(' AND ')}`;
        const [rows] = await pool.query<RowDataPacket[]>(finalQuery, params);
        return rows as Article[];
    },

    async getById(id: number): Promise<Article | null> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM article WHERE id = ?', [id]);
        return rows.length > 0 ? (rows[0] as Article) : null;
    },

    async getByCategory(categoryId: number): Promise<Article[]> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM article WHERE category_id = ?', [categoryId]);
        return rows as Article[];
    },

    async create(data: Omit<Article, 'id' | 'created_at'>): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO article (name, description, price, stock_quantity, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?)',
            [data.name, data.description || null, data.price, data.stock_quantity || 0, data.image_url || null, data.category_id]
        );
        return result.insertId;
    },

    async update(id: number, data: Partial<Omit<Article, 'id' | 'created_at'>>): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.name) { fields.push('name = ?'); values.push(data.name); }
        if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
        if (data.price !== undefined) { fields.push('price = ?'); values.push(data.price); }
        if (data.stock_quantity !== undefined) { fields.push('stock_quantity = ?'); values.push(data.stock_quantity); }
        if (data.image_url !== undefined) { fields.push('image_url = ?'); values.push(data.image_url); }
        if (data.category_id !== undefined) { fields.push('category_id = ?'); values.push(data.category_id); }

        if (fields.length === 0) return false;

        values.push(id);
        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE article SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result.affectedRows > 0;
    },

    async delete(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM article WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    async updateStock(id: number, quantity: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE article SET stock_quantity = stock_quantity + ? WHERE id = ?',
            [quantity, id]
        );
        return result.affectedRows > 0;
    }
};
