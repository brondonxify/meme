import { createHandler } from 'hono-file-router';
import { ArticleService } from '@/services/article.service.js';

// GET /api/articles/:id - Get article by ID
export default createHandler(async (c) => {
    try {
        const id = parseInt(c.req.param('id'));

        if (isNaN(id)) {
            return c.json({ error: 'Validation error', message: 'Invalid ID' }, 400);
        }

        const article = await ArticleService.getById(id);

        if (!article) {
            return c.json({ error: 'Not Found', message: 'Article not found' }, 404);
        }

        return c.json(article);
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to fetch article' }, 500);
    }
});
