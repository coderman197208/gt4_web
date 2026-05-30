import type { FastifyInstance } from 'fastify';
import type {
  AckAlarmRequest,
  AckAlarmResponse,
  AlarmDetailResponse,
  AlarmListQueryParams,
  AlarmListResponse,
  AlarmSummary,
  AlarmSummaryQueryParams,
} from '@gt4_web/shared';
import {
  ackAlarmEvent,
  getAlarmDetail,
  getAlarmList,
  getAlarmSummary,
} from '../alarm/alarmService.js';
import { getAuthorizedAlarmAreaIds } from '../auth/alarmAreaAccess.js';
import { requireAuthenticatedUser } from '../auth/authSession.js';
import { broadcastAlarmMutation } from '../websocket/socketServer.js';

export async function registerAlarmRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: AlarmSummaryQueryParams; Reply: AlarmSummary }>(
    '/api/alarms/summary',
    async (request) => {
      const user = requireAuthenticatedUser(fastify, request.headers.authorization);
      const authorizedAreaIds = await getAuthorizedAlarmAreaIds(user.id);
      return getAlarmSummary(authorizedAreaIds, request.query);
    },
  );

  fastify.get<{ Querystring: AlarmListQueryParams; Reply: AlarmListResponse }>(
    '/api/alarms',
    async (request) => {
      const user = requireAuthenticatedUser(fastify, request.headers.authorization);
      const authorizedAreaIds = await getAuthorizedAlarmAreaIds(user.id);
      return getAlarmList(authorizedAreaIds, request.query);
    },
  );

  fastify.get<{ Params: { id: string }; Reply: AlarmDetailResponse }>(
    '/api/alarms/:id',
    async (request) => {
      const user = requireAuthenticatedUser(fastify, request.headers.authorization);
      const alarmId = Number.parseInt(request.params.id, 10);

      if (Number.isNaN(alarmId) || alarmId <= 0) {
        throw fastify.httpErrors.badRequest('Invalid alarm id');
      }

      const authorizedAreaIds = await getAuthorizedAlarmAreaIds(user.id);
      const detail = await getAlarmDetail(authorizedAreaIds, alarmId);

      if (!detail) {
        throw fastify.httpErrors.notFound('Alarm not found');
      }

      return detail;
    },
  );

  fastify.post<{
    Params: { id: string };
    Body: AckAlarmRequest;
    Reply: AckAlarmResponse;
  }>('/api/alarms/:id/ack', async (request) => {
    const user = requireAuthenticatedUser(fastify, request.headers.authorization);
    const alarmId = Number.parseInt(request.params.id, 10);

    if (Number.isNaN(alarmId) || alarmId <= 0) {
      throw fastify.httpErrors.badRequest('Invalid alarm id');
    }

    const authorizedAreaIds = await getAuthorizedAlarmAreaIds(user.id);

    try {
      const result = await ackAlarmEvent(authorizedAreaIds, alarmId, user, request.body);

      if (result.change) {
        await broadcastAlarmMutation(result.change);
      }

      return result.response;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'ALARM_NOT_FOUND') {
          throw fastify.httpErrors.notFound('Alarm not found');
        }

        if (error.message === 'ALARM_VERSION_CONFLICT') {
          throw fastify.httpErrors.conflict('Alarm version conflict');
        }
      }

      throw error;
    }
  });
}
