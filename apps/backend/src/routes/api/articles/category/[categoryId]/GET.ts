import { createHandler } from 'hono-file-router';
import { ArticleService } from '../../../../../services/article.service.js';

// GET /api/articles/category/:categoryId - Get articles by category
export default createHandler(async (c) => {
    try {
        const categoryId = parseInt(c.req.param('categoryId'));

        if (isNaN(categoryId)) {
            return c.json({ error: 'Validation error', message: 'Invalid category ID' }, 400);
        }

        const articles = await ArticleService.getByCategory(categoryId);
        return c.json(articles);
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to fetch articles' }, 500);
    }
});
