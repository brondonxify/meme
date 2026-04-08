"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { ServerActionResponse } from "@/types/server-action";
import { Coupon } from "@/types/models";

export async function deleteCoupon(
  couponId: string
): Promise<ServerActionResponse> {
  try {
    const response = await serverApiRequest<ApiResponse<Coupon>>(`/api/v1/coupons/${couponId}`, {
      method: "DELETE",
    });

    if (!response.success) {
      return { dbError: response.error || "Something went wrong. Could not delete the coupon." };
    }

    revalidatePath("/coupons");

    return { success: true };
  } catch (error) {
    console.error("Coupon deletion failed:", error);
    return { dbError: "Something went wrong. Could not delete the coupon." };
  }
}
