"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { ServerActionResponse } from "@/types/server-action";
import { Category } from "@/types/models";

export async function deleteCategory(
  categoryId: string
): Promise<ServerActionResponse> {
  try {
    const response = await serverApiRequest<ApiResponse<Category>>(`/api/v1/categories/${categoryId}`, {
      method: "DELETE",
    });

    if (!response.success) {
      return { dbError: response.error || "Something went wrong. Could not delete the category." };
    }

    revalidatePath("/categories");

    return { success: true };
  } catch (error) {
    console.error("Category deletion failed:", error);
    return { dbError: "Something went wrong. Could not delete the category." };
  }
}
