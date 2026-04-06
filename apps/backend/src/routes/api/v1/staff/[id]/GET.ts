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
        const id = parseInt(c.req.param('id'), 10);

        if (isNaN(id) || id <= 0) {
            return error(c, 'VALIDATION_ERROR', 'Invalid staff ID', 400);
        }

        const staff = await StaffService.getById(id);

        if (!staff) {
            return error(c, 'NOT_FOUND', 'Staff not found', 404);
        }

        return success(c, staff);
    } catch (err: unknown) {
        if (err instanceof ApiError) {
            return error(c, err.code, err.message, err.statusCode as unknown as ContentfulStatusCode);
        }
        return error(c, 'INTERNAL_ERROR', 'Failed to fetch staff', 500);
    }
});
