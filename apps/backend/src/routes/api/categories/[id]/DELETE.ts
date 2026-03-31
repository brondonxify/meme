import { createHandler } from 'hono-file-router';
import { CategoryService } from '@/services/category.service.js';

// DELETE /api/categories/:id - Delete category
export default createHandler(async (c) => {
    try {
        const id = parseInt(c.req.param('id'));

        if (isNaN(id)) {
            return c.json({ error: 'Validation error', message: 'Invalid ID' }, 400);
        }

        const deleted = await CategoryService.delete(id);

        if (!deleted) {
            return c.json({ error: 'Not Found', message: 'Category not found' }, 404);
        }

        return c.json({ message: 'Category deleted successfully' });
    } catch (error: any) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return c.json({ error: 'Conflict', message: 'Cannot delete category with articles' }, 409);
        }
        return c.json({ error: 'Server Error', message: 'Failed to delete category' }, 500);
    }
});
