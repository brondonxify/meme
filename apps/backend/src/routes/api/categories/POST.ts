import { createHandler } from 'hono-file-router';
import { CategoryService } from '@/services/category.service.js';

// POST /api/categories - Create new category
export default createHandler(async (c) => {
    try {
        const body = await c.req.json();
        console.log('[POST /api/categories] Creating category:', body);

        if (!body.name) {
            return c.json({ error: 'Validation error', message: 'Name is required' }, 400);
        }

        const id = await CategoryService.create({
            name: body.name,
            description: body.description
        });

        console.log(`[POST /api/categories] Created category with id: ${id}`);
        return c.json({ id, name: body.name, description: body.description }, 201);
    } catch (error) {
        console.error('[POST /api/categories] Error:', error);
        return c.json({ error: 'Server Error', message: 'Failed to create category' }, 500);
    }
});
