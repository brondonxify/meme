import { apiClientRequest, ApiResponse } from '@/lib/api-client';

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerOrder {
  id: number;
  invoice_no: string;
  order_time: string;
  payment_method: string;
  total_amount: number;
  status: string;
}

export interface FetchCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FetchCustomersResponse {
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchCustomers(
  params: FetchCustomersParams = {}
): Promise<FetchCustomersResponse> {
  const { page = 1, limit = 10, search } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));
  if (search) searchParams.set('search', search);

  const response = await apiClientRequest<ApiResponse<Customer[]>>(
    `/api/v1/customers?${searchParams.toString()}`
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

export async function fetchCustomerOrders(id: string): Promise<{ customerOrders: CustomerOrder[] }> {
  const response = await apiClientRequest<ApiResponse<CustomerOrder[]>>(
    `/api/v1/orders?customerId=${id}&limit=100`
  );
  const responseData = response.data as any;
  const items = responseData?.items || response.data || [];
  return { customerOrders: items };
}

export async function createCustomer(data: Partial<Customer>) {
  return apiClientRequest<ApiResponse<Customer>>('/api/v1/customers', {
    method: 'POST',
    data,
  });
}

export async function updateCustomer(id: number, data: Partial<Customer>) {
  return apiClientRequest<ApiResponse<Customer>>(`/api/v1/customers/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteCustomer(id: number) {
  return apiClientRequest<ApiResponse<null>>(`/api/v1/customers/${id}`, {
    method: 'DELETE',
  });
}
