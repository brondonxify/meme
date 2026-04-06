const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth-token');
}

function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth-token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BACKEND_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store',
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
    }

    const code = json?.error?.code || json?.code || 'UNKNOWN';
    const errorMsg = json?.error?.message || json?.error;
    const message = typeof errorMsg === 'string' ? errorMsg : (errorMsg ? JSON.stringify(errorMsg) : `HTTP ${response.status}`);
    throw new ApiError(response.status, code, message);
  }

  if (!json?.success) {
    throw new ApiError(500, 'INVALID_RESPONSE', 'API returned invalid response');
  }

  return json as ApiResponse<T>;
}

export async function get<T>(path: string): Promise<ApiResponse<T>> {
  return request<T>(path, { method: 'GET' });
}

export async function post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function put<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  return request<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteRequest<T>(path: string): Promise<ApiResponse<T>> {
  return request<T>(path, { method: 'DELETE' });
}

export async function apiClientRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await request<T>(path, options);
  return response.data as T;
}

export { BACKEND_URL, clearToken as clearAuthToken, getToken as getAuthToken };
