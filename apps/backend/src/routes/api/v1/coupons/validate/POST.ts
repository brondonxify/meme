import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import { CouponService } from '@/services/coupon.service.js';
import { success, error } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';

const validateSchema = z.object({
  code: z.string().min(1),
  cartTotal: z.number().positive(),
});

export default createHandler(async (c) => {
  try {
    const body = await c.req.json();
    const parsed = validateSchema.parse(body);

    const result = await CouponService.validate(parsed.code, parsed.cartTotal);

    if (!result.valid) {
      return error(c, 'VALIDATION_ERROR', result.reason, 400);
    }

    return success(c, {
      id: result.coupon.id,
      code: result.coupon.code,
      discount_type: result.coupon.discount_type,
      discount_value: result.coupon.discount_value,
      discount_amount: result.discountAmount,
    });
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