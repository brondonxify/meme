import { createHandler } from 'hono-file-router';
import { OrderService, type OrderStatus } from '@/services/order.service.js';

// PATCH /api/orders/:id/status - Update order status
export default createHandler(async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const body = await c.req.json();

        if (isNaN(id)) {
            return c.json({ error: 'Validation error', message: 'Invalid ID' }, 400);
        }

        const validStatuses: OrderStatus[] = ['pending', 'shipped', 'delivered', 'cancelled'];
        if (!body.status || !validStatuses.includes(body.status)) {
            return c.json({ error: 'Validation error', message: 'Invalid status. Must be: pending, shipped, delivered, or cancelled' }, 400);
        }

        const updated = await OrderService.updateStatus(id, body.status);

        if (!updated) {
            return c.json({ error: 'Not Found', message: 'Order not found' }, 404);
        }

        return c.json({ message: `Order status updated to ${body.status}` });
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to update order status' }, 500);
    }
});
