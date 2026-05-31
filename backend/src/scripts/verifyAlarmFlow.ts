import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import type {
  AckAlarmRequest,
  AckAlarmResponse,
  AlarmBatchAckRequest,
  AlarmBatchAckResponse,
  AlarmDetailResponse,
  AlarmListItem,
  AlarmListResponse,
  AlarmSnapshotPayload,
  AlarmSummary,
  AlarmUpsertPayload,
  AuthenticatedUser,
} from '@gt4_web/shared';
import { io as createSocketClient, type Socket } from 'socket.io-client';
import { buildBackendApp, startBackendApp } from '../app.js';
import { createAuthToken } from '../modules/auth/authSession.js';
import prisma from '../modules/database/prismaClient.js';
import { bootstrapAlarmStorage } from '../modules/database/alarmStorage.js';
import { closeRedisClients, getRedisDataClient } from '../modules/redis/redisClient.js';
import { getSocketServer } from '../modules/websocket/socketServer.js';

interface VerificationAlarmPayload {
  alarmCode: string;
  areaCode: string;
  severity: 'major';
  sourceModule: string;
  sourceKey: string;
  title: string;
  message: string;
  detailJson: Record<string, unknown>;
  dedupeKey: string;
  occurredAt: string;
  eventType: 'raise' | 'clear';
}

interface JsonResponse<T> {
  status: number;
  body: T;
}

const AREA_A_USER: AuthenticatedUser = {
  id: 2,
  username: 'user1',
  role: 'user',
};

const AREA_B_USER: AuthenticatedUser = {
  id: 3,
  username: 'user2',
  role: 'user',
};

const ADMIN_USER: AuthenticatedUser = {
  id: 1,
  username: 'admin',
  role: 'admin',
};

function buildVerificationAlarmPayload(
  runId: string,
  eventType: 'raise' | 'clear',
  message: string,
  overrides: Partial<VerificationAlarmPayload> = {},
): VerificationAlarmPayload {
  return {
    alarmCode: 'VERIFY_WEIGHT_ALARM_FLOW',
    areaCode: 'AREA-A',
    severity: 'major',
    sourceModule: 'AlarmVerification',
    sourceKey: `verify-alarm-flow:${runId}`,
    title: `报警链路验证 ${runId}`,
    message,
    detailJson: {
      runId,
      message,
      stage: eventType,
    },
    dedupeKey: `verify-alarm-flow:${runId}`,
    occurredAt: new Date().toISOString(),
    eventType,
    ...overrides,
  };
}

async function connectSocket(
  baseUrl: string,
  token: string,
  snapshotPredicate?: (payload: AlarmSnapshotPayload) => boolean,
): Promise<{ socket: Socket; snapshot: AlarmSnapshotPayload | null }> {
  const socket = createSocketClient(baseUrl, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: false,
  });

  const snapshotPromise = snapshotPredicate
    ? waitForSocketEvent<AlarmSnapshotPayload>(socket, 'alarm:snapshot', snapshotPredicate)
    : Promise.resolve<AlarmSnapshotPayload | null>(null);

  const connectPromise = new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Socket connection timed out'));
    }, 5000);

    const handleConnect = () => {
      cleanup();
      resolve();
    };

    const handleError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      clearTimeout(timeout);
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleError);
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleError);
  });

  socket.connect();

  await connectPromise;
  const snapshot = await snapshotPromise;

  return { socket, snapshot };
}

async function waitForSocketEvent<T>(
  socket: Socket,
  eventName: string,
  predicate: (payload: T) => boolean,
  timeoutMs = 5000,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for ${eventName}`));
    }, timeoutMs);

    const handleEvent = (payload: T) => {
      if (!predicate(payload)) {
        return;
      }

      cleanup();
      resolve(payload);
    };

    const handleError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      clearTimeout(timeout);
      socket.off(eventName, handleEvent);
      socket.off('connect_error', handleError);
    };

    socket.on(eventName, handleEvent);
    socket.on('connect_error', handleError);
  });
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<JsonResponse<T>> {
  const response = await fetch(url, init);
  const bodyText = await response.text();
  const body = bodyText ? (JSON.parse(bodyText) as T) : ({} as T);
  return {
    status: response.status,
    body,
  };
}

async function publishAlarmEvent(payload: VerificationAlarmPayload): Promise<void> {
  const redis = getRedisDataClient();
  const eventKey = `alarm:event:${payload.dedupeKey}`;
  await redis.set(eventKey, JSON.stringify(payload));
  await redis.publish('AlarmChanged', eventKey);
}

function findAlarmBySourceKey(
  items: AlarmListItem[],
  sourceKey: string,
): AlarmListItem | undefined {
  return items.find((item) => item.source_key === sourceKey);
}

async function requestAlarmList(
  baseUrl: string,
  token: string,
  scope: 'active' | 'history' | 'all' = 'active',
): Promise<JsonResponse<AlarmListResponse>> {
  return fetchJson<AlarmListResponse>(`${baseUrl}/api/alarms?scope=${scope}&page=1&page_size=100`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

async function requestAlarmDetail(
  baseUrl: string,
  token: string,
  alarmId: number,
): Promise<JsonResponse<AlarmDetailResponse>> {
  return fetchJson<AlarmDetailResponse>(`${baseUrl}/api/alarms/${alarmId}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

async function requestAckAlarm(
  baseUrl: string,
  token: string,
  alarmId: number,
  payload: AckAlarmRequest,
): Promise<JsonResponse<AckAlarmResponse | { message: string }>> {
  return fetchJson<AckAlarmResponse | { message: string }>(`${baseUrl}/api/alarms/${alarmId}/ack`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

async function requestBatchAckAlarms(
  baseUrl: string,
  token: string,
  payload: AlarmBatchAckRequest,
): Promise<JsonResponse<AlarmBatchAckResponse | { message: string }>> {
  return fetchJson<AlarmBatchAckResponse | { message: string }>(
    `${baseUrl}/api/admin/alarms/batch-ack`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );
}

async function requestAlarmSummary(
  baseUrl: string,
  token: string,
): Promise<JsonResponse<AlarmSummary>> {
  return fetchJson<AlarmSummary>(`${baseUrl}/api/alarms/summary`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

async function main() {
  await bootstrapAlarmStorage();

  const fastify = buildBackendApp();
  let areaASocket: Socket | null = null;
  let areaBSocket: Socket | null = null;
  let adminSocket: Socket | null = null;
  let snapshotSocket: Socket | null = null;

  try {
    const address = await startBackendApp(fastify, {
      host: '127.0.0.1',
      port: 0,
      startMockDataGenerator: false,
      startRedisSubscriber: true,
    });

    const baseUrl = address.replace('0.0.0.0', '127.0.0.1');
    const runId = `${Date.now()}`;
    const areaAToken = createAuthToken(AREA_A_USER);
    const areaBToken = createAuthToken(AREA_B_USER);
    const adminToken = createAuthToken(ADMIN_USER);
    const initialRaisePayload = buildVerificationAlarmPayload(runId, 'raise', '首次产生验证报警');

    await delay(300);

    const areaAConnection = await connectSocket(baseUrl, areaAToken, () => true);
    const areaBConnection = await connectSocket(baseUrl, areaBToken, () => true);

    areaASocket = areaAConnection.socket;
    areaBSocket = areaBConnection.socket;

    await publishAlarmEvent(initialRaisePayload);

    const firstRaise = await waitForSocketEvent<AlarmUpsertPayload>(
      areaASocket,
      'alarm:upsert',
      (payload) =>
        payload.reason === 'raise' && payload.alarm.source_key === initialRaisePayload.sourceKey,
    );

    await assert.rejects(
      waitForSocketEvent<AlarmUpsertPayload>(
        areaBSocket,
        'alarm:upsert',
        (payload) => payload.alarm.source_key === initialRaisePayload.sourceKey,
        1200,
      ),
      /Timed out waiting for alarm:upsert/,
    );

    const activeListForAreaA = await requestAlarmList(baseUrl, areaAToken);
    assert.equal(activeListForAreaA.status, 200, 'AREA-A 用户应能查询活动报警');
    const firstAlarm = findAlarmBySourceKey(
      activeListForAreaA.body.items,
      initialRaisePayload.sourceKey,
    );
    assert.ok(firstAlarm, 'AREA-A 用户应能看到刚产生的报警');
    assert.equal(firstRaise.alarm.id, firstAlarm.id, 'Socket upsert 与 HTTP 列表应指向同一报警');

    const activeListForAreaB = await requestAlarmList(baseUrl, areaBToken);
    assert.equal(activeListForAreaB.status, 200, 'AREA-B 用户查询应成功');
    assert.equal(
      findAlarmBySourceKey(activeListForAreaB.body.items, initialRaisePayload.sourceKey),
      undefined,
      'AREA-B 用户不应看到 AREA-A 报警',
    );

    const secondRaisePayload = {
      ...buildVerificationAlarmPayload(runId, 'raise', '同一 dedupeKey 再次产生验证报警'),
      sourceKey: initialRaisePayload.sourceKey,
      dedupeKey: initialRaisePayload.dedupeKey,
      title: initialRaisePayload.title,
    };

    await publishAlarmEvent(secondRaisePayload);

    const secondRaise = await waitForSocketEvent<AlarmUpsertPayload>(
      areaASocket,
      'alarm:upsert',
      (payload) =>
        payload.reason === 'raise' && payload.alarm.source_key === initialRaisePayload.sourceKey,
    );

    assert.equal(
      secondRaise.alarm.id,
      firstAlarm.id,
      '同一 dedupeKey 的重复 raise 应归并到同一报警',
    );
    assert.ok(secondRaise.alarm.version > firstAlarm.version, '重复 raise 应递增版本号');

    const staleAck = await requestAckAlarm(baseUrl, areaAToken, firstAlarm.id, {
      expected_version: firstAlarm.version,
    });
    assert.equal(staleAck.status, 409, '使用过期版本确认报警应返回 409');

    const detailBeforeAck = await requestAlarmDetail(baseUrl, areaAToken, firstAlarm.id);
    assert.equal(detailBeforeAck.status, 200, '确认前应能读取报警详情');

    const ackResponse = await requestAckAlarm(baseUrl, areaAToken, firstAlarm.id, {
      expected_version: detailBeforeAck.body.alarm.version,
      operator_note: 'verification-ack',
    });
    assert.equal(ackResponse.status, 200, '使用最新版本确认报警应成功');

    const summaryAfterAck = await requestAlarmSummary(baseUrl, areaAToken);
    assert.equal(summaryAfterAck.status, 200, '确认后报警汇总查询应成功');
    assert.ok(summaryAfterAck.body.total_active >= 1, '确认后活动报警总数应保持可查询');

    const clearPayload = {
      ...buildVerificationAlarmPayload(runId, 'clear', '验证报警已清除'),
      sourceKey: initialRaisePayload.sourceKey,
      dedupeKey: initialRaisePayload.dedupeKey,
      title: initialRaisePayload.title,
    };

    await publishAlarmEvent(clearPayload);

    const clearUpsert = await waitForSocketEvent<AlarmUpsertPayload>(
      areaASocket,
      'alarm:upsert',
      (payload) =>
        payload.reason === 'clear' && payload.alarm.source_key === initialRaisePayload.sourceKey,
    );
    assert.equal(clearUpsert.alarm.condition_state, 'cleared', 'clear 后报警应进入已清除状态');

    const historyList = await requestAlarmList(baseUrl, areaAToken, 'history');
    assert.equal(historyList.status, 200, '历史报警查询应成功');
    assert.ok(
      findAlarmBySourceKey(historyList.body.items, initialRaisePayload.sourceKey),
      '已清除报警应能在历史列表中查询到',
    );

    const reopenPayload = {
      ...buildVerificationAlarmPayload(runId, 'raise', '验证报警重新产生'),
      sourceKey: initialRaisePayload.sourceKey,
      dedupeKey: initialRaisePayload.dedupeKey,
      title: initialRaisePayload.title,
    };

    await publishAlarmEvent(reopenPayload);

    const reopenUpsert = await waitForSocketEvent<AlarmUpsertPayload>(
      areaASocket,
      'alarm:upsert',
      (payload) =>
        payload.reason === 'reopen' && payload.alarm.source_key === initialRaisePayload.sourceKey,
    );
    assert.equal(reopenUpsert.alarm.id, firstAlarm.id, 'reopen 应复用原报警记录');

    const areaBAdminPayload = buildVerificationAlarmPayload(
      runId,
      'raise',
      'AREA-B admin 视角验证',
      {
        areaCode: 'AREA-B',
        sourceKey: `verify-admin-area-b:${runId}`,
        dedupeKey: `verify-admin-area-b:${runId}`,
        title: `AREA-B admin 视角验证 ${runId}`,
      },
    );

    const areaBAdminUpsertPromise = waitForSocketEvent<AlarmUpsertPayload>(
      areaBSocket,
      'alarm:upsert',
      (payload) => payload.alarm.source_key === areaBAdminPayload.sourceKey,
    );
    await publishAlarmEvent(areaBAdminPayload);
    const areaBAdminUpsert = await areaBAdminUpsertPromise;
    assert.equal(areaBAdminUpsert.alarm.area_code, 'AREA-B', 'AREA-B 报警应广播到 AREA-B 用户');

    const adminActiveList = await requestAlarmList(baseUrl, adminToken);
    assert.equal(adminActiveList.status, 200, 'admin 应能查询活动报警');
    assert.ok(
      findAlarmBySourceKey(adminActiveList.body.items, initialRaisePayload.sourceKey),
      'admin 活动报警查询应包含 AREA-A 报警',
    );
    assert.ok(
      findAlarmBySourceKey(adminActiveList.body.items, areaBAdminPayload.sourceKey),
      'admin 活动报警查询应包含 AREA-B 报警',
    );

    const adminSummary = await requestAlarmSummary(baseUrl, adminToken);
    assert.equal(adminSummary.status, 200, 'admin 报警汇总查询应成功');
    assert.ok(adminSummary.body.by_area.length >= 2, 'admin 汇总应覆盖多个区域');

    const adminDetailTarget = findAlarmBySourceKey(
      adminActiveList.body.items,
      areaBAdminPayload.sourceKey,
    );
    assert.ok(adminDetailTarget, 'admin 应能定位 AREA-B 报警详情');
    const adminDetail = await requestAlarmDetail(baseUrl, adminToken, adminDetailTarget.id);
    assert.equal(adminDetail.status, 200, 'admin 应能读取 AREA-B 报警详情');

    const adminConnection = await connectSocket(
      baseUrl,
      adminToken,
      (payload) =>
        payload.active_items.some((item) => item.source_key === initialRaisePayload.sourceKey) &&
        payload.active_items.some((item) => item.source_key === areaBAdminPayload.sourceKey),
    );

    adminSocket = adminConnection.socket;
    assert.ok(adminConnection.snapshot, 'admin 新连接应收到首屏快照');
    assert.ok(
      adminConnection.snapshot?.active_items.some(
        (item) => item.source_key === areaBAdminPayload.sourceKey,
      ),
      'admin 首屏快照应包含 AREA-B 报警',
    );

    const batchAckSuccessPayload = buildVerificationAlarmPayload(runId, 'raise', '批量确认成功项', {
      sourceKey: `verify-batch-success:${runId}`,
      dedupeKey: `verify-batch-success:${runId}`,
      title: `批量确认成功项 ${runId}`,
    });
    const batchAckConflictPayload = buildVerificationAlarmPayload(
      runId,
      'raise',
      '批量确认冲突项',
      {
        areaCode: 'AREA-B',
        sourceKey: `verify-batch-conflict:${runId}`,
        dedupeKey: `verify-batch-conflict:${runId}`,
        title: `批量确认冲突项 ${runId}`,
      },
    );
    const batchAckAlreadyPayload = buildVerificationAlarmPayload(
      runId,
      'raise',
      '批量确认已确认项',
      {
        sourceKey: `verify-batch-already:${runId}`,
        dedupeKey: `verify-batch-already:${runId}`,
        title: `批量确认已确认项 ${runId}`,
      },
    );

    const batchSuccessUpsertPromise = waitForSocketEvent<AlarmUpsertPayload>(
      areaASocket,
      'alarm:upsert',
      (payload) => payload.alarm.source_key === batchAckSuccessPayload.sourceKey,
    );
    await publishAlarmEvent(batchAckSuccessPayload);
    await batchSuccessUpsertPromise;

    const batchConflictUpsertPromise = waitForSocketEvent<AlarmUpsertPayload>(
      areaBSocket,
      'alarm:upsert',
      (payload) => payload.alarm.source_key === batchAckConflictPayload.sourceKey,
    );
    await publishAlarmEvent(batchAckConflictPayload);
    await batchConflictUpsertPromise;

    const batchAlreadyUpsertPromise = waitForSocketEvent<AlarmUpsertPayload>(
      areaASocket,
      'alarm:upsert',
      (payload) => payload.alarm.source_key === batchAckAlreadyPayload.sourceKey,
    );
    await publishAlarmEvent(batchAckAlreadyPayload);
    await batchAlreadyUpsertPromise;

    const adminListBeforeBatch = await requestAlarmList(baseUrl, adminToken);
    assert.equal(adminListBeforeBatch.status, 200, '批量确认前 admin 列表查询应成功');

    const successAlarm = findAlarmBySourceKey(
      adminListBeforeBatch.body.items,
      batchAckSuccessPayload.sourceKey,
    );
    const conflictAlarmBeforeRefresh = findAlarmBySourceKey(
      adminListBeforeBatch.body.items,
      batchAckConflictPayload.sourceKey,
    );
    const alreadyAckedAlarm = findAlarmBySourceKey(
      adminListBeforeBatch.body.items,
      batchAckAlreadyPayload.sourceKey,
    );

    assert.ok(successAlarm, '批量确认成功项应存在');
    assert.ok(conflictAlarmBeforeRefresh, '批量确认冲突项应存在');
    assert.ok(alreadyAckedAlarm, '批量确认已确认项应存在');

    const conflictRefreshPayload = buildVerificationAlarmPayload(
      runId,
      'raise',
      '批量确认冲突项刷新版本',
      {
        areaCode: 'AREA-B',
        sourceKey: batchAckConflictPayload.sourceKey,
        dedupeKey: batchAckConflictPayload.dedupeKey,
        title: batchAckConflictPayload.title,
      },
    );

    const conflictRefreshUpsertPromise = waitForSocketEvent<AlarmUpsertPayload>(
      areaBSocket,
      'alarm:upsert',
      (payload) => payload.alarm.source_key === batchAckConflictPayload.sourceKey,
    );
    await publishAlarmEvent(conflictRefreshPayload);
    await conflictRefreshUpsertPromise;

    const alreadyAckedDetailBefore = await requestAlarmDetail(
      baseUrl,
      adminToken,
      alreadyAckedAlarm.id,
    );
    assert.equal(alreadyAckedDetailBefore.status, 200, '批量确认前应能读取已确认项详情');
    const alreadyAckedLogCountBefore = alreadyAckedDetailBefore.body.logs.length;

    const singleAckForAlready = await requestAckAlarm(baseUrl, adminToken, alreadyAckedAlarm.id, {
      expected_version: alreadyAckedDetailBefore.body.alarm.version,
      operator_note: 'pre-batch-ack',
    });
    assert.equal(singleAckForAlready.status, 200, '预先确认批量已确认项应成功');

    const conflictDetailAfterRefresh = await requestAlarmDetail(
      baseUrl,
      adminToken,
      conflictAlarmBeforeRefresh.id,
    );
    assert.equal(conflictDetailAfterRefresh.status, 200, '批量确认冲突项详情应可读取');
    const conflictLogCountBefore = conflictDetailAfterRefresh.body.logs.length;

    const batchUpsertPromise = waitForSocketEvent<AlarmUpsertPayload>(
      adminSocket,
      'alarm:upsert',
      (payload) => payload.reason === 'ack' && payload.alarm.id === successAlarm.id,
    );
    const batchSummaryPromise = waitForSocketEvent<AlarmSummary>(
      adminSocket,
      'alarm:summary',
      (payload) => payload.total_unacked >= 0,
    );

    const batchAckResponse = await requestBatchAckAlarms(baseUrl, adminToken, {
      operator_note: 'batch-ack-note',
      items: [
        {
          alarm_id: successAlarm.id,
          expected_version: successAlarm.version,
        },
        {
          alarm_id: conflictAlarmBeforeRefresh.id,
          expected_version: conflictAlarmBeforeRefresh.version,
        },
        {
          alarm_id: alreadyAckedAlarm.id,
          expected_version: alreadyAckedAlarm.version,
        },
        {
          alarm_id: 999999,
          expected_version: 1,
        },
      ],
    });

    assert.equal(batchAckResponse.status, 200, 'admin 批量确认请求应成功');
    const batchAckBody = batchAckResponse.body as AlarmBatchAckResponse;
    assert.deepEqual(
      batchAckBody.results,
      [
        { alarm_id: successAlarm.id, status: 'acked' },
        { alarm_id: conflictAlarmBeforeRefresh.id, status: 'conflict' },
        { alarm_id: alreadyAckedAlarm.id, status: 'already_acked' },
        { alarm_id: 999999, status: 'not_found' },
      ],
      '批量确认结果应覆盖成功、冲突、已确认和不存在四种状态',
    );
    assert.equal(batchAckBody.requested_count, 4, '批量确认请求总数应正确');
    assert.equal(batchAckBody.acked_count, 1, '批量确认成功数应正确');

    await batchUpsertPromise;
    await batchSummaryPromise;

    const successDetailAfterBatch = await requestAlarmDetail(baseUrl, adminToken, successAlarm.id);
    assert.equal(successDetailAfterBatch.status, 200, '批量确认成功项详情应可读取');
    assert.equal(successDetailAfterBatch.body.alarm.ack_state, 'acked', '成功项应进入已确认状态');
    assert.ok(
      successDetailAfterBatch.body.logs.some(
        (log) => log.action === 'ack' && log.payload_json.operatorNote === 'batch-ack-note',
      ),
      '批量确认成功项应写入统一 operator_note',
    );

    const conflictDetailAfterBatch = await requestAlarmDetail(
      baseUrl,
      adminToken,
      conflictAlarmBeforeRefresh.id,
    );
    assert.equal(conflictDetailAfterBatch.status, 200, '冲突项详情应可读取');
    assert.equal(conflictDetailAfterBatch.body.alarm.ack_state, 'unacked', '冲突项不应被确认');
    assert.equal(
      conflictDetailAfterBatch.body.logs.length,
      conflictLogCountBefore,
      '冲突项不应产生新的确认日志',
    );

    const alreadyAckedDetailAfterBatch = await requestAlarmDetail(
      baseUrl,
      adminToken,
      alreadyAckedAlarm.id,
    );
    assert.equal(alreadyAckedDetailAfterBatch.status, 200, '已确认项详情应可读取');
    assert.equal(
      alreadyAckedDetailAfterBatch.body.logs.length,
      alreadyAckedLogCountBefore + 1,
      '批量确认前的单条确认应写一条日志，批量本身不应追加新日志',
    );

    const snapshotConnection = await connectSocket(baseUrl, areaAToken, (payload) =>
      payload.active_items.some((item) => item.source_key === initialRaisePayload.sourceKey),
    );

    snapshotSocket = snapshotConnection.socket;
    const snapshot = snapshotConnection.snapshot;
    assert.ok(snapshot, '新连接应收到首屏快照');
    assert.ok(
      snapshot.active_items.some((item) => item.source_key === initialRaisePayload.sourceKey),
      '新连接的首屏快照应包含当前活动报警',
    );

    console.log(
      '[AlarmVerify] dedupe/reopen、区域过滤、admin 全区域访问、批量确认和 Socket 首屏快照验证通过',
    );
  } finally {
    areaASocket?.disconnect();
    areaBSocket?.disconnect();
    adminSocket?.disconnect();
    snapshotSocket?.disconnect();

    try {
      getSocketServer().close();
    } catch {
      // ignore when socket server was not initialized
    }

    await fastify.close();
    await closeRedisClients();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('[AlarmVerify] 验证失败', error);
  process.exitCode = 1;
});
