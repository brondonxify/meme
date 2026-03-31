import { createHandler } from 'hono-file-router';
import { ArticleService } from '@/services/article.service.js';

// PUT /api/articles/:id - Update article
export default createHandler(async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const body = await c.req.json();

        if (isNaN(id)) {
            return c.json({ error: 'Validation error', message: 'Invalid ID' }, 400);
        }

        const updated = await ArticleService.update(id, {
            name: body.name,
            description: body.description,
            price: body.price,
            stock_quantity: body.stock_quantity,
            image_url: body.image_url,
            category_id: body.category_id
        });

        if (!updated) {
            return c.json({ error: 'Not Found', message: 'Article not found or no changes' }, 404);
        }

        return c.json({ message: 'Article updated successfully' });
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to update article' }, 500);
    }
});
