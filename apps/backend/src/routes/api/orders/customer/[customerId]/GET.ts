import { createHandler } from 'hono-file-router';
import { OrderService } from '../../../../../services/order.service.js';

// GET /api/orders/customer/:customerId - Get customer's orders
export default createHandler(async (c) => {
    try {
        const customerId = parseInt(c.req.param('customerId'));

        if (isNaN(customerId)) {
            return c.json({ error: 'Validation error', message: 'Invalid customer ID' }, 400);
        }

        const orders = await OrderService.getByCustomer(customerId);
        return c.json(orders);
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to fetch orders' }, 500);
    }
});
