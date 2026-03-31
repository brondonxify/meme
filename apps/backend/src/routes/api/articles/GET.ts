import { createHandler } from 'hono-file-router';
import { ArticleService } from '@/services/article.service.js';

// GET /api/articles - Get all articles with filtering
export default createHandler(async (c) => {
    try {
        const category = c.req.query('category');
        const search = c.req.query('search');
        const specs = c.req.query('specs')?.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '10');

        const articles = await ArticleService.getAll({
            category: category ? parseInt(category) : undefined,
            search: search,
            specs: specs
        });

        // Simple mock pagination for now
        return c.json({
            data: articles,
            total: articles.length,
            page: page,
            limit: limit
        });
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to fetch articles' }, 500);
    }
});
