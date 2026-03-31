import { createHandler } from 'hono-file-router';
import { AdminService } from '@/services/admin.service.js';

// GET /api/admins - Get all admins
export default createHandler(async (c) => {
    try {
        const admins = await AdminService.getAll();
        // Remove passwords from response
        const safeAdmins = admins.map(({ password, ...rest }) => rest);
        return c.json(safeAdmins);
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to fetch admins' }, 500);
    }
});
