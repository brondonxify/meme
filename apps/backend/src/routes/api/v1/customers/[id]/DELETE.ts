import { createHandler } from 'hono-file-router';
import { authMiddleware } from '@/middleware/auth.js';
import { CustomerService } from '@/services/customer.service.js';
import { error, noContent } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export default createHandler(async (c) => {
  try {
    const authFn = authMiddleware('admin');
    await authFn(c, async () => {});

    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
      return error(c, 'INVALID_ID', 'Invalid customer ID', 400);
    }

    await CustomerService.delete(id);

    return noContent(c);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as 401);
    }
    throw err;
  }
});
