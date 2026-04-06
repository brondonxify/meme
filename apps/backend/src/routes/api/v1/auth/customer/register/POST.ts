import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import { success, error } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/db/connection.js';

const registerSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional()
});

export default createHandler(async (c) => {
  try {
    const body = await c.req.json();
    
    const parsed = registerSchema.parse(body);
    const { first_name, last_name, email, password, phone, address, city, postal_code } = parsed;

    const [existingRows] = await pool.query(
      'SELECT id FROM customer WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingRows) && existingRows.length > 0) {
      return error(c, 'CONFLICT', 'Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      'INSERT INTO customer (first_name, last_name, email, password, phone, address, city, postal_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, hashedPassword, phone || null, address || null, city || null, postal_code || null]
    );

    const newCustomerId = (result as { insertId: number }).insertId;

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new ApiError(500, 'INTERNAL_ERROR', 'JWT_SECRET not configured');
    }

    const token = jwt.sign(
      { id: newCustomerId, role: 'customer', type: 'customer' },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return success(c, {
      token,
      user: {
        id: newCustomerId,
        email,
        role: 'customer'
      }
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return error(c, 'VALIDATION_ERROR', err.errors[0].message, 400);
    }
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as 400);
    }
    throw err;
  }
});
