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

export async function deleteProducts(
  productIds: string[]
): Promise<ServerActionResponse> {
  for (const id of productIds) {
    const response = await fetch(`${BACKEND_URL}/api/v1/articles/${id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      return { dbError: "Something went wrong. Could not delete the products." };
    }
  }

  revalidatePath("/products");

  return { success: true };
}
