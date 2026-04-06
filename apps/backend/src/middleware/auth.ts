import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { ApiError } from '@/utils/api-error.js';

export interface JwtPayload {
  id: string;
  role: string;
  type: 'admin' | 'customer';
}

export interface AuthUser {
  id: number;
  role: string;
  type: 'admin' | 'customer';
}

export function authMiddleware(requiredRole?: string) {
  return async (c: Context, next: Next): Promise<void> => {
    try {
      const authHeader = c.req.header('Authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'UNAUTHORIZED', 'No valid token provided');
      }

      const token = authHeader.replace('Bearer ', '');
      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        throw new ApiError(500, 'INTERNAL_ERROR', 'JWT_SECRET not configured');
      }

      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

      if (!decoded.id || !decoded.role || !decoded.type) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Invalid token payload');
      }

      if (requiredRole) {
        const isAdminRole = decoded.role === 'super_admin' || decoded.role === 'admin';
        const isAdminType = decoded.type === 'admin';

        if (requiredRole === 'admin' && !isAdminRole && !isAdminType) {
          throw new ApiError(403, 'FORBIDDEN', 'Insufficient permissions');
        }
      }

      // Parse id to number since JWT stores it as string but DB expects number
      const userId = parseInt(decoded.id, 10);
      
      const user: AuthUser = {
        id: userId,
        role: decoded.role,
        type: decoded.type
      };

      c.set('user', user);

      await next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Token expired');
      }
      throw error;
    }
  };
}

export function getCurrentUser(c: Context): AuthUser | undefined {
  return c.get('user');
}