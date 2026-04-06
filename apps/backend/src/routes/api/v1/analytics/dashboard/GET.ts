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

  const stats = await AnalyticsService.getDashboardStats();

  return success(c, stats);
});