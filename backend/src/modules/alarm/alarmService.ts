import { Prisma } from '@prisma/client';
import type {
  AckAlarmRequest,
  AckAlarmResponse,
  AlarmAckState,
  AlarmConditionState,
  AlarmDetail,
  AlarmDetailResponse,
  AlarmListItem,
  AlarmListQueryParams,
  AlarmListResponse,
  AlarmListScope,
  AlarmLogItem,
  AlarmSeverity,
  AlarmSnapshotPayload,
  AlarmSummary,
  AlarmSummaryByAreaItem,
  AlarmSummaryQueryParams,
  AlarmUpsertPayload,
  AlarmUpsertReason,
  AuthenticatedUser,
} from '@gt4_web/shared';
import prisma from '../database/prismaClient.js';
import { getRedisDataClient } from '../redis/redisClient.js';

const ALARM_EVENT_KEY_PREFIX = 'alarm:event:';
const ACTIVE_SNAPSHOT_LIMIT = 50;
const ALARM_SEVERITIES: AlarmSeverity[] = ['critical', 'major', 'minor', 'warning', 'info'];

type AlarmEventWithArea = Prisma.AlarmEventGetPayload<{
  include: {
    area: true;
  };
}>;

type AlarmEventWithAreaAndLogs = Prisma.AlarmEventGetPayload<{
  include: {
    area: true;
    logs: {
      orderBy: {
        created_at: 'desc';
      };
    };
  };
}>;

interface AlarmRedisEventPayload {
  alarmCode: string;
  areaCode: string;
  severity: AlarmSeverity;
  sourceModule: string;
  sourceKey: string;
  title: string;
  message: string;
  detailJson: Record<string, unknown>;
  dedupeKey: string;
  occurredAt: Date;
  eventType: 'raise' | 'clear';
}

export interface AlarmMutationResult {
  areaId: number;
  upsert: AlarmUpsertPayload;
}

interface AckAlarmResult {
  response: AckAlarmResponse;
  change: AlarmMutationResult | null;
}

interface AlarmListFilters {
  scope: AlarmListScope;
  condition_state?: AlarmConditionState;
  ack_state?: AlarmAckState;
  severities: AlarmSeverity[];
  keyword?: string;
  page: number;
  page_size: number;
  area_ids: number[];
}

function isAlarmSeverity(value: unknown): value is AlarmSeverity {
  return ALARM_SEVERITIES.includes(value as AlarmSeverity);
}

function isAlarmObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toIsoString(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function toJsonRecord(value: Prisma.JsonValue | null): Record<string, unknown> {
  return isAlarmObject(value) ? value : {};
}

function buildLogPayload(
  payload: AlarmRedisEventPayload,
  extraPayload: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    alarmCode: payload.alarmCode,
    areaCode: payload.areaCode,
    severity: payload.severity,
    title: payload.title,
    message: payload.message,
    sourceModule: payload.sourceModule,
    sourceKey: payload.sourceKey,
    occurredAt: payload.occurredAt.toISOString(),
    detailJson: payload.detailJson,
    ...extraPayload,
  };
}

function mapAlarmEventToListItem(record: AlarmEventWithArea): AlarmListItem {
  return {
    id: record.id,
    alarm_code: record.alarm_code,
    area_id: record.area_id,
    area_code: record.area.area_code,
    area_name: record.area.area_name,
    severity: record.severity as AlarmSeverity,
    title: record.title,
    message: record.message,
    source_module: record.source_module,
    source_key: record.source_key,
    condition_state: record.condition_state as AlarmConditionState,
    ack_state: record.ack_state as AlarmAckState,
    first_occurred_at: record.first_occurred_at.toISOString(),
    last_occurred_at: record.last_occurred_at.toISOString(),
    cleared_at: toIsoString(record.cleared_at),
    acked_at: toIsoString(record.acked_at),
    acked_by_name: record.acked_by_name,
    version: record.version,
  };
}

function mapAlarmDetail(record: AlarmEventWithAreaAndLogs): AlarmDetailResponse {
  const alarm: AlarmDetail = {
    ...mapAlarmEventToListItem(record),
    detail_json: toJsonRecord(record.detail_json),
  };

  const logs: AlarmLogItem[] = record.logs.map((log) => ({
    id: log.id,
    action: log.action as AlarmLogItem['action'],
    operator_type: log.operator_type as AlarmLogItem['operator_type'],
    operator_id: log.operator_id,
    operator_name: log.operator_name,
    payload_json: toJsonRecord(log.payload_json),
    created_at: log.created_at.toISOString(),
  }));

  return {
    alarm,
    logs,
  };
}

function compareSeverity(left: AlarmSeverity, right: AlarmSeverity): number {
  return ALARM_SEVERITIES.indexOf(left) - ALARM_SEVERITIES.indexOf(right);
}

function getHighestSeverity(records: AlarmEventWithArea[]): AlarmSeverity | null {
  return records.reduce<AlarmSeverity | null>((highest, record) => {
    if (!highest) {
      return record.severity as AlarmSeverity;
    }

    return compareSeverity(record.severity as AlarmSeverity, highest) < 0
      ? (record.severity as AlarmSeverity)
      : highest;
  }, null);
}

function parseAreaIds(rawAreaIds?: string): number[] {
  if (!rawAreaIds) {
    return [];
  }

  return [
    ...new Set(
      rawAreaIds
        .split(',')
        .map((item) => Number.parseInt(item.trim(), 10))
        .filter((item) => !Number.isNaN(item) && item > 0),
    ),
  ];
}

function resolveVisibleAreaIds(authorizedAreaIds: number[], rawAreaIds?: string): number[] {
  const requestedAreaIds = parseAreaIds(rawAreaIds);

  if (requestedAreaIds.length === 0) {
    return authorizedAreaIds;
  }

  return requestedAreaIds.filter((areaId) => authorizedAreaIds.includes(areaId));
}

function parseSeverities(rawSeverity?: string): AlarmSeverity[] {
  if (!rawSeverity) {
    return [];
  }

  return [
    ...new Set(
      rawSeverity
        .split(',')
        .map((item) => item.trim())
        .filter(isAlarmSeverity),
    ),
  ];
}

function parsePageValue(value: number | undefined, fallback: number): number {
  if (!value || Number.isNaN(Number(value))) {
    return fallback;
  }

  return Math.max(1, Math.trunc(Number(value)));
}

function normalizeAlarmListFilters(
  authorizedAreaIds: number[],
  query: AlarmListQueryParams,
): AlarmListFilters {
  return {
    scope: query.scope ?? 'active',
    condition_state: query.condition_state,
    ack_state: query.ack_state,
    severities: parseSeverities(query.severity),
    keyword: query.keyword?.trim() || undefined,
    page: parsePageValue(query.page, 1),
    page_size: Math.min(parsePageValue(query.page_size, 50), 200),
    area_ids: resolveVisibleAreaIds(authorizedAreaIds, query.area_ids),
  };
}

function parseAlarmRedisEvent(rawPayload: string): AlarmRedisEventPayload | null {
  try {
    const payload = JSON.parse(rawPayload) as Record<string, unknown>;
    const detailJson = payload.detailJson;
    const occurredAt = typeof payload.occurredAt === 'string' ? new Date(payload.occurredAt) : null;

    if (
      typeof payload.alarmCode !== 'string' ||
      typeof payload.areaCode !== 'string' ||
      !isAlarmSeverity(payload.severity) ||
      typeof payload.sourceModule !== 'string' ||
      typeof payload.sourceKey !== 'string' ||
      typeof payload.title !== 'string' ||
      typeof payload.message !== 'string' ||
      !isAlarmObject(detailJson) ||
      typeof payload.dedupeKey !== 'string' ||
      !occurredAt ||
      Number.isNaN(occurredAt.getTime()) ||
      (payload.eventType !== 'raise' && payload.eventType !== 'clear')
    ) {
      return null;
    }

    return {
      alarmCode: payload.alarmCode,
      areaCode: payload.areaCode,
      severity: payload.severity,
      sourceModule: payload.sourceModule,
      sourceKey: payload.sourceKey,
      title: payload.title,
      message: payload.message,
      detailJson,
      dedupeKey: payload.dedupeKey,
      occurredAt,
      eventType: payload.eventType,
    };
  } catch {
    return null;
  }
}

async function resolveAlarmArea(tx: Prisma.TransactionClient, areaCode: string) {
  return tx.alarmArea.findFirst({
    where: {
      area_code: areaCode,
      enabled: true,
    },
  });
}

async function createRaiseAlarm(
  tx: Prisma.TransactionClient,
  payload: AlarmRedisEventPayload,
): Promise<AlarmMutationResult> {
  const area = await resolveAlarmArea(tx, payload.areaCode);
  if (!area) {
    throw new Error('ALARM_AREA_NOT_FOUND');
  }

  const definition = await tx.alarmDefinition.findUnique({
    where: { alarm_code: payload.alarmCode },
  });

  const activeEvent = await tx.alarmEvent.findFirst({
    where: {
      dedupe_key: payload.dedupeKey,
      condition_state: 'active',
    },
    include: {
      area: true,
    },
  });

  if (activeEvent) {
    const updatedEvent = await tx.alarmEvent.update({
      where: { id: activeEvent.id },
      data: {
        definition_id: definition?.id,
        alarm_code: payload.alarmCode,
        area_id: area.id,
        source_module: payload.sourceModule,
        source_key: payload.sourceKey,
        severity: payload.severity,
        title: payload.title,
        message: payload.message,
        detail_json: payload.detailJson as Prisma.InputJsonValue,
        last_occurred_at: payload.occurredAt,
        version: { increment: 1 },
      },
      include: {
        area: true,
      },
    });

    await tx.alarmEventLog.create({
      data: {
        alarm_event_id: updatedEvent.id,
        action: 'raise',
        operator_type: 'system',
        operator_name: payload.sourceModule,
        payload_json: buildLogPayload(payload) as Prisma.InputJsonValue,
      },
    });

    return {
      areaId: updatedEvent.area_id,
      upsert: {
        reason: 'raise',
        alarm: mapAlarmEventToListItem(updatedEvent),
      },
    };
  }

  const latestEvent = await tx.alarmEvent.findFirst({
    where: {
      dedupe_key: payload.dedupeKey,
    },
    orderBy: {
      updated_at: 'desc',
    },
    include: {
      area: true,
    },
  });

  if (latestEvent && latestEvent.condition_state === 'cleared') {
    const reopenedEvent = await tx.alarmEvent.update({
      where: { id: latestEvent.id },
      data: {
        definition_id: definition?.id,
        alarm_code: payload.alarmCode,
        area_id: area.id,
        source_module: payload.sourceModule,
        source_key: payload.sourceKey,
        severity: payload.severity,
        title: payload.title,
        message: payload.message,
        detail_json: payload.detailJson as Prisma.InputJsonValue,
        condition_state: 'active',
        ack_state: 'unacked',
        last_occurred_at: payload.occurredAt,
        cleared_at: null,
        acked_at: null,
        acked_by_user_id: null,
        acked_by_name: null,
        reopen_count: { increment: 1 },
        version: { increment: 1 },
      },
      include: {
        area: true,
      },
    });

    await tx.alarmEventLog.create({
      data: {
        alarm_event_id: reopenedEvent.id,
        action: 'raise',
        operator_type: 'system',
        operator_name: payload.sourceModule,
        payload_json: buildLogPayload(payload, { reopen: true }) as Prisma.InputJsonValue,
      },
    });

    return {
      areaId: reopenedEvent.area_id,
      upsert: {
        reason: 'reopen',
        alarm: mapAlarmEventToListItem(reopenedEvent),
      },
    };
  }

  const createdEvent = await tx.alarmEvent.create({
    data: {
      definition_id: definition?.id,
      alarm_code: payload.alarmCode,
      area_id: area.id,
      source_module: payload.sourceModule,
      source_key: payload.sourceKey,
      severity: payload.severity,
      title: payload.title,
      message: payload.message,
      detail_json: payload.detailJson as Prisma.InputJsonValue,
      condition_state: 'active',
      ack_state: 'unacked',
      first_occurred_at: payload.occurredAt,
      last_occurred_at: payload.occurredAt,
      dedupe_key: payload.dedupeKey,
    },
    include: {
      area: true,
    },
  });

  await tx.alarmEventLog.create({
    data: {
      alarm_event_id: createdEvent.id,
      action: 'raise',
      operator_type: 'system',
      operator_name: payload.sourceModule,
      payload_json: buildLogPayload(payload) as Prisma.InputJsonValue,
    },
  });

  return {
    areaId: createdEvent.area_id,
    upsert: {
      reason: 'raise',
      alarm: mapAlarmEventToListItem(createdEvent),
    },
  };
}

async function createClearAlarm(
  tx: Prisma.TransactionClient,
  payload: AlarmRedisEventPayload,
): Promise<AlarmMutationResult | null> {
  const activeEvent = await tx.alarmEvent.findFirst({
    where: {
      dedupe_key: payload.dedupeKey,
      condition_state: 'active',
    },
    include: {
      area: true,
    },
  });

  if (!activeEvent) {
    return null;
  }

  const clearedEvent = await tx.alarmEvent.update({
    where: { id: activeEvent.id },
    data: {
      severity: payload.severity,
      title: payload.title,
      message: payload.message,
      detail_json: payload.detailJson as Prisma.InputJsonValue,
      condition_state: 'cleared',
      last_occurred_at: payload.occurredAt,
      cleared_at: payload.occurredAt,
      version: { increment: 1 },
    },
    include: {
      area: true,
    },
  });

  await tx.alarmEventLog.create({
    data: {
      alarm_event_id: clearedEvent.id,
      action: 'clear',
      operator_type: 'system',
      operator_name: payload.sourceModule,
      payload_json: buildLogPayload(payload) as Prisma.InputJsonValue,
    },
  });

  return {
    areaId: clearedEvent.area_id,
    upsert: {
      reason: 'clear',
      alarm: mapAlarmEventToListItem(clearedEvent),
    },
  };
}

function buildAlarmWhere(filters: AlarmListFilters): Prisma.AlarmEventWhereInput {
  const where: Prisma.AlarmEventWhereInput = {
    area_id: {
      in: filters.area_ids,
    },
  };

  const defaultConditionState =
    filters.scope === 'history' ? 'cleared' : filters.scope === 'all' ? undefined : 'active';

  if (filters.condition_state ?? defaultConditionState) {
    where.condition_state = (filters.condition_state ??
      defaultConditionState) as AlarmConditionState;
  }

  if (filters.ack_state) {
    where.ack_state = filters.ack_state;
  }

  if (filters.severities.length > 0) {
    where.severity = {
      in: filters.severities,
    };
  }

  if (filters.keyword) {
    where.OR = [
      { title: { contains: filters.keyword, mode: 'insensitive' } },
      { message: { contains: filters.keyword, mode: 'insensitive' } },
      { alarm_code: { contains: filters.keyword, mode: 'insensitive' } },
    ];
  }

  return where;
}

function resolveAlarmEventRedisKey(payloadKey: string): string {
  return payloadKey.startsWith(ALARM_EVENT_KEY_PREFIX)
    ? payloadKey
    : `${ALARM_EVENT_KEY_PREFIX}${payloadKey}`;
}

export async function handleAlarmChanged(payloadKey: string): Promise<AlarmMutationResult | null> {
  const eventKey = resolveAlarmEventRedisKey(payloadKey);
  const redisValue = await getRedisDataClient().get(eventKey);
  if (!redisValue) {
    console.warn(`[AlarmService] 报警事件键不存在: ${eventKey}`);
    return null;
  }

  const payload = parseAlarmRedisEvent(redisValue);
  if (!payload) {
    console.error(`[AlarmService] 报警事件载荷格式无效: ${eventKey}`);
    return null;
  }

  try {
    return await prisma.$transaction(async (tx) => {
      if (payload.eventType === 'raise') {
        return createRaiseAlarm(tx, payload);
      }

      return createClearAlarm(tx, payload);
    });
  } catch (error) {
    console.error(`[AlarmService] 持久化报警事件失败: ${eventKey}`, error);
    return null;
  }
}

export async function getAlarmSummary(
  authorizedAreaIds: number[],
  query: AlarmSummaryQueryParams = {},
): Promise<AlarmSummary> {
  const visibleAreaIds = resolveVisibleAreaIds(authorizedAreaIds, query.area_ids);
  if (visibleAreaIds.length === 0) {
    return {
      server_time: new Date().toISOString(),
      total_active: 0,
      total_unacked: 0,
      highest_severity: null,
      by_severity: {
        critical: 0,
        major: 0,
        minor: 0,
        warning: 0,
        info: 0,
      },
      by_area: [],
    };
  }

  const [areas, activeEvents] = await Promise.all([
    prisma.alarmArea.findMany({
      where: {
        id: { in: visibleAreaIds },
        enabled: true,
      },
    }),
    prisma.alarmEvent.findMany({
      where: {
        area_id: { in: visibleAreaIds },
        condition_state: 'active',
      },
      include: {
        area: true,
      },
    }),
  ]);

  const bySeverity = {
    critical: 0,
    major: 0,
    minor: 0,
    warning: 0,
    info: 0,
  };

  activeEvents.forEach((record) => {
    bySeverity[record.severity as AlarmSeverity] += 1;
  });

  const byArea: AlarmSummaryByAreaItem[] = areas
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((area) => {
      const areaEvents = activeEvents.filter((record) => record.area_id === area.id);

      return {
        area_id: area.id,
        area_code: area.area_code,
        area_name: area.area_name,
        active_count: areaEvents.length,
        unacked_count: areaEvents.filter((record) => record.ack_state === 'unacked').length,
      };
    });

  return {
    server_time: new Date().toISOString(),
    total_active: activeEvents.length,
    total_unacked: activeEvents.filter((record) => record.ack_state === 'unacked').length,
    highest_severity: getHighestSeverity(activeEvents),
    by_severity: bySeverity,
    by_area: byArea,
  };
}

export async function getAlarmList(
  authorizedAreaIds: number[],
  query: AlarmListQueryParams = {},
): Promise<AlarmListResponse> {
  const filters = normalizeAlarmListFilters(authorizedAreaIds, query);
  if (filters.area_ids.length === 0) {
    return {
      items: [],
      page: filters.page,
      page_size: filters.page_size,
      total: 0,
    };
  }

  const where = buildAlarmWhere(filters);
  const [total, records] = await Promise.all([
    prisma.alarmEvent.count({ where }),
    prisma.alarmEvent.findMany({
      where,
      include: {
        area: true,
      },
      orderBy: {
        last_occurred_at: 'desc',
      },
      skip: (filters.page - 1) * filters.page_size,
      take: filters.page_size,
    }),
  ]);

  return {
    items: records.map(mapAlarmEventToListItem),
    page: filters.page,
    page_size: filters.page_size,
    total,
  };
}

export async function getAlarmDetail(
  authorizedAreaIds: number[],
  alarmId: number,
): Promise<AlarmDetailResponse | null> {
  if (authorizedAreaIds.length === 0) {
    return null;
  }

  const record = await prisma.alarmEvent.findFirst({
    where: {
      id: alarmId,
      area_id: { in: authorizedAreaIds },
    },
    include: {
      area: true,
      logs: {
        orderBy: {
          created_at: 'desc',
        },
      },
    },
  });

  return record ? mapAlarmDetail(record) : null;
}

export async function ackAlarmEvent(
  authorizedAreaIds: number[],
  alarmId: number,
  user: AuthenticatedUser,
  request: AckAlarmRequest,
): Promise<AckAlarmResult> {
  if (authorizedAreaIds.length === 0) {
    throw new Error('ALARM_NOT_FOUND');
  }

  return prisma.$transaction(async (tx) => {
    const record = await tx.alarmEvent.findFirst({
      where: {
        id: alarmId,
        area_id: { in: authorizedAreaIds },
      },
      include: {
        area: true,
      },
    });

    if (!record) {
      throw new Error('ALARM_NOT_FOUND');
    }

    if (record.version !== request.expected_version) {
      throw new Error('ALARM_VERSION_CONFLICT');
    }

    if (record.ack_state === 'acked') {
      return {
        response: {
          alarm: {
            id: record.id,
            ack_state: record.ack_state as AckAlarmResponse['alarm']['ack_state'],
            acked_at: toIsoString(record.acked_at),
            acked_by_name: record.acked_by_name,
            version: record.version,
          },
        },
        change: null,
      };
    }

    const ackedAt = new Date();
    const updatedRecord = await tx.alarmEvent.update({
      where: { id: record.id },
      data: {
        ack_state: 'acked',
        acked_at: ackedAt,
        acked_by_user_id: user.id,
        acked_by_name: user.username,
        version: { increment: 1 },
      },
      include: {
        area: true,
      },
    });

    await tx.alarmEventLog.create({
      data: {
        alarm_event_id: updatedRecord.id,
        action: 'ack',
        operator_type: 'user',
        operator_id: user.id,
        operator_name: user.username,
        payload_json: {
          operatorNote: request.operator_note ?? null,
        } as Prisma.InputJsonValue,
      },
    });

    return {
      response: {
        alarm: {
          id: updatedRecord.id,
          ack_state: updatedRecord.ack_state as AckAlarmResponse['alarm']['ack_state'],
          acked_at: updatedRecord.acked_at?.toISOString() ?? null,
          acked_by_name: updatedRecord.acked_by_name,
          version: updatedRecord.version,
        },
      },
      change: {
        areaId: updatedRecord.area_id,
        upsert: {
          reason: 'ack',
          alarm: mapAlarmEventToListItem(updatedRecord),
        },
      },
    };
  });
}

export async function buildAlarmSnapshot(areaIds: number[]): Promise<AlarmSnapshotPayload> {
  const summary = await getAlarmSummary(areaIds);
  const activeList = await getAlarmList(areaIds, {
    scope: 'active',
    page: 1,
    page_size: ACTIVE_SNAPSHOT_LIMIT,
  });

  return {
    server_time: summary.server_time,
    summary: {
      total_active: summary.total_active,
      total_unacked: summary.total_unacked,
      highest_severity: summary.highest_severity,
    },
    active_items: activeList.items,
  };
}
