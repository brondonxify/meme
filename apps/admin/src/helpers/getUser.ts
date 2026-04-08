import { getCurrentUser, AuthUser } from '@/lib/auth';

export async function getUser(): Promise<AuthUser | null> {
  return getCurrentUser();
}
