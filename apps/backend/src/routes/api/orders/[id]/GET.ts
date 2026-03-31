import { createHandler } from 'hono-file-router';
import { OrderService } from '@/services/order.service.js';
import { OrderDetailsService } from '@/services/orderDetails.service.js';

// GET /api/orders/:id - Get order by ID with details
export default createHandler(async (c) => {
    try {
        const id = parseInt(c.req.param('id'));

        if (isNaN(id)) {
            return c.json({ error: 'Validation error', message: 'Invalid ID' }, 400);
        }

        const order = await OrderService.getById(id);

        if (!order) {
            return c.json({ error: 'Not Found', message: 'Order not found' }, 404);
        }

        const items = await OrderDetailsService.getByOrderWithArticle(id);

        return c.json({
            ...order,
            items
        });
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to fetch order' }, 500);
    }
});
