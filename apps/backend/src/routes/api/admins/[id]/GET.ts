import { createHandler } from 'hono-file-router';
import { AdminService } from '@/services/admin.service.js';

// GET /api/admins/:id - Get admin by ID
export default createHandler(async (c) => {
    try {
        const id = parseInt(c.req.param('id'));

        if (isNaN(id)) {
            return c.json({ error: 'Validation error', message: 'Invalid ID' }, 400);
        }

        const admin = await AdminService.getById(id);

        if (!admin) {
            return c.json({ error: 'Not Found', message: 'Admin not found' }, 404);
        }

        // Remove password from response
        const { password, ...safeAdmin } = admin;
        return c.json(safeAdmin);
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to fetch admin' }, 500);
    }
});
