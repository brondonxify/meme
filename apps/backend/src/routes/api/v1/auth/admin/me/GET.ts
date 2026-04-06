import { createHandler } from 'hono-file-router';
import { authMiddleware, getCurrentUser } from '@/middleware/auth.js';
import { AuthService } from '@/services/auth.service.js';
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

  try {
    const user = getCurrentUser(c);
    
    if (!user || user.type !== 'admin') {
      return error(c, 'UNAUTHORIZED', 'Not authenticated as admin', 401);
    }

    const admin = await AuthService.getAdminById(user.id);

    if (!admin) {
      return error(c, 'NOT_FOUND', 'Admin not found', 404);
    }

    return success(c, {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    });
  } catch (err: unknown) {
    throw err;
  }
});
