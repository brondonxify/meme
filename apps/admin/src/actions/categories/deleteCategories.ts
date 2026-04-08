"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { ServerActionResponse } from "@/types/server-action";
import { Category } from "@/types/models";

export async function deleteCategories(
  categoryIds: string[]
): Promise<ServerActionResponse> {
  try {
    // Delete each category one by one
    for (const id of categoryIds) {
      const response = await serverApiRequest<ApiResponse<Category>>(`/api/v1/categories/${id}`, {
        method: "DELETE",
      });
      if (!response.success) {
        return { dbError: response.error || "Something went wrong. Could not delete the categories." };
      }
    }

    revalidatePath("/categories");

    return { success: true };
  } catch (error) {
    console.error("Categories bulk delete failed:", error);
    return {
      dbError: "Something went wrong. Could not delete the categories.",
    };
  }
}
