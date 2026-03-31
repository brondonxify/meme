import { createHandler } from 'hono-file-router';
import { CustomerService } from '@/services/customer.service.js';

// GET /api/customers - Get all customers (Admin only)
export default createHandler(async (c) => {
    try {
        const customers = await CustomerService.getAll();
        // Remove passwords from response
        const safeCustomers = customers.map(({ password, ...rest }) => rest);
        return c.json(safeCustomers);
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to fetch customers' }, 500);
    }
});
