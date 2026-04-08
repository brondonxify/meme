export interface BackendCoupon {
  id: number;
  campaign_name: string;
  code: string;
  image_url: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: Date;
  end_date: Date;
  published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface BackendStaff {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  image_url: string | null;
  role_id: number;
  joining_date: Date;
  published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface BackendStaffRole {
  id: number;
  name: string;
  display_name: string;
  is_default: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
