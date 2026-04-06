import pool from '../db/connection.js';
import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/api-error.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCustomerDto {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

export interface UpdateCustomerDto {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

export const CustomerService = {
  async getAll(
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<{ items: Customer[]; total: number }> {
    const offset = (page - 1) * limit;

    let countQuery = 'SELECT COUNT(*) as total FROM customer';
    let dataQuery = 'SELECT id, first_name, last_name, email, phone, address, city, postal_code, created_at, updated_at FROM customer';
    const params: (string | number)[] = [];
    const dataParams: (string | number)[] = [];

    if (search) {
      const searchClause = ' WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?';
      countQuery += searchClause;
      dataQuery += searchClause;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
      dataParams.push(searchPattern, searchPattern, searchPattern);
    }

    dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    dataParams.push(limit, offset);

    const [countResult] = await pool.query<RowDataPacket[]>(countQuery, params);
    const total = (countResult[0] as { total: number }).total;

    const [rows] = await pool.query<RowDataPacket[]>(dataQuery, dataParams);

    return {
      items: rows as Customer[],
      total
    };
  },

  async getById(id: number): Promise<Customer | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, first_name, last_name, email, phone, address, city, postal_code, created_at, updated_at FROM customer WHERE id = ?',
      [id]
    );

    return rows.length > 0 ? (rows[0] as Customer) : null;
  },

  async create(data: CreateCustomerDto): Promise<Customer> {
    // Check for duplicate email
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM customer WHERE email = ?',
      [data.email]
    );

    if (existing.length > 0) {
      throw new ApiError(409, 'DUPLICATE_EMAIL', 'Customer with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO customer (first_name, last_name, email, password, phone, address, city, postal_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.first_name,
        data.last_name,
        data.email,
        hashedPassword,
        data.phone || null,
        data.address || null,
        data.city || null,
        data.postal_code || null
      ]
    );

    const customer = await this.getById(result.insertId);

    if (!customer) {
      throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to create customer');
    }

    return customer;
  },

  async update(id: number, data: UpdateCustomerDto): Promise<Customer> {
    const existing = await this.getById(id);

    if (!existing) {
      throw new ApiError(404, 'NOT_FOUND', 'Customer not found');
    }

    // Check for duplicate email if email is being changed
    if (data.email && data.email !== existing.email) {
      const [duplicate] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM customer WHERE email = ? AND id != ?',
        [data.email, id]
      );

      if (duplicate.length > 0) {
        throw new ApiError(409, 'DUPLICATE_EMAIL', 'Customer with this email already exists');
      }
    }

    let hashedPassword: string | undefined;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 12);
    }

    await pool.query(
      `UPDATE customer SET
        first_name = ?,
        last_name = ?,
        email = ?,
        phone = ?,
        address = ?,
        city = ?,
        postal_code = ?
        ${hashedPassword ? ', password = ?' : ''}
       WHERE id = ?`,
      [
        data.first_name ?? existing.first_name,
        data.last_name ?? existing.last_name,
        data.email ?? existing.email,
        data.phone !== undefined ? data.phone : existing.phone,
        data.address !== undefined ? data.address : existing.address,
        data.city !== undefined ? data.city : existing.city,
        data.postal_code !== undefined ? data.postal_code : existing.postal_code,
        ...(hashedPassword ? [hashedPassword] : []),
        id
      ]
    );

    const customer = await this.getById(id);

    if (!customer) {
      throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to update customer');
    }

    return customer;
  },

  async delete(id: number): Promise<void> {
    const existing = await this.getById(id);

    if (!existing) {
      throw new ApiError(404, 'NOT_FOUND', 'Customer not found');
    }

    await pool.query('DELETE FROM customer WHERE id = ?', [id]);
  }
};
