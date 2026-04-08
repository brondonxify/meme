import { apiClientRequest, ApiResponse } from '@/lib/api-client';

export interface Order {
  id: number;
  invoice_no: string;
  customer_id: number;
  coupon_id: number | null;
  total_amount: number;
  shipping_cost: number;
  payment_method: 'om' | 'mtn' | 'cash';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  order_time: string;
  tracking_number: string | null;
  carrier: string | null;
  estimated_delivery: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  customer?: { first_name: string; last_name: string; email: string; phone: string; address?: string };
}

export interface OrderDetails extends Order {
  items: Array<{
    id: number;
    article_id: number;
    quantity: number;
    unit_price: number;
    article?: { name: string; image_url: string | null };
  }>;
  coupon?: { discount_type: "percentage" | "fixed"; discount_value: number };
}

export interface FetchOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
}

export interface FetchOrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchOrders(
  params: FetchOrdersParams = {}
): Promise<FetchOrdersResponse> {
  const { page = 1, limit = 10, search, status, method, startDate, endDate } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));
  if (search) searchParams.set('search', search);
  if (status) searchParams.set('status', status);
  if (method) searchParams.set('method', method);
  if (startDate) searchParams.set('startDate', startDate);
  if (endDate) searchParams.set('endDate', endDate);

  const response = await apiClientRequest<ApiResponse<Order[]>>(
    `/api/v1/orders?${searchParams.toString()}`
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

export async function fetchOrderDetails(id: string): Promise<{ order: OrderDetails }> {
  const response = await apiClientRequest<ApiResponse<OrderDetails>>(
    `/api/v1/orders/${id}`
  );
  return { order: response.data! };
}

export async function updateOrderStatus(id: string, status: string) {
  return apiClientRequest<ApiResponse<null>>(`/api/v1/orders/${id}/status`, {
    method: 'PATCH',
    data: { status },
  });
}

export async function deleteOrder(id: string) {
  return apiClientRequest<ApiResponse<null>>(`/api/v1/orders/${id}`, {
    method: 'DELETE',
  });
}
