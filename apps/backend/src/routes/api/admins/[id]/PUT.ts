import { createHandler } from 'hono-file-router';
import { AdminService } from '@/services/admin.service.js';

// PUT /api/admins/:id - Update admin
export default createHandler(async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const body = await c.req.json();

        if (isNaN(id)) {
            return c.json({ error: 'Validation error', message: 'Invalid ID' }, 400);
        }

        const updated = await AdminService.update(id, {
            username: body.username,
            email: body.email,
            password: body.password
        });

        if (!updated) {
            return c.json({ error: 'Not Found', message: 'Admin not found or no changes' }, 404);
        }

        return c.json({ message: 'Admin updated successfully' });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return c.json({ error: 'Conflict', message: 'Email already exists' }, 409);
        }
        return c.json({ error: 'Server Error', message: 'Failed to update admin' }, 500);
    }
});
