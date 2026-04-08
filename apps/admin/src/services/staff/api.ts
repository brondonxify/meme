import { apiClientRequest } from '@/lib/api-client';
import type { BackendStaff, BackendStaffRole, PaginatedResponse } from '@/types/backend-api';

export interface FetchStaffParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export async function fetchStaff({
  page = 1,
  limit = 20,
  search,
  role,
}: FetchStaffParams): Promise<PaginatedResponse<BackendStaff>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search && { search }),
    ...(role && { role }),
  });

  return apiClientRequest<PaginatedResponse<BackendStaff>>(
    `/api/v1/staff?${params.toString()}`
  );
}

export async function fetchStaffRoles(): Promise<PaginatedResponse<BackendStaffRole>> {
  return apiClientRequest<PaginatedResponse<BackendStaffRole>>(
    '/api/v1/staff-roles'
  );
}

export interface CreateStaffDto {
  email: string;
  name: string;
  phone?: string;
  image_url?: string;
  role_id: number;
  joining_date: string;
  published?: boolean;
}

export async function createStaff(data: CreateStaffDto): Promise<BackendStaff> {
  const response = await apiClientRequest<{ data: BackendStaff }>(
    '/api/v1/staff',
    {
      method: 'POST',
      data,
    }
  );

  return response.data;
}

export interface UpdateStaffDto {
  email?: string;
  name?: string;
  phone?: string;
  image_url?: string;
  role_id?: number;
  joining_date?: string;
  published?: boolean;
}

export async function updateStaff(
  id: number,
  data: UpdateStaffDto
): Promise<BackendStaff> {
  const response = await apiClientRequest<{ data: BackendStaff }>(
    `/api/v1/staff/${id}`,
    {
      method: 'PUT',
      data,
    }
  );

  return response.data;
}

export async function deleteStaff(id: number): Promise<void> {
  await apiClientRequest<void>(`/api/v1/staff/${id}`, {
    method: 'DELETE',
  });
}
