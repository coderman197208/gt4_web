/**
 * WebSocket客户端服务（Vue Composable）
 * 提供全局单例WebSocket连接，支持订阅和数据推送
 */

import { ref } from 'vue';
import { io, Socket } from 'socket.io-client';
import type {
  AlarmResyncRequiredPayload,
  AlarmSnapshotPayload,
  AlarmSummaryPayload,
  AlarmUpsertPayload,
  SubscribeRequest,
  DataPushMessage,
  CmdPushMessage,
  UserCommandPayload,
} from '@gt4_web/shared';
import { getAuthToken } from '@/api/auth';
import { useAlarmCenterStore } from '@/stores/alarmCenter';
import { useRealtimeDataStore } from '@/stores/realtimeData';

// 全局单例Socket实例
let socket: Socket | null = null;
let isInitialized = false;

// 当前订阅的tags，用于重连后自动恢复订阅
let currentTags: string[] = [];
let persistentTags: string[] = [];

// 仅跟踪外部注册的 data:push 监听器，避免误删内部处理器
const externalDataPushListeners = new Set<(data: DataPushMessage) => void>();

// 是否已经完成过首次连接（用于区分"首次连接"和"重连"）
let hasConnectedOnce = false;

// 响应式状态
const isConnected = ref(false);
const error = ref<string | null>(null);

function buildSocketAuth() {
  return {
    token: getAuthToken() ?? undefined,
  };
}

function normalizeTags(tags: string[]): string[] {
  return tags.map((tag) => tag.trim()).filter(Boolean);
}

function buildMergedTags(tags: string[]): string[] {
  return Array.from(new Set([...persistentTags, ...normalizeTags(tags)]));
}

function emitSubscription(tags: string[]): void {
  if (!socket) {
    return;
  }

  const mergedTags = buildMergedTags(tags);
  const request: SubscribeRequest = { tags: mergedTags };
  socket.emit('subscribe', request);
  console.log('[WebSocket] 已发送订阅请求:', mergedTags);
}

function looksLikeJsonLiteral(value: string): boolean {
  if (value === 'true' || value === 'false' || value === 'null') {
    return true;
  }

  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value)) {
    return true;
  }

  const firstChar = value[0];
  return firstChar === '{' || firstChar === '[' || firstChar === '"';
}

function parseDataPushValue(message: DataPushMessage): unknown {
  if (message.hasValue === false || message.value == null) {
    return undefined;
  }

  const rawValue = message.value.trim();

  if (rawValue === '') {
    console.warn('[WebSocket] 收到空数据推送，按 null 处理:', message.tag);
    return null;
  }

  if (!looksLikeJsonLiteral(rawValue)) {
    return rawValue;
  }

  try {
    return JSON.parse(rawValue);
  } catch (err) {
    console.error('[WebSocket] 解析推送数据失败:', err, message);
    return undefined;
  }
}

// 把更新 Pinia store 的内部处理器提取成固定函数，并且新增一个外部监听器集合，
// 只跟踪通过 onDataPush 注册的回调。这样offDataPush 在无参时只会清理外部回调，不会碰内部处理器；
// 有参时也只移除指定的外部回调。
function handleInternalDataPush(message: DataPushMessage) {
  console.log('[WebSocket] 收到数据推送:', message);

  if (message.hasValue === false || message.value == null) {
    console.log('[WebSocket] 收到无值事件推送，仅通知外部监听器:', message.tag);
    return;
  }

  const parsedValue = parseDataPushValue(message);
  if (parsedValue === undefined) {
    return;
  }

  const store = useRealtimeDataStore();
  store.updateData(message.tag, parsedValue);
}

function handleAlarmSnapshot(payload: AlarmSnapshotPayload) {
  const store = useAlarmCenterStore();
  store.applySnapshot(payload);
}

function handleAlarmUpsert(payload: AlarmUpsertPayload) {
  const store = useAlarmCenterStore();
  store.applyUpsert(payload);
}

function handleAlarmSummary(payload: AlarmSummaryPayload) {
  const store = useAlarmCenterStore();
  store.applySummary(payload);
}

function handleAlarmResyncRequired(payload: AlarmResyncRequiredPayload) {
  const store = useAlarmCenterStore();
  store.markResyncRequired(payload.reason);
}

function setupAlarmHandlers() {
  if (!socket) return;

  socket.on('alarm:snapshot', handleAlarmSnapshot);
  socket.on('alarm:upsert', handleAlarmUpsert);
  socket.on('alarm:summary', handleAlarmSummary);
  socket.on('alarm:resync-required', handleAlarmResyncRequired);
}

/**
 * 设置数据推送处理器，自动更新store
 */
function setupDataPushHandler() {
  if (!socket) return;

  socket.on('data:push', handleInternalDataPush);
}

/**
 * 初始化WebSocket连接（仅在首次调用时创建）
 */
function initSocket() {
  if (socket) {
    return socket;
  }
  // 开发环境不指定URL，自动连接当前页面origin，走Vite的/socket.io代理
  // 生产环境可通过VITE_WS_URL指定后端地址
  const serverUrl = import.meta.env.VITE_WS_URL || undefined;

  socket = io(serverUrl ?? '', {
    auth: buildSocketAuth(),
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  // 监听连接成功事件（初次连接和每次重连都会触发）
  socket.on('connect', () => {
    console.log('[WebSocket] 连接已建立:', socket?.id);
    isConnected.value = true;
    error.value = null;

    // 仅在重连时自动恢复订阅；首次连接由组件onMounted主动调用subscribe，无需重复
    if (persistentTags.length > 0 || currentTags.length > 0) {
      emitSubscription(currentTags);

      if (hasConnectedOnce) {
        console.log('[WebSocket] 重连后自动恢复订阅:', buildMergedTags(currentTags));
      }
    }

    hasConnectedOnce = true;
  });

  // 监听断开连接事件
  socket.on('disconnect', (reason) => {
    console.log('[WebSocket] 连接已断开:', reason);
    isConnected.value = false;

    if (reason === 'io server disconnect') {
      // 服务端主动断开，需要手动重连
      socket?.connect();
    }
  });

  // 监听连接错误事件
  socket.on('connect_error', (err) => {
    console.error('[WebSocket] 连接错误:', err.message);
    error.value = `连接失败: ${err.message}`;
    isConnected.value = false;
  });

  // 监听重连尝试事件
  socket.on('reconnect_attempt', (attemptNumber) => {
    if (socket) {
      socket.auth = buildSocketAuth();
    }
    console.log(`[WebSocket] 尝试重连 (第 ${attemptNumber} 次)`);
  });

  // 监听重连成功事件
  socket.on('reconnect', (attemptNumber) => {
    console.log(`[WebSocket] 重连成功 (尝试了 ${attemptNumber} 次)`);
    isConnected.value = true;
    error.value = null;
  });

  // 仅初始化一次数据推送处理器
  if (!isInitialized) {
    setupDataPushHandler();
    setupAlarmHandlers();
    isInitialized = true;
  }

  return socket;
}

/**
 * Vue Composable: 使用WebSocket
 */
export function useWebSocket() {
  const socketInstance = initSocket();

  /**
   * 订阅标签列表
   * @param tags 要订阅的标签数组
   */
  function subscribe(tags: string[]): void {
    if (!socketInstance) {
      console.error('[WebSocket] Socket未初始化，无法订阅');
      return;
    }

    // 记录当前订阅，用于重连后自动恢复
    currentTags = normalizeTags(tags);
    emitSubscription(currentTags);
  }

  function setPersistentSubscriptions(tags: string[]): void {
    persistentTags = Array.from(new Set(normalizeTags(tags)));
    emitSubscription(currentTags);
  }

  /**
   * 监听数据推送事件
   * @param callback 接收到数据时的回调函数
   */
  function onDataPush(callback: (data: DataPushMessage) => void): void {
    if (!socketInstance) {
      console.error('[WebSocket] Socket未初始化，无法监听数据推送');
      return;
    }

    if (externalDataPushListeners.has(callback)) {
      return;
    }

    externalDataPushListeners.add(callback);
    socketInstance.on('data:push', callback);
  }

  /**
   * 移除数据推送监听器
   * @param callback 要移除的回调函数
   */
  function offDataPush(callback?: (data: DataPushMessage) => void): void {
    if (!socketInstance) {
      return;
    }

    if (callback) {
      externalDataPushListeners.delete(callback);
      socketInstance.off('data:push', callback);
    } else {
      for (const listener of externalDataPushListeners) {
        socketInstance.off('data:push', listener);
      }
      externalDataPushListeners.clear();
    }
  }

  /**
   * 发送操作命令到后端（通过WebSocket转发至Redis）
   * @param cmdName 命令名称
   * @param cmdPara 命令参数对象
   * 调用方式：
   * // 有参数
   * sendUserCommand('command1', { feed_num: 10 });
   * // 无参数
   * sendUserCommand('command2');
   */
  function sendUserCommand(cmdName: string, cmdPara?: UserCommandPayload): void {
    if (!socketInstance) {
      console.error('[WebSocket] Socket未初始化，无法发送命令');
      return;
    }

    const message: CmdPushMessage = { cmd_name: cmdName };
    if (cmdPara !== undefined) {
      message.cmd_para = cmdPara;
    }
    socketInstance.emit('cmd:push', message);
    console.log('[WebSocket] 已发送操作命令:', message);
  }

  function refreshAuth(): void {
    if (!socketInstance) {
      return;
    }

    socketInstance.auth = buildSocketAuth();

    if (socketInstance.connected) {
      socketInstance.disconnect().connect();
      return;
    }

    socketInstance.connect();
  }

  return {
    isConnected,
    error,
    subscribe,
    setPersistentSubscriptions,
    sendUserCommand,
    refreshAuth,
    onDataPush,
    offDataPush,
  };
}
