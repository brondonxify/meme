import { createHandler } from 'hono-file-router';
import { CustomerService } from '@/services/customer.service.js';

// PUT /api/customers/:id - Update customer
export default createHandler(async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const body = await c.req.json();

        if (isNaN(id)) {
            return c.json({ error: 'Validation error', message: 'Invalid ID' }, 400);
        }

        const updated = await CustomerService.update(id, {
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            phone: body.phone,
            address: body.address,
            city: body.city,
            postal_code: body.postal_code
        });

        if (!updated) {
            return c.json({ error: 'Not Found', message: 'Customer not found or no changes' }, 404);
        }

        return c.json({ message: 'Customer updated successfully' });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return c.json({ error: 'Conflict', message: 'Email already exists' }, 409);
        }
        return c.json({ error: 'Server Error', message: 'Failed to update customer' }, 500);
    }
});
