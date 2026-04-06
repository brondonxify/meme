import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import { authMiddleware } from '@/middleware/auth.js';
import { CustomerService } from '@/services/customer.service.js';
import { success, error, notFound } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

const updateCustomerSchema = z.object({
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional()
});

export default createHandler(async (c) => {
  try {
    const authFn = authMiddleware('admin');
    await authFn(c, async () => {});

    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
      return error(c, 'INVALID_ID', 'Invalid customer ID', 400);
    }

    const body = await c.req.json();
    const parsed = updateCustomerSchema.parse(body);

    const customer = await CustomerService.update(id, parsed);

    return success(c, customer);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as 401);
    }
    if (err instanceof z.ZodError) {
      return error(c, 'VALIDATION_ERROR', err.errors[0].message, 400);
    }
    throw err;
  }
});
