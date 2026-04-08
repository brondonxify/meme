"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { ServerActionResponse } from "@/types/server-action";

export async function toggleCouponPublishedStatus(
  couponId: string,
  currentPublishedStatus: boolean
): Promise<ServerActionResponse> {
  const newPublishedStatus = !currentPublishedStatus;

  try {
    const response = await serverApiRequest<ApiResponse<{ id: string }>>(
      `/api/v1/coupons/${couponId}`,
      {
        method: "PUT",
        data: { published: newPublishedStatus },
      }
    );

    if (!response.success) {
      return { dbError: response.error || "Failed to update coupon status." };
    }

    revalidatePath("/coupons");

    return { success: true };
  } catch (error) {
    console.error("Coupon status toggle failed:", error);
    return { dbError: "Failed to update coupon status." };
  }
}
