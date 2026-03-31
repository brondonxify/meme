import { OrderService } from './order.service.js';
import { ArticleService } from './article.service.js';
import { OrderDetailsService } from './orderDetails.service.js';

export const PaymentService = {
    async processPayment(orderId: number, paymentInfo: any): Promise<{ success: boolean; message: string }> {
        // In a real app, this would integrate with Stripe/PayPal
        console.log(`[Payment] Processing payment for Order #${orderId}`);

        // Mock payment validation logic
        const paymentSuccessful = true;

        if (paymentSuccessful) {
            // 1. Update order payment status
            await OrderService.updatePaymentStatus(orderId, 'paid');

            // Note: Stock was already reduced in the Order POST route 
            // to reserve items during checkout.

            // 2. Generate a mock tracking number
            const trackingNumber = `HI-TECH-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
            const estimatedDelivery = new Date();
            estimatedDelivery.setDate(estimatedDelivery.getDate() + 2); // 48h delivery

            await OrderService.updateTracking(orderId, {
                tracking_number: trackingNumber,
                estimated_delivery: estimatedDelivery,
                carrier: 'Hi-Tech Logistics'
            });
            await OrderService.updateStatus(orderId, 'shipped');

            return { success: true, message: 'Payment processed and status updated' };
        }

        // Handle failure: Restore stock here if we want to cancel the order immediately
        const details = await OrderDetailsService.getByOrder(orderId);
        for (const item of details) {
            await ArticleService.updateStock(item.article_id, item.quantity);
        }

        await OrderService.updatePaymentStatus(orderId, 'failed');
        await OrderService.updateStatus(orderId, 'cancelled');

        return { success: false, message: 'Payment failed' };
    }
};
