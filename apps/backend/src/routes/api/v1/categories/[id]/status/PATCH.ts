import { createHandler } from 'hono-file-router';
import { CategoryService } from '@/services/category.service.js';
import { success, error } from '@/utils/response.js';

export default createHandler(async (c) => {
  try {
    const param = c.req.param('id');
    const id = parseInt(param, 10);

    if (isNaN(id)) {
      return error(c, 'BAD_REQUEST', 'Invalid category ID', 400);
    }

    const category = await CategoryService.getById(id);
    if (!category) {
      return error(c, 'NOT_FOUND', 'Category not found', 404);
    }

    await CategoryService.update(id, { published: !category.published });
    const updated = await CategoryService.getById(id);

    return success(c, updated);
  } catch (err: unknown) {
    return error(c, 'INTERNAL_ERROR', 'Failed to toggle category status', 500);
  }
});
