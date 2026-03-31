import { createHandler } from 'hono-file-router';
import { CustomerService } from '@/services/customer.service.js';

// GET /api/customers/:id - Get customer by ID
export default createHandler(async (c) => {
    try {
        const id = parseInt(c.req.param('id'));

        if (isNaN(id)) {
            return c.json({ error: 'Validation error', message: 'Invalid ID' }, 400);
        }

        const customer = await CustomerService.getById(id);

        if (!customer) {
            return c.json({ error: 'Not Found', message: 'Customer not found' }, 404);
        }

        // Remove password from response
        const { password, ...safeCustomer } = customer;
        return c.json(safeCustomer);
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to fetch customer' }, 500);
    }
});
