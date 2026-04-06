import pool from '../db/connection.js';
import { ApiError } from '../utils/api-error.js';
import type { RowDataPacket } from 'mysql2';

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    created_at: Date;
}

export interface CreateContactDto {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export interface UpdateContactDto {
    status?: 'new' | 'read' | 'replied' | 'archived';
}

export const ContactService = {
    async getAll(page: number = 1, limit: number = 20): Promise<{ items: ContactMessage[], total: number, page: number, limit: number }> {
        const offset = (page - 1) * limit;

        const [countResult] = await pool.query<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM contact_messages'
        );
        const total = (countResult[0] as { total: number }).total;

        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        return {
            items: rows as ContactMessage[],
            total,
            page,
            limit
        };
    },

    async getById(id: number): Promise<ContactMessage | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM contact_messages WHERE id = ?',
            [id]
        );

        return rows.length > 0 ? rows[0] as ContactMessage : null;
    },

    async create(data: CreateContactDto): Promise<ContactMessage> {
        const [result] = await pool.query(
            `INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)`,
            [data.name, data.email, data.subject, data.message]
        );

        const insertResult = result as { insertId: number };
        const contact = await this.getById(insertResult.insertId);

        if (!contact) {
            throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to create contact message');
        }

        return contact;
    },

    async updateStatus(id: number, data: UpdateContactDto): Promise<ContactMessage> {
        const existing = await this.getById(id);

        if (!existing) {
            throw new ApiError(404, 'NOT_FOUND', 'Contact message not found');
        }

        await pool.query(
            'UPDATE contact_messages SET status = ? WHERE id = ?',
            [data.status || existing.status, id]
        );

        const contact = await this.getById(id);

        if (!contact) {
            throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to update contact message');
        }

        return contact;
    },

    async markAsRead(id: number): Promise<ContactMessage> {
        return this.updateStatus(id, { status: 'read' });
    }
};
