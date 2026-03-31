import apiClient from '../lib/api';

export interface PaymentInfo {
    cardName: string;
    cardNumber: string;
    expiry: string;
    cvc: string;
}

export const paymentService = {
    processPayment: async (orderId: number, paymentInfo: PaymentInfo) => {
        const response = await apiClient.post<{ message: string; status: string }>('/payments', {
            orderId,
            paymentInfo
        });
        return response.data;
    }
};
