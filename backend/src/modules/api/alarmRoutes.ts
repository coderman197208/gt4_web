import { Prisma } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import type {
  AcknowledgeAlarmsRequest,
  AcknowledgeAlarmsResponse,
  AlarmAcknowledgementResponse,
  AlarmEvent,
  AlarmPage,
  AlarmQueryDays,
} from '@gt4_web/shared';
import prisma from '../database/prismaClient.js';
import { getRedisDataClient } from '../redis/redisClient.js';

const ALARM_CHANNEL = 'AlarmChanged';
const ALARM_PAGE_SIZE = 20 as const;
const VALID_DAYS = new Set<AlarmQueryDays>([1, 3, 10, 30]);
const ALARM_ID_PATTERN = /^[1-9]\d*$/;
const MAX_ALARM_ID = 9_223_372_036_854_775_807n;

interface AlarmRow {
  id: bigint;
  message: string;
  area: string;
  occurred_at: Date;
  acknowledged_at: Date | null;
}

function mapAlarmRow(row: AlarmRow): AlarmEvent {
  return {
    id: row.id.toString(),
    message: row.message,
    area: row.area,
    occurredAt: row.occurred_at.toISOString(),
    acknowledgedAt: row.acknowledged_at?.toISOString() ?? null,
  };
}

function parseAlarmId(value: string): string | null {
  if (!ALARM_ID_PATTERN.test(value)) return null;

  try {
    return BigInt(value) <= MAX_ALARM_ID ? value : null;
  } catch {
    return null;
  }
}

function publishAlarmChange(fastify: FastifyInstance, id: string): void {
  getRedisDataClient()
    .publish(ALARM_CHANNEL, id)
    .catch((error: unknown) => fastify.log.error(error, `发布 ${ALARM_CHANNEL} 失败`));
}

export async function verifyAlarmTable(): Promise<void> {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT to_regclass('public.alarm_event') IS NOT NULL AS exists
  `;
  if (!rows[0]?.exists) {
    throw new Error('Required table public.alarm_event does not exist');
  }
}

export async function registerAlarmRoutes(fastify: FastifyInstance) {
  fastify.get<{ Reply: AlarmEvent[] }>('/api/alarms/latest', async (_request, reply) => {
    try {
      const rows = await prisma.$queryRaw<AlarmRow[]>`
        SELECT id, message, area, occurred_at, acknowledged_at
        FROM public.alarm_event
        ORDER BY occurred_at DESC, id DESC
        LIMIT 2
      `;
      return rows.map(mapAlarmRow);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ message: '查询最新报警失败' } as never);
    }
  });

  fastify.get<{ Querystring: { days?: string; page?: string }; Reply: AlarmPage }>(
    '/api/alarms',
    async (request, reply) => {
      const days = Number(request.query.days ?? '1') as AlarmQueryDays;
      const page = Number(request.query.page ?? '1');
      if (!VALID_DAYS.has(days) || !Number.isSafeInteger(page) || page < 1) {
        return reply.code(400).send({ message: '报警查询参数无效' } as never);
      }

      try {
        const offset = (page - 1) * ALARM_PAGE_SIZE;
        const { rows, total } = await prisma.$transaction(
          async (transaction) => {
            const cutoffRows = await transaction.$queryRaw<{ cutoff: Date }[]>`
              SELECT CURRENT_TIMESTAMP AS cutoff
            `;
            const cutoff = cutoffRows[0].cutoff;
            const lowerBound = new Date(cutoff.getTime() - days * 24 * 60 * 60 * 1000);
            const pageRows = await transaction.$queryRaw<AlarmRow[]>(Prisma.sql`
              SELECT id, message, area, occurred_at, acknowledged_at
              FROM public.alarm_event
              WHERE occurred_at >= ${lowerBound} AND occurred_at <= ${cutoff}
              ORDER BY occurred_at DESC, id DESC
              LIMIT ${ALARM_PAGE_SIZE} OFFSET ${offset}
            `);
            const countRows = await transaction.$queryRaw<{ count: bigint }[]>(Prisma.sql`
              SELECT COUNT(*)::bigint AS count
              FROM public.alarm_event
              WHERE occurred_at >= ${lowerBound} AND occurred_at <= ${cutoff}
            `);
            return { rows: pageRows, total: Number(countRows[0]?.count ?? 0n) };
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
        );

        return {
          items: rows.map(mapAlarmRow),
          page,
          pageSize: ALARM_PAGE_SIZE,
          total,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ message: '查询报警失败' } as never);
      }
    },
  );

  fastify.patch<{
    Params: { id: string };
    Reply: AlarmAcknowledgementResponse;
  }>('/api/alarms/:id/acknowledgement', async (request, reply) => {
    const id = parseAlarmId(request.params.id);
    if (!id) {
      return reply.code(400).send({ message: '报警 ID 无效' } as never);
    }

    try {
      const updated = await prisma.$queryRaw<{ acknowledged_at: Date }[]>(Prisma.sql`
        UPDATE public.alarm_event
        SET acknowledged_at = CURRENT_TIMESTAMP
        WHERE id = ${id}::bigint AND acknowledged_at IS NULL
        RETURNING acknowledged_at
      `);
      if (updated[0]) {
        publishAlarmChange(fastify, id);
        return { id, acknowledgedAt: updated[0].acknowledged_at.toISOString() };
      }

      const existing = await prisma.$queryRaw<{ acknowledged_at: Date | null }[]>(Prisma.sql`
        SELECT acknowledged_at
        FROM public.alarm_event
        WHERE id = ${id}::bigint
      `);
      if (!existing[0]) {
        return reply.code(404).send({ message: '报警不存在' } as never);
      }
      if (!existing[0].acknowledged_at) {
        throw new Error('Alarm acknowledgement update did not return a timestamp');
      }
      return { id, acknowledgedAt: existing[0].acknowledged_at.toISOString() };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ message: '确认报警失败' } as never);
    }
  });

  fastify.post<{ Body: AcknowledgeAlarmsRequest; Reply: AcknowledgeAlarmsResponse }>(
    '/api/alarms/acknowledgements',
    async (request, reply) => {
      const ids = request.body?.ids;
      if (
        !Array.isArray(ids) ||
        ids.length < 1 ||
        ids.length > ALARM_PAGE_SIZE ||
        ids.some((id) => typeof id !== 'string' || !parseAlarmId(id))
      ) {
        return reply.code(400).send({ message: '报警 ID 列表无效' } as never);
      }

      const uniqueIds = Array.from(new Set(ids));
      try {
        const updated = await prisma.$queryRaw<{ id: bigint }[]>(Prisma.sql`
          UPDATE public.alarm_event
          SET acknowledged_at = CURRENT_TIMESTAMP
          WHERE acknowledged_at IS NULL
            AND id IN (${Prisma.join(uniqueIds.map((id) => Prisma.sql`${id}::bigint`))})
          RETURNING id
        `);
        if (updated.length > 0) {
          publishAlarmChange(fastify, '0');
        }
        return { acknowledgedCount: updated.length };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ message: '批量确认报警失败' } as never);
      }
    },
  );
}
