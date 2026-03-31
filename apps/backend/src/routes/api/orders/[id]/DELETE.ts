import { createHandler } from 'hono-file-router';
import { OrderService } from '@/services/order.service.js';

// DELETE /api/orders/:id - Delete order
export default createHandler(async (c) => {
    try {
        const id = parseInt(c.req.param('id'));

        if (isNaN(id)) {
            return c.json({ error: 'Validation error', message: 'Invalid ID' }, 400);
        }

        const deleted = await OrderService.delete(id);

        if (!deleted) {
            return c.json({ error: 'Not Found', message: 'Order not found' }, 404);
        }

        return c.json({ message: 'Order deleted successfully' });
    } catch (error) {
        return c.json({ error: 'Server Error', message: 'Failed to delete order' }, 500);
    }
});
