import { createHandler } from 'hono-file-router';
import { CategoryService } from '@/services/category.service.js';
import { success, error } from '@/utils/response.js';

export default createHandler(async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
      return error(c, 'INVALID_ID', 'Invalid category ID', 400);
    }

    const category = await CategoryService.getById(id);

    if (!category) {
      return error(c, 'NOT_FOUND', 'Category not found', 404);
    }

    return success(c, category);
  } catch (err: unknown) {
    return error(c, 'INTERNAL_ERROR', 'Failed to fetch category', 500);
  }
});
