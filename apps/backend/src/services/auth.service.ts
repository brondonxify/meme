import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../db/connection.js';
import { ApiError } from '../utils/api-error.js';
import type { RowDataPacket } from 'mysql2';

export interface Admin {
    id: number;
    username: string;
    email: string;
    password: string;
    role: string;
}

export interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
}

export interface LoginResult {
    token: string;
    user: {
        id: number;
        email: string;
        role: string;
    };
}

const JWT_EXPIRY = '24h';

export const AuthService = {
    async loginAdmin(email: string, password: string): Promise<LoginResult> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM admin WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }

        const admin = rows[0] as Admin;
        let passwordMatch = false;

        if (admin.password.startsWith('$2')) {
            passwordMatch = await bcrypt.compare(password, admin.password);
        } else {
            if (admin.password === password) {
                const hashed = await bcrypt.hash(password, 12);
                await pool.query(
                    'UPDATE admin SET password = ? WHERE id = ?',
                    [hashed, admin.id]
                );
                passwordMatch = true;
            }
        }

        if (!passwordMatch) {
            throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new ApiError(500, 'INTERNAL_ERROR', 'JWT_SECRET not configured');
        }

        const token = jwt.sign(
            { id: admin.id, role: admin.role, type: 'admin' },
            jwtSecret,
            { expiresIn: JWT_EXPIRY }
        );

        return {
            token,
            user: {
                id: admin.id,
                email: admin.email,
                role: admin.role
            }
        };
    },

    async loginCustomer(email: string, password: string): Promise<LoginResult> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM customer WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }

        const customer = rows[0] as Customer;
        let passwordMatch = false;

        if (customer.password.startsWith('$2')) {
            passwordMatch = await bcrypt.compare(password, customer.password);
        } else {
            if (customer.password === password) {
                const hashed = await bcrypt.hash(password, 12);
                await pool.query(
                    'UPDATE customer SET password = ? WHERE id = ?',
                    [hashed, customer.id]
                );
                passwordMatch = true;
            }
        }

        if (!passwordMatch) {
            throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new ApiError(500, 'INTERNAL_ERROR', 'JWT_SECRET not configured');
        }

        const token = jwt.sign(
            { id: customer.id, role: 'customer', type: 'customer' },
            jwtSecret,
            { expiresIn: JWT_EXPIRY }
        );

        return {
            token,
            user: {
                id: customer.id,
                email: customer.email,
                role: 'customer'
            }
        };
    },

    async getAdminById(id: number): Promise<Admin | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id, username, email, role FROM admin WHERE id = ?',
            [id]
        );
        return rows.length > 0 ? rows[0] as Admin : null;
    },

    async getCustomerById(id: number): Promise<Customer | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id, first_name, last_name, email, phone, address, city, postal_code FROM customer WHERE id = ?',
            [id]
        );
        return rows.length > 0 ? rows[0] as Customer : null;
    }
};