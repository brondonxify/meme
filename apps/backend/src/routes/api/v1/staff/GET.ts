import { createHandler } from 'hono-file-router';
import { authMiddleware } from '@/middleware/auth.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { StaffService } from '@/services/staff.service.js';
import { success, error } from '@/utils/response.js';

export default createHandler(async (c) => {
    try {
        const authFn = authMiddleware('admin');
        await authFn(c, async () => {});
    } catch (err: unknown) {
        if (err instanceof ApiError) {
            return error(c, err.code, err.message, err.statusCode as unknown as ContentfulStatusCode);
        }
        throw err;
    }

    try {
        const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
        const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20', 10)));

        const result = await StaffService.getAll(page, limit);

        return success(c, {
            items: result.items,
            total: result.total,
            page: result.page,
            limit: result.limit
        });
    } catch (err: unknown) {
        return error(c, 'INTERNAL_ERROR', 'Failed to fetch staff', 500);
    }
});
