import { createHandler } from 'hono-file-router';
import { AdminService } from '@/services/admin.service.js';

// POST /api/auth/admin/login - Admin login
export default createHandler(async (c) => {
    try {
        const body = await c.req.json();

        if (!body.email || !body.password) {
            return c.json({ error: 'Validation error', message: 'Email and password are required' }, 400);
        }

        const admin = await AdminService.getByEmail(body.email);

        if (!admin) {
            return c.json({ error: 'Unauthorized', message: 'Invalid email or password' }, 401);
        }

        // TODO: Compare hashed passwords
        if (admin.password !== body.password) {
            return c.json({ error: 'Unauthorized', message: 'Invalid email or password' }, 401);
        }

        // Remove password from response
        const { password, ...safeAdmin } = admin;

        return c.json({
            message: 'Admin login successful',
            user: safeAdmin,
            token: `admin-${safeAdmin.id}`
        });
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Login failed' }, 500);
    }
});
