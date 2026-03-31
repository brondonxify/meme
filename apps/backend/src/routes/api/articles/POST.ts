import { createHandler } from 'hono-file-router';
import { ArticleService } from '@/services/article.service.js';

// POST /api/articles - Create new article
export default createHandler(async (c) => {
    try {
        const body = await c.req.json();

        if (!body.name || !body.price || !body.category_id) {
            return c.json({ error: 'Validation error', message: 'Name, price, and category_id are required' }, 400);
        }

        const id = await ArticleService.create({
            name: body.name,
            description: body.description,
            price: body.price,
            stock_quantity: body.stock_quantity || 0,
            image_url: body.image_url,
            category_id: body.category_id
        });

        return c.json({ id, message: 'Article created successfully' }, 201);
    } catch (error: any) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return c.json({ error: 'Validation error', message: 'Category not found' }, 400);
        }
        return c.json({ error: 'Server Error', message: 'Failed to create article' }, 500);
    }
});
