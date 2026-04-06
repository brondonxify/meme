import pool from '../db/connection.js';
import { ApiError } from '../utils/api-error.js';
import type { RowDataPacket } from 'mysql2';

export interface Staff {
    id: number;
    email: string;
    name: string;
    phone: string | null;
    image_url: string | null;
    role_id: number;
    joining_date: Date;
    published: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface StaffRole {
    id: number;
    name: string;
    display_name: string;
    is_default: boolean;
}

export interface CreateStaffDto {
    email: string;
    name: string;
    phone?: string;
    image_url?: string;
    role_id: number;
    joining_date: string;
    published?: boolean;
}

export interface UpdateStaffDto {
    email?: string;
    name?: string;
    phone?: string;
    image_url?: string;
    role_id?: number;
    joining_date?: string;
    published?: boolean;
}

export interface CreateStaffRoleDto {
    name: string;
    display_name: string;
    is_default?: boolean;
}

export const StaffService = {
    async getAll(page: number = 1, limit: number = 20): Promise<{ items: Staff[], total: number, page: number, limit: number }> {
        const offset = (page - 1) * limit;

        const [countResult] = await pool.query<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM staff'
        );
        const total = (countResult[0] as { total: number }).total;

        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM staff ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        return {
            items: rows as Staff[],
            total,
            page,
            limit
        };
    },

    async getById(id: number): Promise<Staff | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM staff WHERE id = ?',
            [id]
        );

        return rows.length > 0 ? rows[0] as Staff : null;
    },

    async create(data: CreateStaffDto): Promise<Staff> {
        // Check for duplicate email
        const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM staff WHERE email = ?',
            [data.email]
        );

        if (existing.length > 0) {
            throw new ApiError(409, 'DUPLICATE_EMAIL', 'Staff with this email already exists');
        }

        // Verify role exists
        const [roleCheck] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM staff_roles WHERE id = ?',
            [data.role_id]
        );

        if (roleCheck.length === 0) {
            throw new ApiError(400, 'INVALID_ROLE', 'Staff role does not exist');
        }

        const [result] = await pool.query(
            `INSERT INTO staff (email, name, phone, image_url, role_id, joining_date, published)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                data.email,
                data.name,
                data.phone || null,
                data.image_url || null,
                data.role_id,
                data.joining_date,
                data.published !== undefined ? data.published : true
            ]
        );

        const insertResult = result as { insertId: number };
        const staff = await this.getById(insertResult.insertId);

        if (!staff) {
            throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to create staff');
        }

        return staff;
    },

    async update(id: number, data: UpdateStaffDto): Promise<Staff> {
        const existing = await this.getById(id);

        if (!existing) {
            throw new ApiError(404, 'NOT_FOUND', 'Staff not found');
        }

        // Check for duplicate email (excluding current staff)
        if (data.email && data.email !== existing.email) {
            const [duplicate] = await pool.query<RowDataPacket[]>(
                'SELECT id FROM staff WHERE email = ? AND id != ?',
                [data.email, id]
            );

            if (duplicate.length > 0) {
                throw new ApiError(409, 'DUPLICATE_EMAIL', 'Staff with this email already exists');
            }
        }

        // Verify role exists if provided
        if (data.role_id) {
            const [roleCheck] = await pool.query<RowDataPacket[]>(
                'SELECT id FROM staff_roles WHERE id = ?',
                [data.role_id]
            );

            if (roleCheck.length === 0) {
                throw new ApiError(400, 'INVALID_ROLE', 'Staff role does not exist');
            }
        }

        await pool.query(
            `UPDATE staff SET email = ?, name = ?, phone = ?, image_url = ?, role_id = ?, joining_date = ?, published = ?
             WHERE id = ?`,
            [
                data.email || existing.email,
                data.name || existing.name,
                data.phone !== undefined ? data.phone : existing.phone,
                data.image_url !== undefined ? data.image_url : existing.image_url,
                data.role_id || existing.role_id,
                data.joining_date || existing.joining_date,
                data.published !== undefined ? data.published : existing.published,
                id
            ]
        );

        const staff = await this.getById(id);

        if (!staff) {
            throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to update staff');
        }

        return staff;
    },

    async delete(id: number): Promise<void> {
        const existing = await this.getById(id);

        if (!existing) {
            throw new ApiError(404, 'NOT_FOUND', 'Staff not found');
        }

        await pool.query('DELETE FROM staff WHERE id = ?', [id]);
    },

    // Staff Roles
    async getAllRoles(page: number = 1, limit: number = 20): Promise<{ items: StaffRole[], total: number, page: number, limit: number }> {
        const offset = (page - 1) * limit;

        const [countResult] = await pool.query<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM staff_roles'
        );
        const total = (countResult[0] as { total: number }).total;

        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM staff_roles ORDER BY id ASC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        return {
            items: rows as StaffRole[],
            total,
            page,
            limit
        };
    },

    async getRoleById(id: number): Promise<StaffRole | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM staff_roles WHERE id = ?',
            [id]
        );

        return rows.length > 0 ? rows[0] as StaffRole : null;
    },

    async createRole(data: CreateStaffRoleDto): Promise<StaffRole> {
        // Check for duplicate name
        const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM staff_roles WHERE name = ?',
            [data.name]
        );

        if (existing.length > 0) {
            throw new ApiError(409, 'DUPLICATE_NAME', 'Staff role with this name already exists');
        }

        const [result] = await pool.query(
            'INSERT INTO staff_roles (name, display_name, is_default) VALUES (?, ?, ?)',
            [data.name, data.display_name, data.is_default || false]
        );

        const insertResult = result as { insertId: number };
        const role = await this.getRoleById(insertResult.insertId);

        if (!role) {
            throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to create staff role');
        }

        return role;
    }
};
