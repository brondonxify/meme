import { put } from '@/lib/api-client';
import type { BackendCustomer } from '@/types/api';

export const customersService = {
  async updateProfile(data: Partial<BackendCustomer>): Promise<BackendCustomer> {
    const response = await put<BackendCustomer>('/api/v1/customers/me', data);
    return response.data;
  },
};
