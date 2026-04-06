import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import { authMiddleware } from '@/middleware/auth.js';
import { CouponService } from '@/services/coupon.service.js';
import { success, error } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

const couponSchema = z.object({
  campaign_name: z.string().min(1).max(200).optional(),
  code: z.string().min(1).max(50).optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  discount_type: z.enum(['percentage', 'fixed']).optional(),
  discount_value: z.number().positive().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  published: z.boolean().optional()
});

export default createHandler(async (c) => {
  try {
    const authFn = authMiddleware('admin');
    await authFn(c, async () => {});

    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
      return error(c, 'INVALID_ID', 'Invalid coupon ID', 400);
    }

    const body = await c.req.json();
    const parsed = couponSchema.parse(body);

    const updateData: Parameters<typeof CouponService.update>[1] = {
      ...parsed,
      image_url: parsed.image_url === '' ? undefined : parsed.image_url
    };

    const coupon = await CouponService.update(id, updateData);

    return success(c, coupon);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return error(c, 'VALIDATION_ERROR', err.errors[0].message, 400);
    }
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as 400);
    }
    throw err;
  }
});
