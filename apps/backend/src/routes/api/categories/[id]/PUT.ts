import { createHandler } from 'hono-file-router';
import { CategoryService } from '@/services/category.service.js';

// PUT /api/categories/:id - Update category
export default createHandler(async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const body = await c.req.json();

        if (isNaN(id)) {
            return c.json({ error: 'Validation error', message: 'Invalid ID' }, 400);
        }

        const updated = await CategoryService.update(id, {
            name: body.name,
            description: body.description
        });

        if (!updated) {
            return c.json({ error: 'Not Found', message: 'Category not found or no changes' }, 404);
        }

        return c.json({ message: 'Category updated successfully' });
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to update category' }, 500);
    }
});
