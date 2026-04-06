import pool from '../db/connection.js';
import type { RowDataPacket } from 'mysql2';
import { ApiError } from '../utils/api-error.js';

export interface CustomerAddress {
    id: number;
    customer_id: number;
    label: string;
    first_name: string;
    last_name: string;
    phone: string;
    address_line: string;
    city: string;
    postal_code: string | null;
    is_default: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateAddressDto {
    customer_id: number;
    label: string;
    first_name: string;
    last_name: string;
    phone: string;
    address_line: string;
    city: string;
    postal_code?: string;
    is_default?: boolean;
}

export const AddressService = {
    async getByCustomer(customerId: number): Promise<CustomerAddress[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM customer_address WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC',
            [customerId]
        );
        return rows as CustomerAddress[];
    },

    async getById(id: number): Promise<CustomerAddress | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM customer_address WHERE id = ?',
            [id]
        );
        if (rows.length === 0) return null;
        return rows[0] as CustomerAddress;
    },

    async create(data: CreateAddressDto): Promise<CustomerAddress> {
        // If this is default, clear others
        if (data.is_default) {
            await pool.query('UPDATE customer_address SET is_default = FALSE WHERE customer_id = ?', [data.customer_id]);
        }

        const [result] = await pool.query(
            `INSERT INTO customer_address (customer_id, label, first_name, last_name, phone, address_line, city, postal_code, is_default) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.customer_id,
                data.label,
                data.first_name,
                data.last_name,
                data.phone,
                data.address_line,
                data.city,
                data.postal_code || null,
                data.is_default || false
            ]
        );

        const newAddress = await this.getById((result as { insertId: number }).insertId);
        if (!newAddress) throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to retrieve created address');
        return newAddress;
    },

    async update(id: number, customerId: number, data: Partial<CreateAddressDto>): Promise<CustomerAddress> {
        const existing = await this.getById(id);
        if (!existing || existing.customer_id !== customerId) {
            throw new ApiError(404, 'NOT_FOUND', 'Address not found');
        }

        if (data.is_default) {
            await pool.query('UPDATE customer_address SET is_default = FALSE WHERE customer_id = ?', [customerId]);
        }

        const fields = [];
        const params = [];
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                params.push(value);
            }
        }
        params.push(id);

        await pool.query(`UPDATE customer_address SET ${fields.join(', ')} WHERE id = ?`, params);

        const updated = await this.getById(id);
        if (!updated) throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to retrieve updated address');
        return updated;
    },

    async delete(id: number, customerId: number): Promise<void> {
        const existing = await this.getById(id);
        if (!existing || existing.customer_id !== customerId) {
            throw new ApiError(404, 'NOT_FOUND', 'Address not found');
        }
        await pool.query('DELETE FROM customer_address WHERE id = ?', [id]);
    }
};
