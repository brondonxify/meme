import pool from '../db/connection.js';
import type { RowDataPacket } from 'mysql2';

export interface Specification {
    id?: number;
    name: string;
}

export const SpecificationService = {
    async getAll(): Promise<Specification[]> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM specification');
        return rows as Specification[];
    },

    async getByArticleId(articleId: number): Promise<Specification[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT s.* FROM specification s 
             JOIN article_specification asp ON s.id = asp.specification_id 
             WHERE asp.article_id = ?`,
            [articleId]
        );
        return rows as Specification[];
    }
};
