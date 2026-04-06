import { createHandler } from 'hono-file-router';
import { authMiddleware, getCurrentUser } from '@/middleware/auth.js';
import { AuthService } from '@/services/auth.service.js';
import { success, error } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export default createHandler(async (c) => {
  try {
    const authFn = authMiddleware();
    await authFn(c, async () => {});
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as 401);
    }
    throw err;
  }

  try {
    const user = getCurrentUser(c);
    
    if (!user || user.type !== 'customer') {
      return error(c, 'UNAUTHORIZED', 'Not authenticated as customer', 401);
    }

    const customer = await AuthService.getCustomerById(user.id);

    if (!customer) {
      return error(c, 'NOT_FOUND', 'Customer not found', 404);
    }

    return success(c, {
      id: customer.id,
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      postal_code: customer.postal_code
    });
  } catch (err: unknown) {
    throw err;
  }
});
