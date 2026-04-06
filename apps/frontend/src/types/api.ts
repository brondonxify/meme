// === Backend Response Wrappers ===
export interface BackendResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export interface BackendError {
  success: false;
  error: string;
  code: string;
}

// === Backend Models ===
export interface BackendArticle {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  selling_price: number;
  cost_price: number | null;
  stock: number;
  min_stock_threshold: number | null;
  published: boolean;
  sku: string | null;
  category_id: number | null;
  created_at: string;
  updated_at: string;
  categories?: {
    id: number;
    name: string;
    slug: string;
  };
  specifications?: Array<{ key: string; value: string }>;
  long_description?: string;
  faqs?: Array<{ id: number; question: string; answer: string }>;
  reviews?: Array<{ id: number; user: string; content: string; rating: number; date: string }>;
}

export interface BackendCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface BackendCustomer {
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

export interface BackendOrderItem {
  id: number;
  article_id: number;
  quantity: number;
  unit_price: string;
  article_name: string;
  image_url: string | null;
}

export interface BackendOrder {
  id: number;
  invoice_no: string;
  customer_id: number;
  coupon_id: number | null;
  total_amount: string;
  shipping_cost: string;
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
  items: BackendOrderItem[];
}

export interface BackendCoupon {
  id: number;
  code: string;
  discount_percentage: number;
  discount_amount: number;
  start_date: string;
  end_date: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendCouponValidation {
  valid: boolean;
  coupon: BackendCoupon;
  discount_amount: number;
  message?: string;
}

export interface BackendPayment {
  id: number;
  order_id: number;
  method: 'om' | 'mtn';
  phone: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackendContact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
  updated_at: string;
}

export interface BackendSpecification {
  id: number;
  article_id: number;
  key: string;
  value: string;
}

// === Request DTOs ===
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

export interface CreateOrderDto {
  customer_id?: number;
  coupon_id?: number;
  items: Array<{
    article_id: number;
    quantity: number;
    unit_price: number;
  }>;
  shipping_cost: number;
  payment_method: 'om' | 'mtn' | 'cash';
  coupon_code?: string;
}

export interface ValidateCouponDto {
  code: string;
  cartTotal: number;
}

export interface InitiatePaymentDto {
  order_id: number;
  method: 'om' | 'mtn';
  phone: string;
  amount: number;
}

export interface ContactMessageDto {
  name: string;
  email: string;
  subject: string;
  message: string;
}
