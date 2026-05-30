/**
 * Redis 订阅模块
 * 订阅 'RealDataChanged' 主题，收到消息后读取 tag 值并通过 WebSocket 推送给前端
 */

import type { DataPushMessage } from '@gt4_web/shared';
import { handleAlarmChanged } from '../alarm/alarmService.js';
import { getRedisDataClient, getRedisSubClient } from './redisClient.js';
import { normalizeRealtimeTagValue } from './realtimeValueNormalizer';
import {
  broadcastAlarmMutation,
  getSocketServer,
  getSubscriptionManager,
} from '../websocket/socketServer.js';

const REALTIME_CHANGED_CHANNEL = 'RealDataChanged';
const ALARM_CHANGED_CHANNEL = 'AlarmChanged';

/**
 * 启动 Redis 订阅，监听 C++ 程序写入的实时数据变更
 */
export function startRedisSubscriber(): void {
  const redisSubClient = getRedisSubClient();
  const redisDataClient = getRedisDataClient();

  // 订阅 RealDataChanged 主题
  redisSubClient.subscribe(REALTIME_CHANGED_CHANNEL, (err, count) => {
    if (err) {
      console.error(`[RedisSubscriber] 订阅 ${REALTIME_CHANGED_CHANNEL} 失败:`, err.message);
      return;
    }
    console.log(
      `[RedisSubscriber] 已订阅 ${REALTIME_CHANGED_CHANNEL} 主题（当前订阅数: ${count}）`,
    );
  });

  redisSubClient.subscribe(ALARM_CHANGED_CHANNEL, (err, count) => {
    if (err) {
      console.error(`[RedisSubscriber] 订阅 ${ALARM_CHANGED_CHANNEL} 失败:`, err.message);
      return;
    }
    console.log(`[RedisSubscriber] 已订阅 ${ALARM_CHANGED_CHANNEL} 主题（当前订阅数: ${count}）`);
  });

  // 监听消息
  redisSubClient.on('message', async (channel, payloadKey) => {
    if (channel === ALARM_CHANGED_CHANNEL) {
      const change = await handleAlarmChanged(payloadKey);
      if (change) {
        await broadcastAlarmMutation(change);
      }
      return;
    }

    if (channel !== REALTIME_CHANGED_CHANNEL) return;

    // 检查是否有前端订阅了这个 tag
    const subscribers = getSubscriptionManager().getSubscribers(payloadKey);
    if (subscribers.length === 0) return;

    try {
      // 从 Redis 读取 tag 的值
      const tagValue = await redisDataClient.get(payloadKey);
      if (tagValue === null) {
        console.warn(`[RedisSubscriber] tag "${payloadKey}" 在 Redis 中不存在`);
        return;
      }

      // 构造推送消息，与 mockDataGenerator 格式一致
      const normalizedValue = normalizeRealtimeTagValue(payloadKey, tagValue);

      const message: DataPushMessage = {
        tag: payloadKey,
        value: normalizedValue,
      };

      // 推送给所有订阅了此 tag 的前端
      const io = getSocketServer();
      subscribers.forEach((socketId) => {
        io.to(socketId).emit('data:push', message);
      });

      console.log(
        `[RedisSubscriber] 推送 ${payloadKey} 给 ${subscribers.length} 个订阅者，值: ${normalizedValue}`,
      );
    } catch (err) {
      console.error(`[RedisSubscriber] 处理 tag "${payloadKey}" 时出错:`, err);
    }
  });

  console.log('[RedisSubscriber] Redis 订阅器已启动');
}
