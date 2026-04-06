import apiClient from '../lib/api';
import { Admin } from 'shared';

export const adminManagementService = {
    getAll: async () => {
        const response = await apiClient.get<Admin[]>('/admins');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<Admin>(`/admins/${id}`);
        return response.data;
    },

    create: async (admin: Omit<Admin, 'id' | 'created_at'>) => {
        const response = await apiClient.post<Admin>('/admins', admin);
        return response.data;
    },

    update: async (id: number, admin: Partial<Admin>) => {
        const response = await apiClient.put<Admin>(`/admins/${id}`, admin);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete(`/admins/${id}`);
        return response.data;
    },
};
