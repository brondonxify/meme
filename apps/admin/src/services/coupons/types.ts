import { Pagination } from "@/types/pagination";
import { Coupon } from "./index";

export type CouponStatus = "expired" | "active";

export interface FetchCouponsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FetchCouponsResponse {
  data: Coupon[];
  pagination: Pagination;
}
