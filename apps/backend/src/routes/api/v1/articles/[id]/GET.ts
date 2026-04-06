import { createHandler } from 'hono-file-router';
import { ArticleService } from '@/services/article.service.js';
import { success, error } from '@/utils/response.js';

export default createHandler(async (c) => {
  try {
    const param = c.req.param('id');
    const id = parseInt(param, 10);

    let article;
    if (isNaN(id)) {
      // Try lookup by slug
      article = await ArticleService.getBySlug(param);
    } else {
      article = await ArticleService.getById(id);
    }

    if (!article) {
      return error(c, 'NOT_FOUND', 'Article not found', 404);
    }

    return success(c, article);
  } catch (err: unknown) {
    console.error('Failed to fetch article:', err);
    return error(c, 'INTERNAL_ERROR', 'Failed to fetch article', 500);
  }
});