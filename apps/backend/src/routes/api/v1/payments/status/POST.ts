import { createHandler } from 'hono-file-router';
import { z } from 'zod';
import { PaymentService } from '@/services/payment.service.js';
import { success, error } from '@/utils/response.js';

const statusPaymentSchema = z.object({
    order_id: z.number().int().positive().optional(),
    transaction_id: z.string().optional()
});

export default createHandler(async (c) => {
    try {
        const body = await c.req.json();
        const parsed = statusPaymentSchema.safeParse(body);

        if (!parsed.success) {
            return error(c, 'VALIDATION_ERROR', 'Invalid request body', 400);
        }

        const { order_id, transaction_id } = parsed.data;

        if (!order_id && !transaction_id) {
            return error(c, 'VALIDATION_ERROR', 'Either order_id or transaction_id is required', 400);
        }

        let payment = null;

        if (transaction_id) {
            payment = await PaymentService.getByTransactionId(transaction_id);
        } else if (order_id) {
            payment = await PaymentService.getByOrderId(order_id);
        }

        if (!payment) {
            return error(c, 'NOT_FOUND', 'Payment not found', 404);
        }

        return success(c, payment);
    } catch (err: unknown) {
        return error(c, 'INTERNAL_ERROR', 'Failed to get payment status', 500);
    }
});
