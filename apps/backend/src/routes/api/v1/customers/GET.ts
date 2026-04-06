import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import { authMiddleware } from '@/middleware/auth.js';
import { CustomerService } from '@/services/customer.service.js';
import { success, error } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional()
});

export default createHandler(async (c) => {
  try {
    const authFn = authMiddleware('admin');
    await authFn(c, async () => {});

    const query = querySchema.parse(c.req.query());

    const result = await CustomerService.getAll(query.page, query.limit, query.search);

    return success(c, {
      items: result.items,
      total: result.total,
      page: query.page,
      limit: query.limit
    });
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as 401);
    }
    if (err instanceof z.ZodError) {
      return error(c, 'VALIDATION_ERROR', err.errors[0].message, 400);
    }
    throw err;
  }
});
