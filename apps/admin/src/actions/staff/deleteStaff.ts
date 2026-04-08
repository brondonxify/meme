"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { ServerActionResponse } from "@/types/server-action";

export async function deleteStaff(
  staffId: string
): Promise<ServerActionResponse> {
  try {
    await serverApiRequest<ApiResponse<{ id: string }>>(
      `/api/v1/staff/${staffId}`,
      { method: "DELETE" }
    );
  } catch (error) {
    console.error("Database delete failed:", error);
    return { dbError: "Something went wrong. Could not delete the staff." };
  }

  revalidatePath("/staff");

  return { success: true };
}
