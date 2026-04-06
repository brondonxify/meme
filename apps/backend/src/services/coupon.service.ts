import pool from '../db/connection.js';
import { ApiError } from '../utils/api-error.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Coupon {
    id: number;
    campaign_name: string;
    code: string;
    image_url: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    start_date: Date;
    end_date: Date;
    published: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateCouponDto {
    campaign_name: string;
    code: string;
    image_url?: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    start_date: string;
    end_date: string;
    published?: boolean;
}

export interface UpdateCouponDto {
    campaign_name?: string;
    code?: string;
    image_url?: string;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    start_date?: string;
    end_date?: string;
    published?: boolean;
}

export type ValidateResult =
    | { valid: true; coupon: Coupon; discountAmount: number }
    | { valid: false; reason: string };

export const CouponService = {
    async getAll(page: number = 1, limit: number = 20): Promise<{ items: Coupon[], total: number }> {
        const offset = (page - 1) * limit;

        const [countResult] = await pool.query<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM coupon'
        );
        const total = (countResult[0] as { total: number }).total;

        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM coupon ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        return {
            items: rows as Coupon[],
            total
        };
    },

    async getById(id: number): Promise<Coupon | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM coupon WHERE id = ?',
            [id]
        );

        return rows.length > 0 ? rows[0] as Coupon : null;
    },

    async getByCode(code: string): Promise<Coupon | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM coupon WHERE code = ?',
            [code.toUpperCase()]
        );

        return rows.length > 0 ? rows[0] as Coupon : null;
    },

    async create(data: CreateCouponDto): Promise<Coupon> {
        const code = data.code.toUpperCase();

        // Check for duplicate code
        const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM coupon WHERE code = ?',
            [code]
        );

        if (existing.length > 0) {
            throw new ApiError(409, 'DUPLICATE_CODE', 'Coupon with this code already exists');
        }

        // Convert ISO dates to MySQL format
        const startDate = new Date(data.start_date).toISOString().slice(0, 19).replace('T', ' ');
        const endDate = new Date(data.end_date).toISOString().slice(0, 19).replace('T', ' ');

        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO coupon (campaign_name, code, image_url, discount_type, discount_value, start_date, end_date, published)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.campaign_name,
                code,
                data.image_url || null,
                data.discount_type,
                data.discount_value,
                startDate,
                endDate,
                data.published !== undefined ? data.published : true
            ]
        );

        const coupon = await this.getById(result.insertId);

        if (!coupon) {
            throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to create coupon');
        }

        return coupon;
    },

    async update(id: number, data: UpdateCouponDto): Promise<Coupon> {
        const existing = await this.getById(id);

        if (!existing) {
            throw new ApiError(404, 'NOT_FOUND', 'Coupon not found');
        }

        const code = data.code ? data.code.toUpperCase() : existing.code;

        // Check for duplicate code (excluding current coupon)
        if (code !== existing.code) {
            const [duplicate] = await pool.query<RowDataPacket[]>(
                'SELECT id FROM coupon WHERE code = ? AND id != ?',
                [code, id]
            );

            if (duplicate.length > 0) {
                throw new ApiError(409, 'DUPLICATE_CODE', 'Coupon with this code already exists');
            }
        }

        await pool.query(
            `UPDATE coupon SET
                campaign_name = ?,
                code = ?,
                image_url = ?,
                discount_type = ?,
                discount_value = ?,
                start_date = ?,
                end_date = ?,
                published = ?
             WHERE id = ?`,
            [
                data.campaign_name ?? existing.campaign_name,
                code,
                data.image_url !== undefined ? data.image_url : existing.image_url,
                data.discount_type ?? existing.discount_type,
                data.discount_value ?? existing.discount_value,
                data.start_date ?? existing.start_date,
                data.end_date ?? existing.end_date,
                data.published !== undefined ? data.published : existing.published,
                id
            ]
        );

        const coupon = await this.getById(id);

        if (!coupon) {
            throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to update coupon');
        }

        return coupon;
    },

    async delete(id: number): Promise<void> {
        const existing = await this.getById(id);

        if (!existing) {
            throw new ApiError(404, 'NOT_FOUND', 'Coupon not found');
        }

        await pool.query('DELETE FROM coupon WHERE id = ?', [id]);
    },

    async validate(code: string, totalAmount: number): Promise<ValidateResult> {
        const coupon = await this.getByCode(code);

        if (!coupon) {
            return { valid: false, reason: 'Coupon not found' };
        }

        if (!coupon.published) {
            return { valid: false, reason: 'Coupon is not active' };
        }

        const now = new Date();
        const startDate = new Date(coupon.start_date);
        const endDate = new Date(coupon.end_date);

        if (now < startDate) {
            return { valid: false, reason: 'Coupon has not started yet' };
        }

        if (now > endDate) {
            return { valid: false, reason: 'Coupon has expired' };
        }

        let discountAmount: number;

        if (coupon.discount_type === 'percentage') {
            discountAmount = totalAmount * (coupon.discount_value / 100);
        } else {
            discountAmount = Math.min(coupon.discount_value, totalAmount);
        }

        return { valid: true, coupon, discountAmount };
    }
};
