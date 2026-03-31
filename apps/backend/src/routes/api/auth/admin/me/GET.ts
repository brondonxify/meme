import { createHandler } from 'hono-file-router';
import { AdminService } from '@/services/admin.service.js';

// GET /api/auth/admin/me - Get current admin profile
export default createHandler(async (c) => {
    try {
        const authHeader = c.req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer admin-')) {
            return c.json({ error: 'Unauthorized', message: 'No valid token provided' }, 401);
        }

        const adminId = parseInt(authHeader.replace('Bearer admin-', ''));

        if (isNaN(adminId)) {
            return c.json({ error: 'Unauthorized', message: 'Invalid token format' }, 401);
        }

        const admin = await AdminService.getById(adminId);

        if (!admin) {
            return c.json({ error: 'Unauthorized', message: 'Admin not found' }, 401);
        }

        // Remove password from response
        const { password, ...safeAdmin } = admin;

        return c.json(safeAdmin);
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to fetch admin profile' }, 500);
    }
});
