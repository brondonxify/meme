import { createHandler } from 'hono-file-router';
import { SpecificationService } from '@/services/specification.service.js';

// GET /api/specifications - Get all specifications
export default createHandler(async (c) => {
    try {
        const specs = await SpecificationService.getAll();
        return c.json(specs);
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to fetch specifications' }, 500);
    }
});
