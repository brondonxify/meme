"use server";

import { getToken } from "@/lib/auth";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function exportProducts() {
  const response = await fetch(`${BACKEND_URL}/api/v1/articles?limit=10000`, {
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    return { error: "Failed to fetch data for products." };
  }

  const json = await response.json();
  if (!json.success) {
    return { error: "Failed to fetch data for products." };
  }

  return { data: json.data.items || [] };
}
