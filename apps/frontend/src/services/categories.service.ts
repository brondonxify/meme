import apiClient from '../lib/api';
import { Category } from 'shared';

export const categoriesService = {
    getAll: async () => {
        const response = await apiClient.get<Category[]>('/categories');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<Category>(`/categories/${id}`);
        return response.data;
    },

    create: async (category: Omit<Category, 'id'>) => {
        const response = await apiClient.post<Category>('/categories', category);
        return response.data;
    },

    update: async (id: number, category: Partial<Category>) => {
        const response = await apiClient.put<Category>(`/categories/${id}`, category);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete(`/categories/${id}`);
        return response.data;
    },
};
