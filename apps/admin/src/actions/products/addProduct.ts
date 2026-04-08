"use server";

import { revalidatePath } from "next/cache";

import { getToken } from "@/lib/auth";
import { productFormSchema } from "@/app/(dashboard)/products/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { ProductServerActionResponse } from "@/types/server-action";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("entity", "products");

  const response = await fetch(`${BACKEND_URL}/api/v1/upload`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) return null;

  const json = await response.json();
  if (!json.success) return null;

  return json.data.url;
}

export async function addProduct(
  formData: FormData
): Promise<ProductServerActionResponse> {
  const parsedData = productFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    image: formData.get("image"),
    sku: formData.get("sku"),
    category: formData.get("category"),
    costPrice: formData.get("costPrice"),
    salesPrice: formData.get("salesPrice"),
    stock: formData.get("stock"),
    minStockThreshold: formData.get("minStockThreshold"),
    slug: formData.get("slug"),
    longDescription: formData.get("longDescription") || "",
  });

  if (!parsedData.success) {
    return {
      validationErrors: formatValidationErrors(
        parsedData.error.flatten().fieldErrors
      ),
    };
  }

  const { image, ...productData } = parsedData.data;

  let imageUrl: string | undefined;

  if (image instanceof File && image.size > 0) {
    imageUrl = (await uploadImage(image)) || undefined;
    if (!imageUrl) {
      return { validationErrors: { image: "Failed to upload image" } };
    }
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify({
      name: productData.name,
      description: productData.description,
      long_description: productData.longDescription,
      cost_price: productData.costPrice,
      selling_price: productData.salesPrice,
      stock: productData.stock,
      min_stock_threshold: productData.minStockThreshold,
      category_id: parseInt(productData.category, 10),
      slug: productData.slug,
      sku: productData.sku,
      published: false,
      image_url: imageUrl || null,
    }),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    const errorMsg = json.error?.message || json.error || "Something went wrong. Please try again later.";
    if (errorMsg.toLowerCase().includes("slug") || errorMsg.toLowerCase().includes("duplicate")) {
      return { validationErrors: { slug: "This product slug is already in use. Please choose a different one." } };
    }
    if (errorMsg.toLowerCase().includes("sku") || errorMsg.toLowerCase().includes("duplicate")) {
      return { validationErrors: { sku: "This product SKU is already assigned to an existing item. Please enter a different SKU." } };
    }
    return { dbError: errorMsg };
  }

  revalidatePath("/products");

  return { success: true, product: json.data };
}
