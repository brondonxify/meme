import { createHandler } from 'hono-file-router';
import { AdminService } from '@/services/admin.service.js';

// DELETE /api/admins/:id - Delete admin
export default createHandler(async (c) => {
    try {
        const id = parseInt(c.req.param('id'));

        if (isNaN(id)) {
            return c.json({ error: 'Validation error', message: 'Invalid ID' }, 400);
        }

        const deleted = await AdminService.delete(id);

        if (!deleted) {
            return c.json({ error: 'Not Found', message: 'Admin not found' }, 404);
        }

        return c.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to delete admin' }, 500);
    }
});
