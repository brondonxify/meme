import { createHandler } from 'hono-file-router';
import { AdminService } from '@/services/admin.service.js';

// GET /api/admin/stats - Get dashboard stats
export default createHandler(async (c) => {
    try {
        const stats = await AdminService.getDashboardStats();
        return c.json(stats);
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});
