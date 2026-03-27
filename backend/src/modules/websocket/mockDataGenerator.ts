/**
 * 模拟数据生成器
 * 每秒生成并推送tag1、tag2、tag3的模拟数据
 */

import type { Tag1Data, Tag2Data, Tag3Data, DataPushMessage } from '@gt4_web/shared';
import { getSocketServer, getSubscriptionManager } from './socketServer.js';

// 初始数据
let tag1Data: Tag1Data = {
  ph: '123456',
  lh: '12345678',
  czh: '3456',
  tlxh: 1,
  zzwj: 139.7,
  zzbh: 5,
};

let tag2Data: Tag2Data = 10;
let tag3Data: Tag3Data = [1, 2, 3, 4, 5, 6];

let timerHandle: NodeJS.Timeout | null = null;

/**
 * 更新并推送tag1数据
 */
function updateAndPushTag1() {
  // 递增 tlxh
  tag1Data.tlxh += 1;

  const subscribers = getSubscriptionManager().getSubscribers('tag1');
  if (subscribers.length > 0) {
    const message: DataPushMessage = {
      tag: 'tag1',
      value: JSON.stringify(tag1Data),
    };

    const io = getSocketServer();
    subscribers.forEach((socketId) => {
      io.to(socketId).emit('data:push', message);
    });

    // console.log(`[MockDataGenerator] 推送 tag1 给 ${subscribers.length} 个订阅者:`, tag1Data);
  }
}

/**
 * 更新并推送tag2数据
 */
function updateAndPushTag2() {
  // 递增数值
  tag2Data += 1;

  const subscribers = getSubscriptionManager().getSubscribers('tag2');
  if (subscribers.length > 0) {
    const message: DataPushMessage = {
      tag: 'tag2',
      value: JSON.stringify(tag2Data),
    };

    const io = getSocketServer();
    subscribers.forEach((socketId) => {
      io.to(socketId).emit('data:push', message);
    });

    // console.log(`[MockDataGenerator] 推送 tag2 给 ${subscribers.length} 个订阅者:`, tag2Data);
  }
}

/**
 * 更新并推送tag3数据
 */
function updateAndPushTag3() {
  // 每项递增1
  tag3Data = tag3Data.map((v) => v + 1);

  const subscribers = getSubscriptionManager().getSubscribers('tag3');
  if (subscribers.length > 0) {
    const message: DataPushMessage = {
      tag: 'tag3',
      value: JSON.stringify(tag3Data),
    };

    const io = getSocketServer();
    subscribers.forEach((socketId) => {
      io.to(socketId).emit('data:push', message);
    });

    // console.log(`[MockDataGenerator] 推送 tag3 给 ${subscribers.length} 个订阅者:`, tag3Data);
  }
}

/**
 * 定时更新所有数据
 */
function tick() {
  // 仅在有活跃连接时更新和推送数据
  if (!getSubscriptionManager().hasActiveConnections()) {
    // console.log('[MockDataGenerator] 无活跃连接，跳过数据生成');
    return;
  }

  updateAndPushTag1();
  updateAndPushTag2();
  updateAndPushTag3();
}

/**
 * 启动模拟数据生成器
 */
export function startMockDataGenerator(): void {
  if (timerHandle) {
    console.warn('[MockDataGenerator] 数据生成器已在运行中');
    return;
  }

  console.log('[MockDataGenerator] 启动模拟数据生成器，每秒更新一次');
  timerHandle = setInterval(tick, 1000);
}

/**
 * 停止模拟数据生成器
 */
export function stopMockDataGenerator(): void {
  if (timerHandle) {
    clearInterval(timerHandle);
    timerHandle = null;
    console.log('[MockDataGenerator] 模拟数据生成器已停止');
  }
}
