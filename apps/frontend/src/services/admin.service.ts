import apiClient from '../lib/api';

export interface DashboardStats {
    totalRevenue: number;
    activeOrders: number;
    totalCustomers: number;
    stockAlerts: number;
}

export const adminService = {
    getStats: async () => {
        const response = await apiClient.get<DashboardStats>('/admin/stats');
        return response.data;
    },

    getCustomers: async () => {
        const response = await apiClient.get<any[]>('/customers'); // Using existing customer endpoints for now
        return response.data;
    },

    getCustomerOrders: async (customerId: number) => {
        const response = await apiClient.get<any[]>(`/orders/customer/${customerId}`);
        return response.data;
    },

    getTransactions: async () => {
        const response = await apiClient.get<any[]>('/admin/payments');
        return response.data;
    },

    getLogistics: async () => {
        const response = await apiClient.get<any[]>('/admin/logistics');
        return response.data;
    },

    updateOrderDelivery: async (id: number, data: { tracking_number: string; carrier?: string; estimated_delivery?: string }) => {
        const response = await apiClient.patch(`/admin/orders/${id}/delivery`, data);
        return response.data;
    },

    refundOrder: async (id: number) => {
        const response = await apiClient.post(`/admin/orders/${id}/refund`);
        return response.data;
    }
};
