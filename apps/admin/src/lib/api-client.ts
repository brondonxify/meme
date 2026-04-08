import axios, { AxiosRequestConfig } from 'axios';

const API_CLIENT_ERROR_NAME = 'ApiClientError';

export interface ApiClientError extends Error {
  status?: number;
  response?: unknown;
  code?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ApiClientOptions extends AxiosRequestConfig {
  token?: string;
}

function getToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  let token = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1];
  if (!token) {
    token = localStorage.getItem('auth_token') ?? undefined;
  }
  return token;
}

function createApiClient() {
  const baseURL = process.env.BACKEND_URL || 'http://localhost:3001';

  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return client;
}

export const apiClient = createApiClient();

export async function apiClientRequest<T>(
  path: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { token, ...axiosOptions } = options;
  const baseURL = process.env.BACKEND_URL || 'http://localhost:3001';
  const authToken = token || getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };

  const response = await fetch(`${baseURL}${path}`, {
    method: axiosOptions.method || 'GET',
    headers,
    body: axiosOptions.data ? JSON.stringify(axiosOptions.data) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error?.message || `HTTP ${response.status}`) as ApiClientError;
    error.status = response.status;
    error.response = data;
    throw error;
  }

  return data;
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return (
    error instanceof Error &&
    (error.name === API_CLIENT_ERROR_NAME || 'status' in error)
  );
}

export function getErrorMessage(error: unknown): string {
  if (isApiClientError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
