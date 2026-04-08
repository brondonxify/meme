"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { ServerActionResponse } from "@/types/server-action";

export async function deleteCustomer(
  customerId: string
): Promise<ServerActionResponse> {
  try {
    const response = await serverApiRequest<ApiResponse<{ id: string }>>(
      `/api/v1/customers/${customerId}`,
      { method: "DELETE" }
    );

    if (!response.success) {
      return { dbError: response.error || "Something went wrong. Could not delete the customer." };
    }

    revalidatePath("/customers");

    return { success: true };
  } catch (error) {
    console.error("Customer deletion failed:", error);
    return { dbError: "Something went wrong. Could not delete the customer." };
  }
}
