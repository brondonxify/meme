import { createHandler } from 'hono-file-router';
import { OrderService } from '@/services/order.service.js';

// PATCH /api/admin/orders/:id/delivery - Update tracking and carrier
export default createHandler(async (c) => {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();

    try {
        const success = await OrderService.updateTracking(id, {
            tracking_number: body.tracking_number,
            carrier: body.carrier,
            estimated_delivery: body.estimated_delivery ? new Date(body.estimated_delivery) : undefined
        });

        if (!success) {
            return c.json({ message: 'Order not found or no changes made' }, 404);
        }

        return c.json({ message: 'Delivery information updated' });
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});
