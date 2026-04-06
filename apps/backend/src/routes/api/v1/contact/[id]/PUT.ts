import { createHandler } from 'hono-file-router';
import { z } from 'zod';
import { authMiddleware } from '@/middleware/auth.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { ContactService } from '@/services/contact.service.js';
import { success, error } from '@/utils/response.js';

const updateContactSchema = z.object({
    status: z.enum(['new', 'read', 'replied', 'archived']).optional()
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
        const id = parseInt(c.req.param('id'), 10);

        if (isNaN(id) || id <= 0) {
            return error(c, 'VALIDATION_ERROR', 'Invalid contact ID', 400);
        }

        const body = await c.req.json();
        const parsed = updateContactSchema.safeParse(body);

        if (!parsed.success) {
            return error(c, 'VALIDATION_ERROR', 'Invalid request body', 400);
        }

        const contact = await ContactService.updateStatus(id, parsed.data);

        return success(c, contact);
    } catch (err: unknown) {
        if (err instanceof ApiError) {
            return error(c, err.code, err.message, err.statusCode as unknown as ContentfulStatusCode);
        }
        return error(c, 'INTERNAL_ERROR', 'Failed to update contact message', 500);
    }
});
