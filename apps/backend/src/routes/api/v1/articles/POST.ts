import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import { ArticleService } from '@/services/article.service.js';
import { success, error } from '@/utils/response.js';
import { authMiddleware } from '@/middleware/auth.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

const createArticleSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().max(200).optional(),
  sku: z.string().min(1).max(50),
  description: z.string().optional(),
  long_description: z.string().optional(),
  category_id: z.number().int().positive(),
  image_url: z.string().url().optional().or(z.literal('')),
  cost_price: z.number().nonnegative().default(0),
  selling_price: z.number().nonnegative(),
  stock: z.number().int().nonnegative().default(0),
  min_stock_threshold: z.number().int().nonnegative().default(5),
  published: z.boolean().default(true),
  specification_ids: z.array(z.number().int().positive()).optional(),
  faqs: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1)
  })).optional()
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
    const parsed = createArticleSchema.parse(body);

    const article = await ArticleService.create(parsed);

    return success(c, article, 201);
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