import { createHandler } from 'hono-file-router';
import { CustomerService } from '@/services/customer.service.js';

// POST /api/auth/register - Register new customer
export default createHandler(async (c) => {
    try {
        const body = await c.req.json();

        if (!body.first_name || !body.last_name || !body.email || !body.password) {
            return c.json({ error: 'Validation error', message: 'First name, last name, email, and password are required' }, 400);
        }

        // Check if email already exists
        const existing = await CustomerService.getByEmail(body.email);
        if (existing) {
            return c.json({ error: 'Conflict', message: 'Email already registered' }, 409);
        }

        // TODO: Hash password before storing
        const id = await CustomerService.create({
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            password: body.password,
            phone: body.phone,
            address: body.address,
            city: body.city,
            postal_code: body.postal_code
        });

        return c.json({
            id,
            message: 'Registration successful',
            user: {
                id,
                first_name: body.first_name,
                last_name: body.last_name,
                email: body.email
            }
        }, 201);
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Registration failed' }, 500);
    }
});
