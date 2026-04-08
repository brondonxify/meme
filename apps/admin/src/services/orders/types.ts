import { Pagination } from "@/types/pagination";
import { Order } from "./index";
import { Customer } from "../customers";
import { Coupon } from "../coupons";

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type OrderMethod = 'om' | 'mtn' | 'cash';

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
  pagination: Pagination;
}

export interface OrderDetails extends Order {
  items: Array<{
    id: number;
    article_id: number;
    quantity: number;
    unit_price: number;
    article_name?: string;
    image_url?: string | null;
  }>;
  coupon?: { discount_type: "percentage" | "fixed"; discount_value: number };
  customer?: { first_name: string; last_name: string; email: string; phone: string; address?: string };
}

export type OrdersExport = Pick<
  Order,
  | "id"
  | "invoice_no"
  | "order_time"
  | "total_amount"
  | "shipping_cost"
  | "payment_method"
  | "order_time"
  | "status"
  | "created_at"
  | "updated_at"
> & {
  discount: string;
  customer_name: string;
  customer_email: string;
};
