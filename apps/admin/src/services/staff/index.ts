import { apiClientRequest, ApiResponse } from '@/lib/api-client';

export interface Staff {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  image_url: string | null;
  role_id: number;
  joining_date: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  role?: { name: string; display_name: string };
}

export interface StaffRole {
  id: number;
  name: string;
  display_name: string;
  is_default: boolean;
}

export interface FetchStaffParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface FetchStaffResponse {
  data: Staff[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchStaff(
  params: FetchStaffParams = {}
): Promise<FetchStaffResponse> {
  const { page = 1, limit = 10, search, role } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));
  if (search) searchParams.set('search', search);
  if (role) searchParams.set('role', role);

  const response = await apiClientRequest<ApiResponse<Staff[]>>(
    `/api/v1/staff?${searchParams.toString()}`
  );

  const responseData = response.data as any;
  const items = responseData?.items || response.data || [];
  const meta = responseData?.total ? responseData : (response.meta || { total: items.length, page, limit });

  return {
    data: items,
    pagination: {
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  };
}

export async function fetchStaffRolesDropdown(): Promise<StaffRole[]> {
  const response = await apiClientRequest<ApiResponse<StaffRole[]>>(
    '/api/v1/staff-roles'
  );
  const responseData = response.data as any;
  return responseData?.items || response.data || [];
}

export async function createStaff(data: Partial<Staff>) {
  return apiClientRequest<ApiResponse<Staff>>('/api/v1/staff', {
    method: 'POST',
    data,
  });
}

export async function updateStaff(id: number, data: Partial<Staff>) {
  return apiClientRequest<ApiResponse<Staff>>(`/api/v1/staff/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteStaff(id: number) {
  return apiClientRequest<ApiResponse<null>>(`/api/v1/staff/${id}`, {
    method: 'DELETE',
  });
}

export async function toggleStaffStatus(id: number, published: boolean) {
  return apiClientRequest<ApiResponse<Staff>>(`/api/v1/staff/${id}`, {
    method: 'PUT',
    data: { published },
  });
}

export async function fetchStaffDetails(): Promise<Staff | null> {
  const response = await apiClientRequest<ApiResponse<Staff>>('/api/v1/staff/me');
  return response.data || null;
}
