import { createHandler } from 'hono-file-router';
import { CategoryService } from '@/services/category.service.js';

// GET /api/categories/:id - Get category by ID
export default createHandler(async (c) => {
    try {
        const id = parseInt(c.req.param('id'));

        if (isNaN(id)) {
            return c.json({ error: 'Validation error', message: 'Invalid ID' }, 400);
        }

        const category = await CategoryService.getById(id);

        if (!category) {
            return c.json({ error: 'Not Found', message: 'Category not found' }, 404);
        }

        return c.json(category);
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to fetch category' }, 500);
    }
});
