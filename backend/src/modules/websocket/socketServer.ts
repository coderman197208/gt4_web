/**
 * Socket.IO 服务器集成模块
 * 负责WebSocket连接管理和订阅事件处理
 */

import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { FastifyInstance } from 'fastify';
import type { SubscribeRequest, CmdPushMessage, DataPushMessage } from '@gt4_web/shared';
import { normalizeRealtimeTagValue } from '../redis/realtimeValueNormalizer';
import { SubscriptionManager } from './subscriptionManager.js';
import { getRedisDataClient } from '../redis/redisClient.js';

const OPERATION_CMD_CHANNEL = 'operation_cmd';

let io: SocketIOServer | null = null;
const subscriptionManager = new SubscriptionManager();

/**
 * 初始化Socket.IO服务器
 * @param fastify Fastify实例
 */
export function initSocketServer(fastify: FastifyInstance): SocketIOServer {
  // 获取Fastify的HTTP服务器
  const httpServer = fastify.server as HTTPServer;

  // 创建Socket.IO服务器
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN || true,
      credentials: true,
    },
  });

  // 监听连接事件
  io.on('connection', (socket) => {
    console.log(`[SocketServer] 新连接建立: ${socket.id}`);

    // 添加到订阅管理器
    subscriptionManager.addConnection(socket.id);

    // 监听订阅事件
    socket.on('subscribe', async (data: SubscribeRequest) => {
      console.log(`[SocketServer] 收到订阅请求:`, data);

      if (!Array.isArray(data.tags)) {
        console.error(`[SocketServer] 无效的订阅请求格式:`, data);
        return;
      }

      subscriptionManager.updateSubscriptions(socket.id, data.tags);

      // 立即从 Redis 读取每个 tag 的当前值并推送给该 socket，避免画面初始显示为空
      const redisDataClient = getRedisDataClient();
      for (const tag of data.tags) {
        try {
          const value = await redisDataClient.get(tag);
          if (value === null) continue;
          const normalizedValue = normalizeRealtimeTagValue(tag, value);
          socket.emit('data:push', { tag, value: normalizedValue } as DataPushMessage);
        } catch (err) {
          console.error(`[SocketServer] 初始推送 tag "${tag}" 失败:`, err);
        }
      }
      console.log(`[SocketServer] 初始数据推送完成，tags: [${data.tags.join(', ')}]`);
    });

    // 监听操作命令事件，转发到Redis
    socket.on('cmd:push', (data: CmdPushMessage) => {
      console.log(`[SocketServer] 收到操作命令:`, data);

      if (!data.cmd_name) {
        console.error(`[SocketServer] 无效的命令格式（缺少cmd_name）:`, data);
        return;
      }

      const payload = JSON.stringify({
        cmd_name: data.cmd_name,
        cmd_para: data.cmd_para ?? {},
      });

      getRedisDataClient()
        .publish(OPERATION_CMD_CHANNEL, payload)
        .then((receivers) => {
          console.log(
            `[SocketServer] 命令已发布到 ${OPERATION_CMD_CHANNEL}，接收者数: ${receivers}`,
          );
        })
        .catch((err) => {
          console.error(`[SocketServer] 发布命令到 Redis 失败:`, err);
        });
    });

    // 监听断开连接事件
    socket.on('disconnect', (reason) => {
      console.log(`[SocketServer] 连接断开: ${socket.id}, 原因: ${reason}`);
      subscriptionManager.removeConnection(socket.id);
    });

    // 监听错误事件
    socket.on('error', (error) => {
      console.error(`[SocketServer] Socket错误: ${socket.id}`, error);
    });
  });

  console.log('[SocketServer] Socket.IO服务器已初始化');
  return io;
}

/**
 * 获取Socket.IO服务器实例
 */
export function getSocketServer(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO服务器尚未初始化，请先调用 initSocketServer()');
  }
  return io;
}

/**
 * 获取订阅管理器实例
 */
export function getSubscriptionManager(): SubscriptionManager {
  return subscriptionManager;
}
