"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { ServerActionResponse } from "@/types/server-action";

export async function deleteCoupons(
  couponIds: string[]
): Promise<ServerActionResponse> {
  try {
    for (const couponId of couponIds) {
      await serverApiRequest<ApiResponse<{ id: string }>>(
        `/api/v1/coupons/${couponId}`,
        { method: "DELETE" }
      );
    }
  } catch (error) {
    console.error("Bulk delete failed:", error);
    return { dbError: "Something went wrong. Could not delete the coupons." };
  }

  revalidatePath("/coupons");

  return { success: true };
}
