"use server";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { Category } from "@/types/models";

export async function exportCategories() {
  try {
    const response = await serverApiRequest<ApiResponse<Category[]>>("/api/v1/categories?limit=1000");
    return { data: response.data };
  } catch (error) {
    console.error(`Error fetching categories:`, error);
    return { error: `Failed to fetch data for categories.` };
  }
}
