import { createHandler } from 'hono-file-router';
import { CustomerService } from '@/services/customer.service.js';

// DELETE /api/customers/:id - Delete customer
export default createHandler(async (c) => {
    try {
        const id = parseInt(c.req.param('id'));

        if (isNaN(id)) {
            return c.json({ error: 'Validation error', message: 'Invalid ID' }, 400);
        }

        const deleted = await CustomerService.delete(id);

        if (!deleted) {
            return c.json({ error: 'Not Found', message: 'Customer not found' }, 404);
        }

        return c.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to delete customer' }, 500);
    }
});
