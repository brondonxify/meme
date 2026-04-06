import { createHandler } from 'hono-file-router';
import { z } from 'zod';
import { PaymentService } from '@/services/payment.service.js';
import { success, error } from '@/utils/response.js';

const initiatePaymentSchema = z.object({
    order_id: z.number().int().positive(),
    method: z.enum(['om', 'mtn']),
    phone: z.string().min(1),
    amount: z.number().positive()
});

export default createHandler(async (c) => {
    try {
        const body = await c.req.json();
        const parsed = initiatePaymentSchema.safeParse(body);

        if (!parsed.success) {
            return error(c, 'VALIDATION_ERROR', 'Invalid request body', 400);
        }

        const payment = await PaymentService.initiate(parsed.data);

        return success(c, payment);
    } catch (err: unknown) {
        if (err instanceof Error) {
            return error(c, 'PAYMENT_ERROR', err.message, 400);
        }
        return error(c, 'INTERNAL_ERROR', 'Failed to initiate payment', 500);
    }
});
