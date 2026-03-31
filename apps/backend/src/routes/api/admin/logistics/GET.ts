import { createHandler } from 'hono-file-router';
import { OrderService } from '@/services/order.service.js';

// GET /api/admin/logistics - Get orders that are being shipped or delivered
export default createHandler(async (c) => {
    try {
        const orders = await OrderService.getAll();
        const logistics = orders.filter(o => ['shipped', 'delivered'].includes(o.status));
        return c.json(logistics);
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});
