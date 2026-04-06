import apiClient from '../lib/api';
import { Order, OrderWithDetails, OrderDetail } from 'shared';

export const ordersService = {
    getAll: async () => {
        const response = await apiClient.get<Order[]>('/orders');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<OrderWithDetails>(`/orders/${id}`);
        return response.data;
    },

    getByCustomer: async (customerId: number) => {
        const response = await apiClient.get<Order[]>(`/orders/customer/${customerId}`);
        return response.data;
    },

    create: async (orderData: { customer_id: number; items: { article_id: number; quantity: number }[] }) => {
        const response = await apiClient.post<OrderWithDetails>('/orders', orderData);
        return response.data;
    },

    updateStatus: async (id: number, status: Order['status']) => {
        const response = await apiClient.patch<{ message: string }>(`/orders/${id}/status`, { status });
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete(`/orders/${id}`);
        return response.data;
    },

    // Order Items
    getItems: async (orderId: number) => {
        const response = await apiClient.get<OrderDetail[]>(`/orders/${orderId}/items`);
        return response.data;
    },

    addItem: async (orderId: number, item: Omit<OrderDetail, 'order_id'>) => {
        const response = await apiClient.post<OrderDetail>(`/orders/${orderId}/items`, item);
        return response.data;
    },

    updateItem: async (orderId: number, articleId: number, quantity: number) => {
        const response = await apiClient.put<OrderDetail>(`/orders/${orderId}/items/${articleId}`, { quantity });
        return response.data;
    },

    removeItem: async (orderId: number, articleId: number) => {
        const response = await apiClient.delete(`/orders/${orderId}/items/${articleId}`);
        return response.data;
    },
};
