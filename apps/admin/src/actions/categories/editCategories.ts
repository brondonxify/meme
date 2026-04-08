"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { categoryBulkFormSchema } from "@/app/(dashboard)/categories/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { VServerActionResponse } from "@/types/server-action";
import { Category } from "@/types/models";

export async function editCategories(
  categoryIds: string[],
  formData: FormData
): Promise<VServerActionResponse> {
  const parsedData = categoryBulkFormSchema.safeParse({
    published: !!(formData.get("published") === "true"),
  });

  if (!parsedData.success) {
    return {
      validationErrors: formatValidationErrors(
        parsedData.error.flatten().fieldErrors
      ),
    };
  }

  const { published } = parsedData.data;

  try {
    // Update each category one by one
    for (const id of categoryIds) {
      const response = await serverApiRequest<ApiResponse<Category>>(`/api/v1/categories/${id}`, {
        method: "PUT",
        data: { published },
      });
      if (!response.success) {
        return { dbError: response.error || "Something went wrong. Please try again later." };
      }
    }

    revalidatePath("/categories");

    return { success: true };
  } catch (error) {
    console.error("Categories bulk update failed:", error);
    return { dbError: "Something went wrong. Please try again later." };
  }
}
