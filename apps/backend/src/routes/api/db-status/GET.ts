import { createHandler } from 'hono-file-router';
import { testConnection } from '@/db/connection.js';

export default createHandler(async (c) => {
    const result = await testConnection();

    if (result.success) {
        return c.json({
            status: 'ok',
            message: result.message,
            timestamp: new Date().toISOString()
        });
    } else {
        return c.json({
            status: 'error',
            message: result.message,
            timestamp: new Date().toISOString()
        }, 500);
    }
});
