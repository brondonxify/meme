// API Response Types

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  category_id: number;
  category_name?: string;
  sku: string;
  image_url: string;
  cost_price: number;
  selling_price: number;
  stock: number;
  min_stock_threshold: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// Order Types
export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  invoice_no: string;
  customer_id: number;
  customer?: Customer;
  coupon_id: number | null;
  coupon?: Coupon;
  total_amount: number;
  shipping_cost: number;
  payment_method: string;
  status: string;
  order_time: string;
  tracking_number: string | null;
  carrier: string | null;
  estimated_delivery: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price: number;
}

export interface OrderDetails extends Order {
  order_items: OrderItem[];
}

// Coupon Types
export interface Coupon {
  id: number;
  campaign_name: string;
  code: string;
  image_url: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// Analytics Types
export interface SalesSummary {
  today: number;
  yesterday: number;
  this_month: number;
  last_month: number;
  all_time: number;
}

export interface OrderStatusCounts {
  total: number;
  pending: number;
  processing: number;
  delivered: number;
  cancelled: number;
}

export interface WeeklySales {
  date: string;
  sales: number;
  orders: number;
}

export interface BestSeller {
  product_id: number;
  product_name: string;
  total_sold: number;
}

// Filter Types
export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  priceSort?: 'asc' | 'desc';
  status?: 'all' | 'published' | 'unpublished';
  published?: boolean;
  dateSort?: 'asc' | 'desc';
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  published?: boolean;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
}
