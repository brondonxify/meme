import { cookies } from 'next/headers';
import type { DashboardStats, SalesOverTime, TopProduct } from '@/types/analytics';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${BACKEND_URL}/api/v1/analytics/dashboard`, {
    headers: await getAuthHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }

  const json = await res.json();
  return json.data as DashboardStats;
}

export async function fetchSalesOverTime(days: number = 30): Promise<SalesOverTime[]> {
  const res = await fetch(`${BACKEND_URL}/api/v1/analytics/sales?days=${days}`, {
    headers: await getAuthHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch sales over time');
  }

  const json = await res.json();
  return json.data as SalesOverTime[];
}

export async function fetchTopProducts(limit: number = 10): Promise<TopProduct[]> {
  const res = await fetch(`${BACKEND_URL}/api/v1/analytics/top-products?limit=${limit}`, {
    headers: await getAuthHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch top products');
  }

  const json = await res.json();
  return json.data as TopProduct[];
}
