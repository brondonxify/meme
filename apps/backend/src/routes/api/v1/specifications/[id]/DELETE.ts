import { createHandler } from 'hono-file-router';
import { authMiddleware } from '@/middleware/auth.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { SpecificationService } from '@/services/specification.service.js';
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
            return error(c, 'VALIDATION_ERROR', 'Invalid specification ID', 400);
        }

        await SpecificationService.delete(id);

        return success(c, { message: 'Specification deleted successfully' });
    } catch (err: unknown) {
        if (err instanceof ApiError) {
            return error(c, err.code, err.message, err.statusCode as unknown as ContentfulStatusCode);
        }
        return error(c, 'INTERNAL_ERROR', 'Failed to delete specification', 500);
    }
});
