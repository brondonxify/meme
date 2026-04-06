import { createHandler } from 'hono-file-router';
import { authMiddleware } from '@/middleware/auth.js';
import { CouponService } from '@/services/coupon.service.js';
import { error } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export default createHandler(async (c) => {
  try {
    const authFn = authMiddleware('admin');
    await authFn(c, async () => {});

    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
      return error(c, 'INVALID_ID', 'Invalid coupon ID', 400);
    }

    await CouponService.delete(id);

    return c.body(null, 204);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as 400);
    }
    throw err;
  }
});
