import { cookies } from 'next/headers';

export const AUTH_COOKIE_NAME = 'auth_token';

export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: AuthUser;
  };
  error?: string;
}

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function setToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function removeToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getToken();
  if (!token) {
    return null;
  }

  // Decode JWT to get user info (basic decode without verification for client display)
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );
    return {
      id: payload.sub || payload.id,
      email: payload.email,
      role: payload.role || 'admin',
    };
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}

