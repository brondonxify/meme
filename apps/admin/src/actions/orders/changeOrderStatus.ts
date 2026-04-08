"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { ServerActionResponse } from "@/types/server-action";

export async function changeOrderStatus(
  orderId: number | string,
  newOrderStatus: string
): Promise<ServerActionResponse> {
  try {
    const response = await serverApiRequest<ApiResponse<{ id: string }>>(
      `/api/v1/orders/${orderId}/status`,
      {
        method: "PATCH",
        data: { status: newOrderStatus },
      }
    );

    if (!response.success) {
      return { dbError: response.error || "Failed to update order status." };
    }

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return { success: true };
  } catch (error) {
    console.error("Order status update failed:", error);
    return { dbError: "Failed to update order status." };
  }
}
