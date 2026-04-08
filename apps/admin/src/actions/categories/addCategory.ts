"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { categoryFormSchema } from "@/app/(dashboard)/categories/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { CategoryServerActionResponse } from "@/types/server-action";
import { Category } from "@/types/models";

export async function addCategory(
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
    const response = await serverApiRequest<ApiResponse<Category>>("/api/v1/categories", {
      method: "POST",
      data: {
        name: categoryData.name,
        description: categoryData.description,
        slug: categoryData.slug,
        published: false,
        image_url: undefined,
      },
    });

    if (!response.success) {
      return { dbError: response.error || "Something went wrong. Please try again later." };
    }

    revalidatePath("/categories");

    return { success: true, category: response.data };
  } catch (error) {
    console.error("Category creation failed:", error);
    return { dbError: "Something went wrong. Please try again later." };
  }
}
