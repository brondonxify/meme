import apiClient from '../lib/api';
import { Customer } from 'shared';

export const customersService = {
    getAll: async () => {
        const response = await apiClient.get<Customer[]>('/customers');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<Customer>(`/customers/${id}`);
        return response.data;
    },

    update: async (id: number, customer: Partial<Customer>) => {
        const response = await apiClient.put<{ message: string }>(`/customers/${id}`, customer);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete(`/customers/${id}`);
        return response.data;
    },
};
