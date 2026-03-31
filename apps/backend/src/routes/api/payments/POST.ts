import { createHandler } from 'hono-file-router';
import { PaymentService } from '@/services/payment.service.js';

// POST /api/payments - Process payment
export default createHandler(async (c) => {
    try {
        const body = await c.req.json();
        const { orderId, paymentInfo } = body;

        if (!orderId) {
            return c.json({ message: 'Order ID is required' }, 400);
        }

        const result = await PaymentService.processPayment(Number(orderId), paymentInfo);

        if (result.success) {
            return c.json({ message: result.message, status: 'success' });
        } else {
            return c.json({ message: result.message, status: 'failure' }, 402);
        }
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});
