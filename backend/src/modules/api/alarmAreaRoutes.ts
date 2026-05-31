import type { FastifyInstance } from 'fastify';
import type {
  AlarmArea,
  AlarmManagementUserDirectoryItem,
  ManagedUserAlarmAreaContext,
  UpdateUserAlarmAreasRequest,
  UpdateUserAlarmAreasResponse,
  UserAlarmAreaContext,
} from '@gt4_web/shared';
import {
  getCurrentUserAlarmAreaContext,
  getManagedUserAlarmAreaContext,
  listVisibleAlarmAreas,
  replaceUserAlarmAreas,
} from '../auth/alarmAreaAccess.js';
import { listAlarmManagementUsers } from './mockData.js';
import { requireAdminUser, requireAuthenticatedUser } from '../auth/authSession.js';

export async function registerAlarmAreaRoutes(fastify: FastifyInstance) {
  fastify.get<{ Reply: UserAlarmAreaContext }>('/api/users/me/alarm-areas', async (request) => {
    const user = requireAuthenticatedUser(fastify, request.headers.authorization);
    return getCurrentUserAlarmAreaContext(user);
  });

  fastify.get<{ Reply: AlarmArea[] }>('/api/alarm-areas', async (request) => {
    const user = requireAuthenticatedUser(fastify, request.headers.authorization);
    return listVisibleAlarmAreas(user);
  });

  fastify.get<{ Reply: AlarmManagementUserDirectoryItem[] }>(
    '/api/admin/alarm-users',
    async (request) => {
      requireAdminUser(fastify, request.headers.authorization);
      return listAlarmManagementUsers();
    },
  );

  fastify.get<{
    Params: { userId: string };
    Reply: ManagedUserAlarmAreaContext;
  }>('/api/users/:userId/alarm-areas', async (request) => {
    requireAdminUser(fastify, request.headers.authorization);

    const userId = Number.parseInt(request.params.userId, 10);
    if (Number.isNaN(userId) || userId <= 0) {
      throw fastify.httpErrors.badRequest('Invalid user id');
    }

    try {
      return await getManagedUserAlarmAreaContext(userId);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'TARGET_USER_NOT_FOUND') {
          throw fastify.httpErrors.notFound('Target user not found');
        }

        if (error.message === 'TARGET_USER_NOT_MANAGEABLE') {
          throw fastify.httpErrors.badRequest('Target user must be a regular user');
        }
      }

      throw error;
    }
  });

  fastify.put<{
    Params: { userId: string };
    Body: UpdateUserAlarmAreasRequest;
    Reply: UpdateUserAlarmAreasResponse;
  }>('/api/users/:userId/alarm-areas', async (request) => {
    requireAdminUser(fastify, request.headers.authorization);

    const userId = Number.parseInt(request.params.userId, 10);
    if (Number.isNaN(userId) || userId <= 0) {
      throw fastify.httpErrors.badRequest('Invalid user id');
    }

    try {
      return await replaceUserAlarmAreas(userId, request.body);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'TARGET_USER_NOT_FOUND') {
          throw fastify.httpErrors.notFound('Target user not found');
        }

        if (error.message === 'TARGET_USER_NOT_MANAGEABLE') {
          throw fastify.httpErrors.badRequest('Target user must be a regular user');
        }

        if (error.message === 'AREA_IDS_REQUIRED') {
          throw fastify.httpErrors.badRequest('area_ids must not be empty');
        }

        if (error.message === 'DEFAULT_AREA_INVALID') {
          throw fastify.httpErrors.badRequest('default_area_id must belong to area_ids');
        }

        if (error.message === 'AREA_NOT_FOUND') {
          throw fastify.httpErrors.badRequest('All area_ids must refer to enabled alarm areas');
        }
      }

      throw error;
    }
  });
}
