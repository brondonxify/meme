import { createHandler } from 'hono-file-router';
import { AdminService } from '@/services/admin.service.js';

// POST /api/admins - Create new admin
export default createHandler(async (c) => {
    try {
        const body = await c.req.json();

        if (!body.username || !body.email || !body.password) {
            return c.json({ error: 'Validation error', message: 'Username, email, and password are required' }, 400);
        }

        // TODO: Hash password before storing
        const id = await AdminService.create({
            username: body.username,
            email: body.email,
            password: body.password
        });

        return c.json({ id, username: body.username, email: body.email }, 201);
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return c.json({ error: 'Conflict', message: 'Email already exists' }, 409);
        }
        return c.json({ error: 'Server Error', message: 'Failed to create admin' }, 500);
    }
});
