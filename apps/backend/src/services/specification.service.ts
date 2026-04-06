import pool from '../db/connection.js';
import { ApiError } from '../utils/api-error.js';
import type { RowDataPacket } from 'mysql2';

export interface Specification {
    id: number;
    name: string;
}

export interface CreateSpecificationDto {
    name: string;
}

export const SpecificationService = {
    async getAll(page: number = 1, limit: number = 20): Promise<{ items: Specification[], total: number, page: number, limit: number }> {
        const offset = (page - 1) * limit;

        const [countResult] = await pool.query<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM specification'
        );
        const total = (countResult[0] as { total: number }).total;

        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM specification ORDER BY name ASC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        return {
            items: rows as Specification[],
            total,
            page,
            limit
        };
    },

    async getById(id: number): Promise<Specification | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM specification WHERE id = ?',
            [id]
        );

        return rows.length > 0 ? rows[0] as Specification : null;
    },

    async create(data: CreateSpecificationDto): Promise<Specification> {
        // Check for duplicate name
        const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM specification WHERE name = ?',
            [data.name]
        );

        if (existing.length > 0) {
            throw new ApiError(409, 'DUPLICATE_NAME', 'Specification with this name already exists');
        }

        const [result] = await pool.query(
            'INSERT INTO specification (name) VALUES (?)',
            [data.name]
        );

        const insertResult = result as { insertId: number };
        const specification = await this.getById(insertResult.insertId);

        if (!specification) {
            throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to create specification');
        }

        return specification;
    },

    async delete(id: number): Promise<void> {
        const existing = await this.getById(id);

        if (!existing) {
            throw new ApiError(404, 'NOT_FOUND', 'Specification not found');
        }

        // Delete associated article_specifications first
        await pool.query('DELETE FROM article_specification WHERE specification_id = ?', [id]);

        // Then delete the specification
        await pool.query('DELETE FROM specification WHERE id = ?', [id]);
    },

    async getByArticleId(articleId: number): Promise<Specification[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT s.* FROM specification s
             INNER JOIN article_specification as1 ON s.id = as1.specification_id
             WHERE as1.article_id = ?
             ORDER BY s.name ASC`,
            [articleId]
        );

        return rows as Specification[];
    }
};
