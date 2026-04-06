import { createHandler } from 'hono-file-router';
import { ArticleService } from '@/services/article.service.js';
import { success, error } from '@/utils/response.js';

export default createHandler(async (c) => {
  try {
    const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20', 10)));
    const categoryId = c.req.query('categoryId');
    const category = c.req.query('category');
    const search = c.req.query('search');
    const sort = c.req.query('sort');
    const minPrice = c.req.query('minPrice');
    const maxPrice = c.req.query('maxPrice');

    const result = await ArticleService.getAll(
      page,
      limit,
      categoryId ? parseInt(categoryId, 10) : undefined,
      search,
      sort,
      minPrice ? parseFloat(minPrice) : undefined,
      maxPrice ? parseFloat(maxPrice) : undefined,
      category
    );

    return success(c, {
      items: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (err: unknown) {
    return error(c, 'INTERNAL_ERROR', 'Failed to fetch articles', 500);
  }
});