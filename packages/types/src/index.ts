export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  created_at: string;
}

export interface Admin {
  id: number;
  username: string;
  email: string;
  password?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Article {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
  category_id: number;
  created_at: string;
}

export interface Order {
  id: number;
  order_date: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  customer_id: number;
  customer?: Customer;
  order_details?: OrderDetail[];
}

export interface OrderDetail {
  order_id: number;
  article_id: number;
  quantity: number;
  unit_price: number;
  article?: Article;
}

export interface CategoryExtended extends Category {
  slug?: string;
  image_url?: string;
  published?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  campaign_name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date: string;
  image_url: string;
  published: boolean;
  created_at: string;
}

export interface Staff {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'cashier';
  created_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface AuthResponse {
  user: Customer | Admin;
  token: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
