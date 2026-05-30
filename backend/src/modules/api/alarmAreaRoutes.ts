import type { FastifyInstance } from 'fastify';
import type {
  AlarmArea,
  UpdateUserAlarmAreasRequest,
  UpdateUserAlarmAreasResponse,
  UserAlarmAreaContext,
} from '@gt4_web/shared';
import {
  getUserAlarmAreaContext,
  listVisibleAlarmAreas,
  replaceUserAlarmAreas,
} from '../auth/alarmAreaAccess.js';
import { requireAdminUser, requireAuthenticatedUser } from '../auth/authSession.js';

export async function registerAlarmAreaRoutes(fastify: FastifyInstance) {
  fastify.get<{ Reply: UserAlarmAreaContext }>('/api/users/me/alarm-areas', async (request) => {
    const user = requireAuthenticatedUser(fastify, request.headers.authorization);
    return getUserAlarmAreaContext(user.id);
  });

  fastify.get<{ Reply: AlarmArea[] }>('/api/alarm-areas', async (request) => {
    const user = requireAuthenticatedUser(fastify, request.headers.authorization);
    return listVisibleAlarmAreas(user.id);
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
