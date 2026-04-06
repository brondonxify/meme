import { createHandler } from 'hono-file-router';
import { CouponService } from '@/services/coupon.service.js';
import { success, error } from '@/utils/response.js';

export default createHandler(async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
      return error(c, 'INVALID_ID', 'Invalid coupon ID', 400);
    }

    const coupon = await CouponService.getById(id);

    if (!coupon) {
      return error(c, 'NOT_FOUND', 'Coupon not found', 404);
    }

    return success(c, coupon);
  } catch (err: unknown) {
    throw err;
  }
});
