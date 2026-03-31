import { createHandler } from 'hono-file-router';
import { CustomerService } from '@/services/customer.service.js';

// GET /api/auth/me - Get current customer profile
export default createHandler(async (c) => {
    try {
        const authHeader = c.req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer customer-')) {
            return c.json({ error: 'Unauthorized', message: 'No valid token provided' }, 401);
        }

        const customerId = parseInt(authHeader.replace('Bearer customer-', ''));

        if (isNaN(customerId)) {
            return c.json({ error: 'Unauthorized', message: 'Invalid token format' }, 401);
        }

        const customer = await CustomerService.getById(customerId);

        if (!customer) {
            return c.json({ error: 'Unauthorized', message: 'User not found' }, 401);
        }

        // Remove password from response
        const { password, ...safeCustomer } = customer;

        return c.json(safeCustomer);
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to fetch profile' }, 500);
    }
});
