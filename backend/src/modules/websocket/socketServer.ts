/**
 * Socket.IO 服务器集成模块
 * 负责WebSocket连接管理和订阅事件处理
 */

import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { FastifyInstance } from 'fastify';
import type { SubscribeRequest } from '@gt4_web/shared';
import { SubscriptionManager } from './subscriptionManager.js';

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
    socket.on('subscribe', (data: SubscribeRequest) => {
      console.log(`[SocketServer] 收到订阅请求:`, data);

      if (Array.isArray(data.tags)) {
        subscriptionManager.updateSubscriptions(socket.id, data.tags);
      } else {
        console.error(`[SocketServer] 无效的订阅请求格式:`, data);
      }
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
