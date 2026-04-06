import { get } from '@/lib/api-client';
import type { BackendCategory, PaginatedResponse } from '@/types/api';

export const categoriesService = {
  async getAll(): Promise<BackendCategory[]> {
    const response = await get<PaginatedResponse<BackendCategory>>('/api/v1/categories');
    return response.data?.items || response.data || [];
  },

  async getById(id: number): Promise<BackendCategory | null> {
    try {
      const response = await get<BackendCategory>(`/api/v1/categories/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },
};
