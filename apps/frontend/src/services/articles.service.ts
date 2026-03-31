import apiClient from '../lib/api';
import { Article } from 'shared';

export interface ArticleFilters {
    category?: number;
    search?: string;
    specs?: number[];
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export const articlesService = {
    getAll: async (params?: ArticleFilters) => {
        const queryParams = {
            ...params,
            specs: params?.specs?.length ? params.specs.join(',') : undefined
        };
        const response = await apiClient.get<PaginatedResponse<Article>>('/articles', { params: queryParams });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<Article>(`/articles/${id}`);
        return response.data;
    },

    getByCategory: async (categoryId: number) => {
        const response = await apiClient.get<Article[]>(`/articles/category/${categoryId}`);
        return response.data;
    },

    create: async (article: Omit<Article, 'id' | 'created_at'>) => {
        const response = await apiClient.post<{ id: number; message: string }>('/articles', article);
        return response.data;
    },

    update: async (id: number, article: Partial<Article>) => {
        const response = await apiClient.put(`/articles/${id}`, article);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete(`/articles/${id}`);
        return response.data;
    },

    updateStock: async (id: number, quantity: number) => {
        const response = await apiClient.patch(`/articles/${id}/stock`, { quantity });
        return response.data;
    },
};
