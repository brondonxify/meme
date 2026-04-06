import { createHandler } from 'hono-file-router';
import { AnalyticsService } from '@/services/analytics.service.js';
import { authMiddleware } from '@/middleware/auth.js';
import { success, error } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export default createHandler(async (c) => {
  try {
    const authFn = authMiddleware('admin');
    await authFn(c, async () => {});
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as 401);
    }
    throw err;
  }

  const limitParam = c.req.query('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 10;

  if (isNaN(limit) || limit < 1 || limit > 100) {
    return error(c, 'VALIDATION_ERROR', 'limit must be between 1 and 100', 400);
  }

  const products = await AnalyticsService.getTopProducts(limit);

  return success(c, products);
});