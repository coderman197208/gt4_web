import type { FastifyInstance } from 'fastify';
import type {
  AckAlarmRequest,
  AckAlarmResponse,
  AlarmBatchAckRequest,
  AlarmBatchAckResponse,
  AlarmDetailResponse,
  AlarmListQueryParams,
  AlarmListResponse,
  AlarmSummary,
  AlarmSummaryQueryParams,
} from '@gt4_web/shared';
import {
  ackAlarmEvent,
  batchAckAlarmEvents,
  getAlarmDetail,
  getAlarmList,
  getAlarmSummary,
} from '../alarm/alarmService.js';
import { getAuthorizedAlarmAreaIds } from '../auth/alarmAreaAccess.js';
import { requireAdminUser, requireAuthenticatedUser } from '../auth/authSession.js';
import { broadcastAlarmMutation, broadcastAlarmMutations } from '../websocket/socketServer.js';

const MAX_BATCH_ACK_ITEMS = 200;

export async function registerAlarmRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: AlarmSummaryQueryParams; Reply: AlarmSummary }>(
    '/api/alarms/summary',
    async (request) => {
      const user = requireAuthenticatedUser(fastify, request.headers.authorization);
      const authorizedAreaIds = await getAuthorizedAlarmAreaIds(user);
      return getAlarmSummary(authorizedAreaIds, request.query);
    },
  );

  fastify.get<{ Querystring: AlarmListQueryParams; Reply: AlarmListResponse }>(
    '/api/alarms',
    async (request) => {
      const user = requireAuthenticatedUser(fastify, request.headers.authorization);
      const authorizedAreaIds = await getAuthorizedAlarmAreaIds(user);
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

      const authorizedAreaIds = await getAuthorizedAlarmAreaIds(user);
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

    const authorizedAreaIds = await getAuthorizedAlarmAreaIds(user);

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

  fastify.post<{
    Body: AlarmBatchAckRequest;
    Reply: AlarmBatchAckResponse;
  }>('/api/admin/alarms/batch-ack', async (request) => {
    const user = requireAdminUser(fastify, request.headers.authorization);

    if (!Array.isArray(request.body.items)) {
      throw fastify.httpErrors.badRequest('items must be an array');
    }

    if (request.body.items.length > MAX_BATCH_ACK_ITEMS) {
      throw fastify.httpErrors.badRequest(`items must not exceed ${MAX_BATCH_ACK_ITEMS}`);
    }

    if (
      request.body.items.some(
        (item) =>
          !Number.isInteger(item.alarm_id) ||
          item.alarm_id <= 0 ||
          !Number.isInteger(item.expected_version) ||
          item.expected_version <= 0,
      )
    ) {
      throw fastify.httpErrors.badRequest(
        'Each item must include valid alarm_id and expected_version',
      );
    }

    if (
      typeof request.body.operator_note !== 'undefined' &&
      typeof request.body.operator_note !== 'string'
    ) {
      throw fastify.httpErrors.badRequest('operator_note must be a string');
    }

    const authorizedAreaIds = await getAuthorizedAlarmAreaIds(user);
    const result = await batchAckAlarmEvents(authorizedAreaIds, user, request.body);

    if (result.changes.length > 0) {
      await broadcastAlarmMutations(result.changes);
    }

    return result.response;
  });
}
