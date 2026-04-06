import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import { ArticleService } from '@/services/article.service.js';
import { success, error } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';

const reviewSchema = z.object({
  user: z.string().min(1).max(50),
  content: z.string().min(1).max(1000),
  rating: z.number().int().min(1).max(5).default(5)
});

export default createHandler(async (c) => {
  try {
    const articleId = parseInt(c.req.param('id'), 10);
    if (isNaN(articleId)) {
      return error(c, 'INVALID_ID', 'Invalid article ID', 400);
    }

    const body = await c.req.json();
    const parsed = reviewSchema.parse(body);

    const review = await ArticleService.addReview(
      articleId, 
      parsed.user, 
      parsed.content, 
      parsed.rating
    );

    return success(c, review, 201);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return error(c, 'VALIDATION_ERROR', err.errors[0].message, 400);
    }
    console.error('Failed to add review:', err);
    return error(c, 'INTERNAL_ERROR', 'Failed to add review', 500);
  }
});
