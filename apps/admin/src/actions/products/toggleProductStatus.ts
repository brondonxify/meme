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

export async function toggleProductPublishedStatus(
  productId: string,
  currentPublishedStatus: boolean
): Promise<ServerActionResponse> {
  const response = await fetch(`${BACKEND_URL}/api/v1/articles/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify({ published: !currentPublishedStatus }),
  });

  if (!response.ok) {
    return { dbError: "Failed to update product status." };
  }

  revalidatePath("/products");

  return { success: true };
}
