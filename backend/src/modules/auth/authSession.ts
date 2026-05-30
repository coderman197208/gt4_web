import type { FastifyInstance } from 'fastify';
import type { AuthenticatedUser, UserRole } from '@gt4_web/shared';
import { mockUsers } from '../api/mockData.js';

const TOKEN_PREFIX = 'mock-auth-token.';

interface AuthTokenPayload {
  id: number;
  username: string;
  role: UserRole;
}

function isUserRole(value: unknown): value is UserRole {
  return value === 'admin' || value === 'user';
}

export function createAuthToken(user: AuthenticatedUser): string {
  const payload: AuthTokenPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  return `${TOKEN_PREFIX}${Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')}`;
}

export function extractBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token.trim();
}

export function resolveAuthenticatedUser(token?: string | null): AuthenticatedUser | null {
  if (!token || !token.startsWith(TOKEN_PREFIX)) {
    return null;
  }

  try {
    const rawPayload = token.slice(TOKEN_PREFIX.length);
    const payload = JSON.parse(
      Buffer.from(rawPayload, 'base64url').toString('utf8'),
    ) as Partial<AuthTokenPayload>;

    if (
      typeof payload.id !== 'number' ||
      typeof payload.username !== 'string' ||
      !isUserRole(payload.role)
    ) {
      return null;
    }

    const user = mockUsers.find(
      (candidate) => candidate.id === payload.id && candidate.username === payload.username,
    );

    if (!user || !isUserRole(user.role)) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export function requireAuthenticatedUser(
  fastify: FastifyInstance,
  authorizationHeader?: string,
): AuthenticatedUser {
  const token = extractBearerToken(authorizationHeader);
  const user = resolveAuthenticatedUser(token);

  if (!user) {
    throw fastify.httpErrors.unauthorized('Invalid or missing token');
  }

  return user;
}

export function requireAdminUser(fastify: FastifyInstance, authorizationHeader?: string) {
  const user = requireAuthenticatedUser(fastify, authorizationHeader);

  if (user.role !== 'admin') {
    throw fastify.httpErrors.forbidden('Only admin users can manage alarm areas');
  }

  return user;
}
