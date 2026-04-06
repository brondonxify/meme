import { createHandler } from 'hono-file-router';
import { authMiddleware } from '@/middleware/auth.js';
import { CustomerService } from '@/services/customer.service.js';
import { success, error, notFound } from '@/utils/response.js';
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

    const customer = await CustomerService.getById(id);

    if (!customer) {
      return notFound(c, 'Customer not found');
    }

    return success(c, customer);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as 401);
    }
    throw err;
  }
});
