import { createHandler } from 'hono-file-router';
import { CustomerService } from '@/services/customer.service.js';

// POST /api/auth/login - Customer login
export default createHandler(async (c) => {
    try {
        const body = await c.req.json();

        if (!body.email || !body.password) {
            return c.json({ error: 'Validation error', message: 'Email and password are required' }, 400);
        }

        const customer = await CustomerService.getByEmail(body.email);

        if (!customer) {
            return c.json({ error: 'Unauthorized', message: 'Invalid email or password' }, 401);
        }

        // TODO: Compare hashed passwords
        if (customer.password !== body.password) {
            return c.json({ error: 'Unauthorized', message: 'Invalid email or password' }, 401);
        }

        // Remove password from response
        const { password, ...safeCustomer } = customer;

        return c.json({
            message: 'Login successful',
            user: safeCustomer,
            token: `customer-${safeCustomer.id}`
        });
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Login failed' }, 500);
    }
});
