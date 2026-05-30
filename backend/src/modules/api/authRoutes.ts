import type { FastifyInstance } from 'fastify';
import type { AuthenticatedUser, LoginParams, LoginResponse } from '@gt4_web/shared';
import { mockUsers } from './mockData.js';
import { createAuthToken } from '../auth/authSession.js';

export async function registerAuthRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: LoginParams; Reply: LoginResponse }>('/api/auth/login', async (request) => {
    const { username, password } = request.body;

    if (!username || !password) {
      throw fastify.httpErrors.badRequest('Username and password are required');
    }

    const user = mockUsers.find((candidate) => candidate.username === username);
    if (!user || (user.role !== 'admin' && user.role !== 'user')) {
      throw fastify.httpErrors.unauthorized('Invalid credentials');
    }

    const authUser: AuthenticatedUser = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      success: true,
      token: createAuthToken(authUser),
      user: authUser,
    };
  });
}
