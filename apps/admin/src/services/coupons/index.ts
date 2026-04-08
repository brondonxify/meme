import { apiClientRequest, ApiResponse } from '@/lib/api-client';

export interface Coupon {
  id: number;
  campaign_name: string;
  code: string;
  image_url: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface FetchCouponsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FetchCouponsResponse {
  data: Coupon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchCoupons(
  params: FetchCouponsParams = {}
): Promise<FetchCouponsResponse> {
  const { page = 1, limit = 10, search } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));
  if (search) searchParams.set('search', search);

  const response = await apiClientRequest<ApiResponse<Coupon[]>>(
    `/api/v1/coupons?${searchParams.toString()}`
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

export async function createCoupon(data: Partial<Coupon>) {
  return apiClientRequest<ApiResponse<Coupon>>('/api/v1/coupons', {
    method: 'POST',
    data,
  });
}

export async function updateCoupon(id: number, data: Partial<Coupon>) {
  return apiClientRequest<ApiResponse<Coupon>>(`/api/v1/coupons/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteCoupon(id: number) {
  return apiClientRequest<ApiResponse<null>>(`/api/v1/coupons/${id}`, {
    method: 'DELETE',
  });
}

// Bulk operations for managing multiple coupons

export async function bulkUpdateCoupons(
  couponIds: string[],
  data: Partial<Pick<Coupon, 'published'>>
) {
  const results = await Promise.all(
    couponIds.map((id) =>
      apiClientRequest<ApiResponse<Coupon>>(`/api/v1/coupons/${id}`, {
        method: 'PUT',
        data,
      })
    )
  );
  return results;
}

export async function bulkDeleteCoupons(couponIds: string[]) {
  const results = await Promise.all(
    couponIds.map((id) =>
      apiClientRequest<ApiResponse<null>>(`/api/v1/coupons/${id}`, {
        method: 'DELETE',
      })
    )
  );
  return results;
}

export async function fetchAllCoupons(): Promise<Coupon[]> {
  // Fetch with high limit to get all coupons for export
  const response = await apiClientRequest<ApiResponse<Coupon[]>>(
    '/api/v1/coupons?limit=10000'
  );
  const responseData = response.data as any;
  const items = responseData?.items || response.data || [];
  return items;
}
