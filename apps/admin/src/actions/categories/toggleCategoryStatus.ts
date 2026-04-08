"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { ServerActionResponse } from "@/types/server-action";
import { Category } from "@/types/models";

export async function toggleCategoryPublishedStatus(
  categoryId: string,
  currentPublishedStatus: boolean
): Promise<ServerActionResponse> {
  const newPublishedStatus = !currentPublishedStatus;

  try {
    const response = await serverApiRequest<ApiResponse<Category>>(`/api/v1/categories/${categoryId}/status`, {
      method: "PATCH",
      data: { published: newPublishedStatus },
    });

    if (!response.success) {
      return { dbError: response.error || "Failed to update category status." };
    }

    revalidatePath("/categories");

    return { success: true };
  } catch (error) {
    console.error("Category status toggle failed:", error);
    return { dbError: "Failed to update category status." };
  }
}
