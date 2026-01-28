/**
 * WebSocket客户端服务（Vue Composable）
 * 提供全局单例WebSocket连接，支持订阅和数据推送
 */

import { ref, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';
import type { SubscribeRequest, DataPushMessage } from '@gt4_web/shared';
import { useRealtimeDataStore } from '@/stores/realtimeData';

// 全局单例Socket实例
let socket: Socket | null = null;
let isInitialized = false;

// 响应式状态
const isConnected = ref(false);
const error = ref<string | null>(null);

/**
 * 初始化WebSocket连接（仅在首次调用时创建）
 */
function initSocket() {
  if (socket) {
    return socket;
  }

  const serverUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5001';

  socket = io(serverUrl, {
    reconnection: true, // 启用自动重连
    reconnectionAttempts: Infinity, // 无限次重连尝试
    reconnectionDelay: 1000, // 初始重连延迟1秒
    reconnectionDelayMax: 5000, // 最大重连延迟5秒
    timeout: 20000, // 连接超时20秒
  });

  // 监听连接成功事件
  socket.on('connect', () => {
    console.log('[WebSocket] 连接已建立:', socket?.id);
    isConnected.value = true;
    error.value = null;
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
    isInitialized = true;
  }

  return socket;
}

/**
 * 设置数据推送处理器，自动更新store
 */
function setupDataPushHandler() {
  if (!socket) return;

  socket.on('data:push', (message: DataPushMessage) => {
    try {
      console.log('[WebSocket] 收到数据推送:', message);

      // 解析JSON数据
      const parsedValue = JSON.parse(message.value);

      // 更新Pinia store
      const store = useRealtimeDataStore();
      store.updateData(message.tag, parsedValue);
    } catch (err) {
      console.error('[WebSocket] 解析推送数据失败:', err, message);
    }
  });
}

/**
 * Vue Composable: 使用WebSocket
 */
export function useWebSocket() {
  // 确保Socket已初始化
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

    const request: SubscribeRequest = { tags };
    socketInstance.emit('subscribe', request);
    console.log('[WebSocket] 已发送订阅请求:', tags);
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
      socketInstance.off('data:push', callback);
    } else {
      socketInstance.off('data:push');
    }
  }

  // 组件卸载时不断开连接（因为是全局单例，其他页面可能还在使用）
  // 如果需要在特定组件卸载时取消订阅，可以发送空订阅列表
  // onUnmounted(() => {
  //   subscribe([]);
  // });

  return {
    isConnected,
    error,
    subscribe,
    onDataPush,
    offDataPush,
  };
}
