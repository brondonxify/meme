import { createHandler } from 'hono-file-router';
import { z } from 'zod';
import { authMiddleware } from '@/middleware/auth.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { SpecificationService } from '@/services/specification.service.js';
import { success, error } from '@/utils/response.js';

const createSpecificationSchema = z.object({
    name: z.string().min(1).max(100)
});

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
        const body = await c.req.json();
        const parsed = createSpecificationSchema.safeParse(body);

        if (!parsed.success) {
            return error(c, 'VALIDATION_ERROR', 'Invalid request body', 400);
        }

        const specification = await SpecificationService.create(parsed.data);

        return success(c, specification, 201);
    } catch (err: unknown) {
        if (err instanceof ApiError) {
            return error(c, err.code, err.message, err.statusCode as unknown as ContentfulStatusCode);
        }
        return error(c, 'INTERNAL_ERROR', 'Failed to create specification', 500);
    }
});
