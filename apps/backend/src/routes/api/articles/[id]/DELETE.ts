import { createHandler } from 'hono-file-router';
import { ArticleService } from '@/services/article.service.js';

// DELETE /api/articles/:id - Delete article
export default createHandler(async (c) => {
    try {
        const id = parseInt(c.req.param('id'));

        if (isNaN(id)) {
            return c.json({ error: 'Validation error', message: 'Invalid ID' }, 400);
        }

        const deleted = await ArticleService.delete(id);

        if (!deleted) {
            return c.json({ error: 'Not Found', message: 'Article not found' }, 404);
        }

        return c.json({ message: 'Article deleted successfully' });
    } catch (error: any) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return c.json({ error: 'Conflict', message: 'Cannot delete article in active orders' }, 409);
        }
        return c.json({ error: 'Server Error', message: 'Failed to delete article' }, 500);
    }
});
