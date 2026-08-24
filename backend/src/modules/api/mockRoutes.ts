import type { FastifyInstance } from 'fastify';
import { mockUsers, mockPosts, mockComments } from './mockData.js';

/**
 * 注册 Mock API 路由
 * 这些路由仅在开发环境中使用，提供与 json-server 相同的功能
 */
export async function registerMockRoutes(fastify: FastifyInstance) {
  // 用户相关路由
  fastify.get('/api/users', async () => {
    return mockUsers;
  });

  fastify.get<{ Params: { id: string } }>('/api/users/:id', async (request) => {
    const id = parseInt(request.params.id);
    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      throw fastify.httpErrors.notFound('User not found');
    }
    return user;
  });

  fastify.get<{ Params: { id: string } }>('/api/users/:id/posts', async (request) => {
    const id = parseInt(request.params.id);
    const userPosts = mockPosts.filter((p) => p.authorId === id);
    return userPosts;
  });

  // 文章相关路由
  fastify.get('/api/posts', async () => {
    return mockPosts;
  });

  fastify.get<{ Params: { id: string } }>('/api/posts/:id', async (request) => {
    const id = parseInt(request.params.id);
    const post = mockPosts.find((p) => p.id === id);
    if (!post) {
      throw fastify.httpErrors.notFound('Post not found');
    }
    return post;
  });

  fastify.get<{ Params: { id: string } }>('/api/posts/:id/comments', async (request) => {
    const id = parseInt(request.params.id);
    const postComments = mockComments.filter((c) => c.postId === id);
    return postComments;
  });

  // 评论相关路由
  fastify.get('/api/comments', async () => {
    return mockComments;
  });

  fastify.get<{ Params: { id: string } }>('/api/comments/:id', async (request) => {
    const id = parseInt(request.params.id);
    const comment = mockComments.find((c) => c.id === id);
    if (!comment) {
      throw fastify.httpErrors.notFound('Comment not found');
    }
    return comment;
  });

  // 认证路由
  fastify.post<{ Body: { username: string; password: string } }>(
    '/api/auth/login',
    async (request) => {
      const { username, password } = request.body;

      if (!username || !password) {
        throw fastify.httpErrors.badRequest('Username and password are required');
      }

      const user = mockUsers.find((u) => u.username === username);
      if (!user) {
        throw fastify.httpErrors.unauthorized('Invalid credentials');
      }

      return {
        success: true,
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      };
    },
  );

  fastify.log.info('Mock API routes registered');
}
