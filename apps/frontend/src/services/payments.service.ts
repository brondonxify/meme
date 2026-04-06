import { post } from '@/lib/api-client';
import type { BackendPayment, InitiatePaymentDto } from '@/types/api';

export const paymentsService = {
  async initiate(data: InitiatePaymentDto): Promise<BackendPayment> {
    const response = await post<BackendPayment>('/api/v1/payments/initiate', data);
    return response.data;
  },

  async getStatus(orderId: number, reference?: string): Promise<BackendPayment | null> {
    try {
      const response = await post<BackendPayment>('/api/v1/payments/status', {
        order_id: orderId,
        reference,
      });
      return response.data;
    } catch {
      return null;
    }
  },
};
