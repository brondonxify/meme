import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import { authMiddleware } from '@/middleware/auth.js';
import { CouponService } from '@/services/coupon.service.js';
import { success, error } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

const couponSchema = z.object({
  campaign_name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  image_url: z.string().url().optional().or(z.literal('')),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().positive(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  published: z.boolean().default(true)
});

export default createHandler(async (c) => {
  try {
    const authFn = authMiddleware('admin');
    await authFn(c, async () => {});

    const body = await c.req.json();
    const parsed = couponSchema.parse(body);

    const coupon = await CouponService.create({
      ...parsed,
      image_url: parsed.image_url || undefined
    });

    return success(c, coupon, 201);
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
