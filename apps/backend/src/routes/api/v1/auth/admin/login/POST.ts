import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import { AuthService } from '@/services/auth.service.js';
import { success, error } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export default createHandler(async (c) => {
  try {
    const body = await c.req.json();
    
    const parsed = loginSchema.parse(body);
    const { email, password } = parsed;

    const result = await AuthService.loginAdmin(email, password);

    return success(c, {
      token: result.token,
      user: result.user
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return error(c, 'VALIDATION_ERROR', err.errors[0].message, 400);
    }
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode);
    }
    throw err;
  }
});
