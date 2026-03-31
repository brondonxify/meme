import { createHandler } from 'hono-file-router';
import { OrderService } from '@/services/order.service.js';

// GET /api/orders - Get all orders (Admin only)
export default createHandler(async (c) => {
    try {
        const orders = await OrderService.getAll();
        return c.json(orders);
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to fetch orders' }, 500);
    }
});
