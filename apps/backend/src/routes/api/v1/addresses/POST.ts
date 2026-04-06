import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import { AddressService } from '@/services/address.service.js';
import { authMiddleware, getCurrentUser } from '@/middleware/auth.js';
import { success, error } from '@/utils/response.js';

const createAddressSchema = z.object({
  label: z.string().min(1).max(50),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  phone: z.string().min(1).max(20),
  address_line: z.string().min(1),
  city: z.string().min(1).max(100),
  postal_code: z.string().optional(),
  is_default: z.boolean().optional().default(false)
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

      const body = await c.req.json();
      const parsed = createAddressSchema.parse(body);

      const address = await AddressService.create({
        ...parsed,
        customer_id: user.id
      });

      return success(c, address, 201);
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        return error(c, 'VALIDATION_ERROR', err.errors[0].message, 400);
      }
      throw err;
    }
  }
);
