import { createHandler } from 'hono-file-router';
import { OrderService } from '@/services/order.service.js';

// POST /api/admin/orders/:id/refund - Refund an order and restore stock
export default createHandler(async (c) => {
    const id = Number(c.req.param('id'));

    try {
        const success = await OrderService.refund(id);
        if (!success) {
            return c.json({ message: 'Order not found or already processed' }, 404);
        }
        return c.json({ message: 'Order refunded and stock restored' });
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});
