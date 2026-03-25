/**
 * Redis 连接管理模块
 * 提供数据读取客户端和 Pub/Sub 订阅客户端，支持断开后自动重连
 */

import Redis from 'ioredis';

// Redis 连接配置
const REDIS_CONFIG = {
  host: '140.32.1.192',
  port: 6379,
  password: 'ggl2e=mc2',
  // 自动重连策略：每次重连间隔递增，最大5秒
  retryStrategy(times: number) {
    const delay = Math.min(times * 500, 5000);
    console.log(`[RedisClient] 第 ${times} 次重连，${delay}ms 后重试...`);
    return delay;
  },
};

/** 用于普通数据读取（GET）的客户端 */
let dataClient: Redis | null = null;

/** 用于 Pub/Sub 订阅的客户端（订阅模式下不能执行普通命令） */
let subClient: Redis | null = null;

function attachLogger(client: Redis, label: string): void {
  client.on('connect', () => {
    console.log(`[RedisClient] ${label} 已连接到 Redis`);
  });
  client.on('ready', () => {
    console.log(`[RedisClient] ${label} 就绪`);
  });
  client.on('error', (err) => {
    console.error(`[RedisClient] ${label} 错误:`, err.message);
  });
  client.on('close', () => {
    console.log(`[RedisClient] ${label} 连接关闭`);
  });
  client.on('reconnecting', () => {
    console.log(`[RedisClient] ${label} 正在重连...`);
  });
}

/**
 * 获取数据读取客户端（单例）
 */
export function getDataClient(): Redis {
  if (!dataClient) {
    dataClient = new Redis(REDIS_CONFIG);
    attachLogger(dataClient, 'DataClient');
  }
  return dataClient;
}

/**
 * 获取 Pub/Sub 订阅客户端（单例）
 */
export function getSubClient(): Redis {
  if (!subClient) {
    subClient = new Redis(REDIS_CONFIG);
    attachLogger(subClient, 'SubClient');
  }
  return subClient;
}

/**
 * 关闭所有 Redis 连接
 */
export async function closeRedisClients(): Promise<void> {
  if (dataClient) {
    await dataClient.quit();
    dataClient = null;
  }
  if (subClient) {
    await subClient.quit();
    subClient = null;
  }
  console.log('[RedisClient] 所有 Redis 连接已关闭');
}
