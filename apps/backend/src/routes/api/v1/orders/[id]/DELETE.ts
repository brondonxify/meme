import { createHandler } from 'hono-file-router';
import { authMiddleware } from '@/middleware/auth.js';
import { OrderService } from '@/services/order.service.js';
import { success, error } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export default createHandler(async (c) => {
  try {
    const authFn = authMiddleware('admin');
    await authFn(c, async () => {});

    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
      return error(c, 'VALIDATION_ERROR', 'Invalid order ID', 400);
    }

    await OrderService.delete(id);

    return success(c, { message: 'Order deleted successfully' });
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as 401);
    }
    throw err;
  }
});
