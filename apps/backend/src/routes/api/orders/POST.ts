import { createHandler } from 'hono-file-router';
import { OrderService } from '@/services/order.service.js';
import { OrderDetailsService } from '@/services/orderDetails.service.js';
import { ArticleService } from '@/services/article.service.js';

// POST /api/orders - Create new order (checkout)
export default createHandler(async (c) => {
    try {
        const body = await c.req.json();

        if (!body.customer_id || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
            return c.json({ error: 'Validation error', message: 'customer_id and items array are required' }, 400);
        }

        // Calculate total and validate articles
        let totalAmount = 0;
        const orderItems = [];

        for (const item of body.items) {
            if (!item.article_id || !item.quantity) {
                return c.json({ error: 'Validation error', message: 'Each item must have article_id and quantity' }, 400);
            }

            const article = await ArticleService.getById(item.article_id);
            if (!article) {
                return c.json({ error: 'Validation error', message: `Article ${item.article_id} not found` }, 400);
            }

            if (article.stock_quantity < item.quantity) {
                return c.json({ error: 'Validation error', message: `Insufficient stock for ${article.name}` }, 400);
            }

            const unitPrice = article.price;
            totalAmount += unitPrice * item.quantity;

            orderItems.push({
                article_id: item.article_id,
                quantity: item.quantity,
                unit_price: unitPrice
            });
        }

        // Create order
        const orderId = await OrderService.create({
            customer_id: body.customer_id,
            total_amount: totalAmount
        });

        // Create order details and update stock
        for (const item of orderItems) {
            await OrderDetailsService.create({
                order_id: orderId,
                article_id: item.article_id,
                quantity: item.quantity,
                unit_price: item.unit_price
            });

            // Decrease stock
            await ArticleService.updateStock(item.article_id, -item.quantity);
        }

        // Fetch created order with details
        const order = await OrderService.getById(orderId);
        const items = await OrderDetailsService.getByOrder(orderId);

        return c.json({
            ...order,
            items
        }, 201);
    } catch (error: any) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return c.json({ error: 'Validation error', message: 'Customer not found' }, 400);
        }
        return c.json({ error: 'Server Error', message: 'Failed to create order' }, 500);
    }
});
