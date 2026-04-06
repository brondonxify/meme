import pool from '../db/connection.js';
import { ApiError } from '../utils/api-error.js';
import type { RowDataPacket } from 'mysql2';

export interface Payment {
    id: number;
    order_id: number;
    method: 'om' | 'mtn';
    phone: string;
    amount: number;
    status: 'pending' | 'success' | 'failed';
    transaction_id: string;
    created_at: Date;
}

export interface CreatePaymentDto {
    order_id: number;
    method: 'om' | 'mtn';
    phone: string;
    amount: number;
}

function generateTransactionId(): string {
    const prefix = 'TXN';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

function simulatePayment(provider: 'om' | 'mtn', phone: string, amount: number): { success: boolean; transactionId: string; message: string } {
    // 70% success rate simulation
    const success = Math.random() < 0.7;
    const transactionId = generateTransactionId();

    if (!success) {
        const reasons = [
            'Insufficient funds',
            'Invalid phone number',
            'Network timeout',
            'Payment declined by user',
            'Maximum transaction limit exceeded'
        ];
        const message = reasons[Math.floor(Math.random() * reasons.length)];
        return { success: false, transactionId, message };
    }

    return {
        success: true,
        transactionId,
        message: `Payment processed successfully via ${provider === 'om' ? 'Orange Money' : 'MTN MoMo'}`
    };
}

export const PaymentService = {
    async initiate(data: CreatePaymentDto): Promise<Payment> {
        // Verify order exists
        const [orderRows] = await pool.query<RowDataPacket[]>(
            'SELECT id, total_amount FROM orders WHERE id = ?',
            [data.order_id]
        );

        if (orderRows.length === 0) {
            throw new ApiError(404, 'NOT_FOUND', 'Order not found');
        }

        const order = orderRows[0] as { id: number; total_amount: number };

        // Verify amount matches order total (with small tolerance)
        const amountDiff = Math.abs(order.total_amount - data.amount);
        if (amountDiff > 0.01) {
            throw new ApiError(400, 'INVALID_AMOUNT', 'Payment amount does not match order total');
        }

        // Basic phone existence check
        if (!data.phone || data.phone.trim() === '') {
            throw new ApiError(400, 'INVALID_PHONE', 'Phone number is required');
        }

        // Simulate payment with the provider
        const result = simulatePayment(data.method, data.phone, data.amount);

        // Store payment record
        const [insertResult] = await pool.query(
            `INSERT INTO payments (order_id, method, phone, amount, status, transaction_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.order_id,
                data.method,
                data.phone,
                data.amount,
                result.success ? 'success' : 'failed',
                result.transactionId
            ]
        );

        const insertRes = insertResult as { insertId: number };
        const payment = await this.getById(insertRes.insertId);

        if (!payment) {
            throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to create payment');
        }

        return payment;
    },

    async getById(id: number): Promise<Payment | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM payments WHERE id = ?',
            [id]
        );

        return rows.length > 0 ? rows[0] as Payment : null;
    },

    async getByOrderId(orderId: number): Promise<Payment | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1',
            [orderId]
        );

        return rows.length > 0 ? rows[0] as Payment : null;
    },

    async getByTransactionId(transactionId: string): Promise<Payment | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM payments WHERE transaction_id = ?',
            [transactionId]
        );

        return rows.length > 0 ? rows[0] as Payment : null;
    },

    async getAll(page: number = 1, limit: number = 20): Promise<{ items: Payment[], total: number, page: number, limit: number }> {
        const offset = (page - 1) * limit;

        const [countResult] = await pool.query<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM payments'
        );
        const total = (countResult[0] as { total: number }).total;

        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM payments ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        return {
            items: rows as Payment[],
            total,
            page,
            limit
        };
    }
};
