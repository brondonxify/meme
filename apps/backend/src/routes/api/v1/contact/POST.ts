import { createHandler } from 'hono-file-router';
import { z } from 'zod';
import { ContactService } from '@/services/contact.service.js';
import { success, error } from '@/utils/response.js';

const createContactSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    subject: z.string().min(1).max(200),
    message: z.string().min(1)
});

export default createHandler(async (c) => {
    try {
        const body = await c.req.json();
        const parsed = createContactSchema.safeParse(body);

        if (!parsed.success) {
            return error(c, 'VALIDATION_ERROR', 'Invalid request body', 400);
        }

        const contact = await ContactService.create(parsed.data);

        return success(c, contact, 201);
    } catch (err: unknown) {
        return error(c, 'INTERNAL_ERROR', 'Failed to create contact message', 500);
    }
});
