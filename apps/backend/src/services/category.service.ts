import pool from '../db/connection.js';
import { ApiError } from '../utils/api-error.js';
import type { RowDataPacket } from 'mysql2';

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    published: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateCategoryDto {
    name: string;
    slug?: string;
    description?: string;
    image_url?: string;
    published?: boolean;
}

export interface UpdateCategoryDto {
    name?: string;
    slug?: string;
    description?: string;
    image_url?: string;
    published?: boolean;
}

function generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const CategoryService = {
    async getAll(page: number = 1, limit: number = 20): Promise<{ items: Category[], total: number, page: number, limit: number }> {
        const offset = (page - 1) * limit;

        const [countResult] = await pool.query<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM category'
        );
        const total = (countResult[0] as { total: number }).total;

        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM category ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        return {
            items: rows as Category[],
            total,
            page,
            limit
        };
    },

    async getById(id: number): Promise<Category | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM category WHERE id = ?',
            [id]
        );

        return rows.length > 0 ? rows[0] as Category : null;
    },

    async create(data: CreateCategoryDto): Promise<Category> {
        const slug = data.slug || generateSlug(data.name);

        // Check for duplicate slug
        const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM category WHERE slug = ?',
            [slug]
        );

        if (existing.length > 0) {
            throw new ApiError(409, 'DUPLICATE_SLUG', 'Category with this slug already exists');
        }

        const [result] = await pool.query(
            `INSERT INTO category (name, slug, description, image_url, published) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                data.name,
                slug,
                data.description || null,
                data.image_url || null,
                data.published !== undefined ? data.published : true
            ]
        );

        const insertResult = result as { insertId: number };
        const category = await this.getById(insertResult.insertId);

        if (!category) {
            throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to create category');
        }

        return category;
    },

    async update(id: number, data: UpdateCategoryDto): Promise<Category> {
        const existing = await this.getById(id);

        if (!existing) {
            throw new ApiError(404, 'NOT_FOUND', 'Category not found');
        }

        const slug = data.slug || (data.name ? generateSlug(data.name) : existing.slug);

        // Check for duplicate slug (excluding current category)
        if (slug !== existing.slug) {
            const [duplicate] = await pool.query<RowDataPacket[]>(
                'SELECT id FROM category WHERE slug = ? AND id != ?',
                [slug, id]
            );

            if (duplicate.length > 0) {
                throw new ApiError(409, 'DUPLICATE_SLUG', 'Category with this slug already exists');
            }
        }

        await pool.query(
            `UPDATE category SET name = ?, slug = ?, description = ?, image_url = ?, published = ? 
             WHERE id = ?`,
            [
                data.name || existing.name,
                slug,
                data.description !== undefined ? data.description : existing.description,
                data.image_url !== undefined ? data.image_url : existing.image_url,
                data.published !== undefined ? data.published : existing.published,
                id
            ]
        );

        const category = await this.getById(id);

        if (!category) {
            throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to update category');
        }

        return category;
    },

    async delete(id: number): Promise<void> {
        const existing = await this.getById(id);

        if (!existing) {
            throw new ApiError(404, 'NOT_FOUND', 'Category not found');
        }

        // Check for associated products (reject if any exist)
        const [products] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM article WHERE category_id = ?',
            [id]
        );

        if (products.length > 0) {
            throw new ApiError(400, 'CATEGORY_IN_USE', 'Cannot delete category: products are still referencing it');
        }

        await pool.query('DELETE FROM category WHERE id = ?', [id]);
    }
};
