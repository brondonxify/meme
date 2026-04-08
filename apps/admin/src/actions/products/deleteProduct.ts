"use server";

import { revalidatePath } from "next/cache";

import { getToken } from "@/lib/auth";
import { ServerActionResponse } from "@/types/server-action";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function deleteProduct(
  productId: string
): Promise<ServerActionResponse> {
  const response = await fetch(`${BACKEND_URL}/api/v1/articles/${productId}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    return { dbError: "Something went wrong. Could not delete the product." };
  }

  revalidatePath("/products");

  return { success: true };
}
