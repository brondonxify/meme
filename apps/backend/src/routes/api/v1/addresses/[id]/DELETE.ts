import { createHandler } from 'hono-file-router';
import { AddressService } from '@/services/address.service.js';
import { authMiddleware, getCurrentUser } from '@/middleware/auth.js';
import { success, error } from '@/utils/response.js';

export default createHandler(
  async (c) => {
    try {
      const authHandler = authMiddleware();
      await authHandler(c, async () => {});
    } catch (e) {
      return error(c, 'UNAUTHORIZED', 'No valid token provided', 401);
    }

    const user = getCurrentUser(c);
    if (!user || user.type !== 'customer') {
      return error(c, 'UNAUTHORIZED', 'Customer only', 401);
    }

    const addressId = parseInt(c.req.param('id'), 10);
    await AddressService.delete(addressId, user.id);

    return success(c, { message: 'Address deleted' });
  }
);
