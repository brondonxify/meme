import { apiClientRequest, ApiResponse } from '@/lib/api-client';
import { Pagination } from '@/types/pagination';
import {
  Product,
  FetchProductsParams,
  FetchProductsResponse,
  ProductDetails,
} from './types';

export async function fetchProducts(
  params: FetchProductsParams = {}
): Promise<FetchProductsResponse> {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    priceSort,
    status,
    published,
    dateSort,
  } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));
  if (search) searchParams.set('search', search);
  if (category) searchParams.set('categoryId', category);
  if (published !== undefined) searchParams.set('published', String(published));
  if (dateSort) searchParams.set('dateSort', dateSort);
  if (priceSort) searchParams.set('priceSort', priceSort);
  if (status) searchParams.set('status', status);

  const response = await apiClientRequest<ApiResponse<Product[]>>(
    `/api/v1/articles?${searchParams.toString()}`
  );

  const responseData = response.data as any;
  const items = responseData?.items || response.data || [];
  const meta = responseData?.total ? responseData : (response.meta || { total: items.length, page, limit });
  const totalPages = Math.ceil(meta.total / meta.limit);

  return {
    data: items,
    pagination: {
      limit: meta.limit,
      current: meta.page,
      items: meta.total,
      pages: totalPages,
      next: meta.page < totalPages ? meta.page + 1 : null,
      prev: meta.page > 1 ? meta.page - 1 : null,
    },
  };
}

export async function fetchProductDetails(slug: string): Promise<{ product: ProductDetails }> {
  const response = await apiClientRequest<ApiResponse<ProductDetails>>(
    `/api/v1/articles/${slug}`
  );
  return { product: response.data! };
}

export async function createProduct(data: Partial<Product>) {
  return apiClientRequest<ApiResponse<Product>>('/api/v1/articles', {
    method: 'POST',
    data,
  });
}

export async function updateProduct(id: string, data: Partial<Product>) {
  return apiClientRequest<ApiResponse<Product>>(`/api/v1/articles/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteProduct(id: string) {
  return apiClientRequest<ApiResponse<null>>(`/api/v1/articles/${id}`, {
    method: 'DELETE',
  });
}
