"use server";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { Coupon } from "@/types/models";

export async function exportCoupons() {
  try {
    const response = await serverApiRequest<ApiResponse<Coupon[]>>("/api/v1/coupons?limit=1000");
    return { data: response.data };
  } catch (error) {
    console.error(`Error fetching coupons:`, error);
    return { error: `Failed to fetch data for coupons.` };
  }
}
