import { createHandler } from 'hono-file-router';
import { OrderService } from '@/services/order.service.js';

// GET /api/admin/payments - Get transaction history for admin
export default createHandler(async (c) => {
    try {
        const orders = await OrderService.getAll();
        // Return only orders with payment activity or all for ledger
        return c.json(orders);
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});
