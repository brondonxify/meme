import { createHandler } from 'hono-file-router';

// POST /api/auth/logout
export default createHandler(async (c) => {
    return c.json({ message: 'Logged out successfully' });
});
