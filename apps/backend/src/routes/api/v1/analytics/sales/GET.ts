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

  const daysParam = c.req.query('days');
  const days = daysParam ? parseInt(daysParam, 10) : 30;

  if (isNaN(days) || days < 1 || days > 365) {
    return error(c, 'VALIDATION_ERROR', 'days must be between 1 and 365', 400);
  }

  const sales = await AnalyticsService.getSalesOverTime(days);

  return success(c, sales);
});