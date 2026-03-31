import { createHandler } from 'hono-file-router';
import { CategoryService } from '@/services/category.service.js';

// GET /api/categories - Get all categories
export default createHandler(async (c) => {
    try {
        console.log('[GET /api/categories] Fetching all categories...');
        const categories = await CategoryService.getAll();
        console.log(`[GET /api/categories] Found ${categories.length} categories`);
        return c.json(categories);
    } catch (error) {
        console.error('[GET /api/categories] Error:', error);
        return c.json({ error: 'Server Error', message: 'Failed to fetch categories' }, 500);
    }
});
