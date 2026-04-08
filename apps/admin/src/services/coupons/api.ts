import { apiClientRequest } from '@/lib/api-client';
import type { BackendCoupon, PaginatedResponse } from '@/types/backend-api';

export interface FetchCouponsParams {
  page?: number;
  limit?: number;
  search?: string;
}

import { ApiResponse } from '@/lib/api-client';

export async function fetchCoupons({
  page = 1,
  limit = 20,
  search,
}: FetchCouponsParams): Promise<PaginatedResponse<BackendCoupon>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search && { search }),
  });

  const response = await apiClientRequest<ApiResponse<PaginatedResponse<BackendCoupon>>>(
    `/api/v1/coupons?${params.toString()}`
  );
  
  // Unwrap the API response
  const paginatedData = response.data;
  
  return {
    items: paginatedData?.items || [],
    total: paginatedData?.total || 0,
    page: paginatedData?.page || page,
    limit: paginatedData?.limit || limit
  };
}

export interface CreateCouponDto {
  campaign_name: string;
  code: string;
  image_url?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date: string;
  published?: boolean;
}

export async function createCoupon(data: CreateCouponDto): Promise<BackendCoupon> {
  const response = await apiClientRequest<{ data: BackendCoupon }>(
    '/api/v1/coupons',
    {
      method: 'POST',
      data,
    }
  );

  return response.data;
}

export interface UpdateCouponDto {
  campaign_name?: string;
  code?: string;
  image_url?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  start_date?: string;
  end_date?: string;
  published?: boolean;
}

export async function updateCoupon(
  id: number,
  data: UpdateCouponDto
): Promise<BackendCoupon> {
  const response = await apiClientRequest<{ data: BackendCoupon }>(
    `/api/v1/coupons/${id}`,
    {
      method: 'PUT',
      data,
    }
  );

  return response.data;
}

export async function deleteCoupon(id: number): Promise<void> {
  await apiClientRequest<void>(`/api/v1/coupons/${id}`, {
    method: 'DELETE',
  });
}
