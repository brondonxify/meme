import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import { CategoryService } from '@/services/category.service.js';
import { success, error } from '@/utils/response.js';
import { authMiddleware } from '@/middleware/auth.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().max(100).optional(),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  published: z.boolean().default(true)
});

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
    const body = await c.req.json();
    const parsed = createCategorySchema.parse(body);

    const category = await CategoryService.create(parsed);

    return success(c, category, 201);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return error(c, 'VALIDATION_ERROR', err.errors[0].message, 400);
    }
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as 400);
    }
    throw err;
  }
});
