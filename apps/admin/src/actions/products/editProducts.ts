"use server";

import { revalidatePath } from "next/cache";

import { getToken } from "@/lib/auth";
import { productBulkFormSchema } from "@/app/(dashboard)/products/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { VServerActionResponse } from "@/types/server-action";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function editProducts(
  productIds: string[],
  formData: FormData
): Promise<VServerActionResponse> {
  const parsedData = productBulkFormSchema.safeParse({
    category:
      formData.get("category") === "" ? undefined : formData.get("category"),
    published:
      formData.get("published") === null
        ? undefined
        : !!(formData.get("published") === "true"),
  });

  if (!parsedData.success) {
    return {
      validationErrors: formatValidationErrors(
        parsedData.error.flatten().fieldErrors
      ),
    };
  }

  const { category, published } = parsedData.data;

  for (const id of productIds) {
    const body: Record<string, unknown> = {};
    if (category) body.category_id = parseInt(category, 10);
    if (typeof published !== "undefined") body.published = published;

    const response = await fetch(`${BACKEND_URL}/api/v1/articles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { dbError: "Something went wrong. Please try again later." };
    }
  }

  revalidatePath("/products");

  return { success: true };
}
