import { createHandler } from 'hono-file-router';

// POST /api/auth/admin/logout
export default createHandler(async (c) => {
    return c.json({ message: 'Admin logged out successfully' });
});
