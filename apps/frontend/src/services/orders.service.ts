import { post, get } from '@/lib/api-client';
import type { BackendOrder, CreateOrderDto, PaginatedResponse } from '@/types/api';

export const ordersService = {
  async create(data: CreateOrderDto): Promise<BackendOrder> {
    const response = await post<BackendOrder>('/api/v1/orders', data);
    return response.data;
  },

  async getMyOrders(page = 1, limit = 20): Promise<PaginatedResponse<BackendOrder>> {
    const response = await get<PaginatedResponse<BackendOrder>>(
      `/api/v1/auth/customer/orders?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async getMyOrderById(id: number): Promise<BackendOrder | null> {
    try {
      const response = await get<BackendOrder>(`/api/v1/auth/customer/orders/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },

  async getOrderById(id: number): Promise<BackendOrder | null> {
    try {
      const response = await get<BackendOrder>(`/api/v1/orders/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },
};
