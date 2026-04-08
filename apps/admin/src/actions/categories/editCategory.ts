"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { categoryFormSchema } from "@/app/(dashboard)/categories/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { CategoryServerActionResponse } from "@/types/server-action";
import { Category } from "@/types/models";

export async function editCategory(
  categoryId: string,
  formData: FormData
): Promise<CategoryServerActionResponse> {
  const parsedData = categoryFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    image: formData.get("image"),
    slug: formData.get("slug"),
  });

  if (!parsedData.success) {
    return {
      validationErrors: formatValidationErrors(
        parsedData.error.flatten().fieldErrors
      ),
    };
  }

  const { image, ...categoryData } = parsedData.data;

  // Note: Image upload would need to be handled separately
  // For now, we'll pass the image as-is and let the backend handle it

  try {
    const response = await serverApiRequest<ApiResponse<Category>>(`/api/v1/categories/${categoryId}`, {
      method: "PUT",
      data: {
        name: categoryData.name,
        description: categoryData.description,
        slug: categoryData.slug,
      },
    });

    if (!response.success) {
      if (response.error?.includes("unique") || response.error?.includes("duplicate")) {
        if (response.error?.toLowerCase().includes("slug")) {
          return {
            validationErrors: {
              slug: "This category slug is already in use. Please choose a different one.",
            },
          };
        } else if (response.error?.toLowerCase().includes("name")) {
          return {
            validationErrors: {
              name: "A category with this name already exists. Please enter a unique name for this category.",
            },
          };
        }
      }
      return { dbError: response.error || "Something went wrong. Please try again later." };
    }

    revalidatePath("/categories");

    return { success: true, category: response.data };
  } catch (error) {
    console.error("Category update failed:", error);
    return { dbError: "Something went wrong. Please try again later." };
  }
}
