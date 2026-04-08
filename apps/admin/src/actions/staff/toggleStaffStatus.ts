"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { ServerActionResponse } from "@/types/server-action";

export async function toggleStaffPublishedStatus(
  staffId: string,
  currentPublishedStatus: boolean
): Promise<ServerActionResponse> {
  const newPublishedStatus = !currentPublishedStatus;

  try {
    await serverApiRequest<ApiResponse<{ id: string }>>(
      `/api/v1/staff/${staffId}`,
      {
        method: "PATCH",
        data: { published: newPublishedStatus },
      }
    );
  } catch (error) {
    console.error("Database update failed:", error);
    return { dbError: "Failed to update staff status." };
  }

  revalidatePath("/staff");

  return { success: true };
}
