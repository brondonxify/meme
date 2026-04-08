"use server";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { Customer } from "@/types/models";

export async function exportCustomers() {
  try {
    const response = await serverApiRequest<ApiResponse<Customer[]>>(
      "/api/v1/customers?limit=1000"
    );
    return { data: response.data };
  } catch (error) {
    console.error(`Error fetching customers:`, error);
    return { error: `Failed to fetch data for customers.` };
  }
}
