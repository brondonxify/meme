import { Pagination } from "@/types/pagination";
import { Customer } from "./index";

export interface FetchCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FetchCustomersResponse {
  data: Customer[];
  pagination: Pagination;
}

export type CustomerOrder = Pick<
  import("../orders/index").Order,
  | "id"
  | "invoice_no"
  | "order_time"
  | "payment_method"
  | "total_amount"
  | "status"
> & {
  customers: Pick<Customer, "first_name" | "last_name" | "address" | "phone">;
};
