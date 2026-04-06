import { createHandler } from 'hono-file-router';
import { z } from 'zod';
import { authMiddleware } from '@/middleware/auth.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { StaffService } from '@/services/staff.service.js';
import { success, error } from '@/utils/response.js';

const updateStaffSchema = z.object({
    email: z.string().email().optional(),
    name: z.string().min(1).max(100).optional(),
    phone: z.string().optional(),
    image_url: z.string().optional(),
    role_id: z.number().int().positive().optional(),
    joining_date: z.string().optional(),
    published: z.boolean().optional()
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
            return error(c, 'VALIDATION_ERROR', 'Invalid staff ID', 400);
        }

        const body = await c.req.json();
        const parsed = updateStaffSchema.safeParse(body);

        if (!parsed.success) {
            return error(c, 'VALIDATION_ERROR', 'Invalid request body', 400);
        }

        const staff = await StaffService.update(id, parsed.data);

        return success(c, staff);
    } catch (err: unknown) {
        if (err instanceof ApiError) {
            return error(c, err.code, err.message, err.statusCode as unknown as ContentfulStatusCode);
        }
        return error(c, 'INTERNAL_ERROR', 'Failed to update staff', 500);
    }
});
