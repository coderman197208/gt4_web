/**
 * Redis 订阅模块
 * 订阅 'RealDataChanged' 主题，收到消息后读取 tag 值并通过 WebSocket 推送给前端
 */

import type { DataPushMessage } from '@gt4_web/shared';
import { getRedisDataClient, getRedisSubClient } from './redisClient.js';
import { normalizeRealtimeTagValue } from './realtimeValueNormalizer';
import { getSocketServer, getSubscriptionManager } from '../websocket/socketServer.js';

/**
 * 启动 Redis 订阅，监听 C++ 程序写入的实时数据变更
 */
export function startRedisSubscriber(): void {
  const redisSubClient = getRedisSubClient();
  const redisDataClient = getRedisDataClient();

  // 订阅 RealDataChanged 主题
  redisSubClient.subscribe('RealDataChanged', (err, count) => {
    if (err) {
      console.error('[RedisSubscriber] 订阅 RealDataChanged 失败:', err.message);
      return;
    }
    console.log(`[RedisSubscriber] 已订阅 RealDataChanged 主题（当前订阅数: ${count}）`);
  });

  // 监听消息
  redisSubClient.on('message', async (channel, tagName) => {
    if (channel !== 'RealDataChanged') return;

    // 检查是否有前端订阅了这个 tag
    const subscribers = getSubscriptionManager().getSubscribers(tagName);
    if (subscribers.length === 0) return;

    try {
      // 从 Redis 读取 tag 的值
      const tagValue = await redisDataClient.get(tagName);
      if (tagValue === null) {
        console.warn(`[RedisSubscriber] tag "${tagName}" 在 Redis 中不存在`);
        return;
      }

      // 构造推送消息，与 mockDataGenerator 格式一致
      const normalizedValue = normalizeRealtimeTagValue(tagName, tagValue);

      const message: DataPushMessage = {
        tag: tagName,
        value: normalizedValue,
      };

      // 推送给所有订阅了此 tag 的前端
      const io = getSocketServer();
      subscribers.forEach((socketId) => {
        io.to(socketId).emit('data:push', message);
      });

      console.log(
        `[RedisSubscriber] 推送 ${tagName} 给 ${subscribers.length} 个订阅者，值: ${normalizedValue}`,
      );
    } catch (err) {
      console.error(`[RedisSubscriber] 处理 tag "${tagName}" 时出错:`, err);
    }
  });

  console.log('[RedisSubscriber] Redis 订阅器已启动');
}
