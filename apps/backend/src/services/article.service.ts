import pool from '../db/connection.js';
import { ApiError } from '../utils/api-error.js';
import type { RowDataPacket } from 'mysql2';

export interface Article {
    id: number;
    name: string;
    slug: string;
    sku: string;
    description: string | null;
    long_description: string | null;
    category_id: number;
    image_url: string | null;
    cost_price: number;
    selling_price: number;
    stock: number;
    min_stock_threshold: number;
    published: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface ArticleFAQ {
    id: number;
    question: string;
    answer: string;
}

export interface ArticleReview {
    id: number;
    user: string;
    content: string;
    rating: number;
    date: Date;
}

export interface ArticleWithExtras extends Article {
    specifications: { id: number; name: string }[];
    faqs: ArticleFAQ[];
    reviews: ArticleReview[];
}

export interface CreateArticleDto {
    name: string;
    slug?: string;
    sku: string;
    description?: string;
    long_description?: string;
    category_id: number;
    image_url?: string;
    cost_price: number;
    selling_price: number;
    stock?: number;
    min_stock_threshold?: number;
    published?: boolean;
    specification_ids?: number[];
    faqs?: { question: string; answer: string }[];
}

export interface UpdateArticleDto {
    name?: string;
    slug?: string;
    sku?: string;
    description?: string;
    long_description?: string;
    category_id?: number;
    image_url?: string;
    cost_price?: number;
    selling_price?: number;
    stock?: number;
    min_stock_threshold?: number;
    published?: boolean;
    specification_ids?: number[];
    faqs?: { id?: number; question: string; answer: string }[];
}

function generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const ArticleService = {
    async getAll(page: number = 1, limit: number = 20, categoryId?: number, search?: string, sort?: string, minPrice?: number, maxPrice?: number, category?: string): Promise<{ items: Article[], total: number, page: number, limit: number }> {
        const offset = (page - 1) * limit;

        let countQuery = 'SELECT COUNT(DISTINCT a.id) as total FROM article a LEFT JOIN category c ON a.category_id = c.id';
        let query = `
            SELECT a.*, c.name as category_name, c.slug as category_slug
            FROM article a 
            LEFT JOIN category c ON a.category_id = c.id
        `;
        let whereClauses = [];
        const params: (number | string)[] = [];

        if (categoryId) {
            whereClauses.push('a.category_id = ?');
            params.push(categoryId);
        }
        if (category) {
            whereClauses.push('(c.name = ? OR c.slug = ?)');
            params.push(category, category);
        }
        if (search) {
            whereClauses.push('(a.name LIKE ? OR a.description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }
        if (minPrice !== undefined) {
            whereClauses.push('a.selling_price >= ?');
            params.push(minPrice);
        }
        if (maxPrice !== undefined) {
            whereClauses.push('a.selling_price <= ?');
            params.push(maxPrice);
        }

        if (whereClauses.length > 0) {
            const whereString = ' WHERE ' + whereClauses.join(' AND ');
            countQuery += whereString;
            query += whereString;
        }

        const [countResult] = await pool.query<RowDataPacket[]>(countQuery, params);
        const total = (countResult[0] as { total: number }).total;

        // Sorting
        if (sort === 'newest') query += ' ORDER BY a.created_at DESC';
        else if (sort === 'low_price') query += ' ORDER BY a.selling_price ASC';
        else if (sort === 'high_price') query += ' ORDER BY a.selling_price DESC';
        else query += ' ORDER BY a.created_at DESC';

        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await pool.query<RowDataPacket[]>(query, params);

        return {
            items: rows as Article[],
            total,
            page,
            limit
        };
    },

    async getById(id: number): Promise<ArticleWithExtras | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM article WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return null;
        }

        const article = rows[0] as Article;

        // Get specifications
        const [specRows] = await pool.query<RowDataPacket[]>(
            `SELECT s.id, s.name 
             FROM specification s 
             INNER JOIN article_specification a ON s.id = a.specification_id 
             WHERE a.article_id = ?`,
            [id]
        );

        // Get FAQs
        const [faqRows] = await pool.query<RowDataPacket[]>(
            'SELECT id, question, answer FROM article_faq WHERE article_id = ?',
            [id]
        );

        // Get Reviews
        const [reviewRows] = await pool.query<RowDataPacket[]>(
            'SELECT id, user_name as user, content, rating, date FROM article_review WHERE article_id = ? ORDER BY date DESC',
            [id]
        );

        return {
            ...article,
            specifications: specRows as { id: number; name: string }[],
            faqs: faqRows as ArticleFAQ[],
            reviews: reviewRows as ArticleReview[]
        };
    },

    async getBySlug(slug: string): Promise<ArticleWithExtras | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM article WHERE slug = ?',
            [slug]
        );

        if (rows.length === 0) {
            return null;
        }

        const article = rows[0] as Article;

        // Get specifications
        const [specRows] = await pool.query<RowDataPacket[]>(
            `SELECT s.id, s.name 
             FROM specification s 
             INNER JOIN article_specification a ON s.id = a.specification_id 
             WHERE a.article_id = ?`,
            [article.id]
        );

        // Get FAQs
        const [faqRows] = await pool.query<RowDataPacket[]>(
            'SELECT id, question, answer FROM article_faq WHERE article_id = ?',
            [article.id]
        );

        // Get Reviews
        const [reviewRows] = await pool.query<RowDataPacket[]>(
            'SELECT id, user_name as user, content, rating, date FROM article_review WHERE article_id = ? ORDER BY date DESC',
            [article.id]
        );

        return {
            ...article,
            specifications: specRows as { id: number; name: string }[],
            faqs: faqRows as ArticleFAQ[],
            reviews: reviewRows as ArticleReview[]
        };
    },

    async create(data: CreateArticleDto): Promise<Article> {
        const slug = data.slug || generateSlug(data.name);

        const [existingSlug] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM article WHERE slug = ?',
            [slug]
        );

        if (existingSlug.length > 0) {
            throw new ApiError(409, 'DUPLICATE_SLUG', 'Article with this slug already exists');
        }

        const [existingSku] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM article WHERE sku = ?',
            [data.sku]
        );

        if (existingSku.length > 0) {
            throw new ApiError(409, 'DUPLICATE_SKU', 'Article with this SKU already exists');
        }

        const [category] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM category WHERE id = ?',
            [data.category_id]
        );

        if (category.length === 0) {
            throw new ApiError(400, 'INVALID_CATEGORY', 'Category does not exist');
        }

        const [result] = await pool.query(
            `INSERT INTO article (name, slug, sku, description, long_description, category_id, image_url, cost_price, selling_price, stock, min_stock_threshold, published) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.name,
                slug,
                data.sku,
                data.description || null,
                data.long_description || null,
                data.category_id,
                data.image_url || null,
                data.cost_price || 0,
                data.selling_price,
                data.stock || 0,
                data.min_stock_threshold || 5,
                data.published !== undefined ? data.published : true
            ]
        );

        const insertResult = result as { insertId: number };
        
        // Add specifications if provided
        if (data.specification_ids && data.specification_ids.length > 0) {
            for (const specId of data.specification_ids) {
                await pool.query(
                    'INSERT INTO article_specification (article_id, specification_id) VALUES (?, ?)',
                    [insertResult.insertId, specId]
                );
            }
        }

        // Add FAQs if provided
        if (data.faqs && data.faqs.length > 0) {
            for (const faq of data.faqs) {
                await pool.query(
                    'INSERT INTO article_faq (article_id, question, answer) VALUES (?, ?, ?)',
                    [insertResult.insertId, faq.question, faq.answer]
                );
            }
        }

        const article = await this.getById(insertResult.insertId);
        if (!article) throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to retrieve created article');
        return article;
    },

    async update(id: number, data: UpdateArticleDto): Promise<Article> {
        const existing = await this.getById(id) as Article | null;
        if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Article not found');

        const slug = data.slug || (data.name ? generateSlug(data.name) : existing.slug);

        if (slug !== existing.slug) {
            const [duplicateSlug] = await pool.query<RowDataPacket[]>(
                'SELECT id FROM article WHERE slug = ? AND id != ?',
                [slug, id]
            );
            if (duplicateSlug.length > 0) throw new ApiError(409, 'DUPLICATE_SLUG', 'Article slug already exists');
        }

        if (data.sku && data.sku !== existing.sku) {
            const [duplicateSku] = await pool.query<RowDataPacket[]>(
                'SELECT id FROM article WHERE sku = ? AND id != ?',
                [data.sku, id]
            );
            if (duplicateSku.length > 0) throw new ApiError(409, 'DUPLICATE_SKU', 'Article SKU already exists');
        }

        await pool.query(
            `UPDATE article SET 
                name = ?, slug = ?, sku = ?, description = ?, long_description = ?, category_id = ?, 
                image_url = ?, cost_price = ?, selling_price = ?, stock = ?, min_stock_threshold = ?, published = ? 
             WHERE id = ?`,
            [
                data.name || existing.name, slug, data.sku || existing.sku,
                data.description !== undefined ? data.description : existing.description,
                data.long_description !== undefined ? data.long_description : existing.long_description,
                data.category_id || existing.category_id,
                data.image_url !== undefined ? data.image_url : existing.image_url,
                data.cost_price !== undefined ? data.cost_price : existing.cost_price,
                data.selling_price !== undefined ? data.selling_price : existing.selling_price,
                data.stock !== undefined ? data.stock : existing.stock,
                data.min_stock_threshold !== undefined ? data.min_stock_threshold : existing.min_stock_threshold,
                data.published !== undefined ? data.published : existing.published,
                id
            ]
        );

        if (data.specification_ids !== undefined) {
            await pool.query('DELETE FROM article_specification WHERE article_id = ?', [id]);
            for (const specId of data.specification_ids) {
                await pool.query('INSERT INTO article_specification (article_id, specification_id) VALUES (?, ?)', [id, specId]);
            }
        }

        if (data.faqs !== undefined) {
            await pool.query('DELETE FROM article_faq WHERE article_id = ?', [id]);
            for (const faq of data.faqs) {
                await pool.query('INSERT INTO article_faq (article_id, question, answer) VALUES (?, ?, ?)', [id, faq.question, faq.answer]);
            }
        }

        const article = await this.getById(id);
        if (!article) throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to retrieve updated article');
        return article;
    },

    async delete(id: number): Promise<void> {
        const existing = await this.getById(id);
        if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Article not found');
        await pool.query('DELETE FROM article WHERE id = ?', [id]);
    },

    async addReview(articleId: number, user: string, content: string, rating: number): Promise<ArticleReview> {
        const [result] = await pool.query(
            'INSERT INTO article_review (article_id, user_name, content, rating) VALUES (?, ?, ?, ?)',
            [articleId, user, content, rating]
        );
        const insertId = (result as { insertId: number }).insertId;
        return {
            id: insertId,
            user,
            content,
            rating,
            date: new Date()
        };
    }
};