import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import { CouponService } from '@/services/coupon.service.js';
import { success, error } from '@/utils/response.js';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export default createHandler(async (c) => {
  try {
    const parsed = querySchema.parse(c.req.query());
    const { page, limit } = parsed;

    const { items, total } = await CouponService.getAll(page, limit);

    return success(c, {
      items,
      total,
      page,
      limit
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return error(c, 'VALIDATION_ERROR', err.errors[0].message, 400);
    }
    throw err;
  }
});
