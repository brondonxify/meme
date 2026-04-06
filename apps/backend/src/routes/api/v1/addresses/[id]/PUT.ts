import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import { AddressService } from '@/services/address.service.js';
import { authMiddleware, getCurrentUser } from '@/middleware/auth.js';
import { success, error } from '@/utils/response.js';

const updateAddressSchema = z.object({
  label: z.string().min(1).max(50).optional(),
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  phone: z.string().min(1).max(20).optional(),
  address_line: z.string().min(1).optional(),
  city: z.string().min(1).max(100).optional(),
  postal_code: z.string().optional(),
  is_default: z.boolean().optional()
});

export default createHandler(
  async (c) => {
    try {
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
      const body = await c.req.json();
      const parsed = updateAddressSchema.parse(body);

      const address = await AddressService.update(addressId, user.id, parsed);

      return success(c, address);
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return error(c, 'VALIDATION_ERROR', err.errors[0].message, 400);
        }
        throw err;
    }
  }
);
