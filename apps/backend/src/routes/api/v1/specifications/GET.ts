import { createHandler } from 'hono-file-router';
import { SpecificationService } from '@/services/specification.service.js';
import { success, error } from '@/utils/response.js';

export default createHandler(async (c) => {
    try {
        const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
        const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20', 10)));

        const result = await SpecificationService.getAll(page, limit);

        return success(c, {
            items: result.items,
            total: result.total,
            page: result.page,
            limit: result.limit
        });
    } catch (err: unknown) {
        return error(c, 'INTERNAL_ERROR', 'Failed to fetch specifications', 500);
    }
});
