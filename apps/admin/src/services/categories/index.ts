import { apiClientRequest, ApiResponse } from '@/lib/api-client';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryDropdown {
  id: number;
  name: string;
  slug: string;
}

export interface FetchCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FetchCategoriesResponse {
  data: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchCategories(
  params: FetchCategoriesParams = {}
): Promise<FetchCategoriesResponse> {
  const { page = 1, limit = 10, search } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));
  if (search) searchParams.set('search', search);

  const response = await apiClientRequest<ApiResponse<Category[]>>(
    `/api/v1/categories?${searchParams.toString()}`
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

export async function fetchCategoriesDropdown(): Promise<CategoryDropdown[]> {
  const response = await apiClientRequest<ApiResponse<Category[]>>(
    '/api/v1/categories?limit=100'
  );
  const responseData = response.data as any;
  const items = responseData?.items || response.data || [];
  return (items).map((c: Category) => ({ id: c.id, name: c.name, slug: c.slug }));
}

export async function createCategory(data: Partial<Category>) {
  return apiClientRequest<ApiResponse<Category>>('/api/v1/categories', {
    method: 'POST',
    data,
  });
}

export async function updateCategory(id: number, data: Partial<Category>) {
  return apiClientRequest<ApiResponse<Category>>(`/api/v1/categories/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteCategory(id: number) {
  return apiClientRequest<ApiResponse<null>>(`/api/v1/categories/${id}`, {
    method: 'DELETE',
  });
}
