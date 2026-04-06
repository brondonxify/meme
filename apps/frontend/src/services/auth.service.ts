import { post, get, clearAuthToken } from '@/lib/api-client';
import type { AuthResponse, LoginDto, RegisterDto, BackendCustomer } from '@/types/api';

const AUTH_TOKEN_KEY = 'auth-token';

export const authService = {
  async loginCustomer(email: string, password: string): Promise<AuthResponse> {
    const response = await post<AuthResponse>('/api/v1/auth/customer/login', {
      email,
      password,
    });
    const data = response.data;
    if (data.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    }
    return data;
  },

  async registerCustomer(data: RegisterDto): Promise<AuthResponse> {
    const response = await post<AuthResponse>('/api/v1/auth/customer/register', data);
    const result = response.data;
    if (result.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, result.token);
    }
    return result;
  },

  async getMe(): Promise<BackendCustomer | null> {
    try {
      const response = await get<BackendCustomer>('/api/v1/auth/customer/me');
      return response.data;
    } catch {
      return null;
    }
  },

  logout(): void {
    clearAuthToken();
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
