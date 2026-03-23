import Fastify from 'fastify';
import cors from '@fastify/cors';
import type { HealthCheckResponse } from '@gt4_web/shared';
import { initSocketServer } from './modules/websocket/socketServer.js';
import { startMockDataGenerator } from './modules/websocket/mockDataGenerator.js';
import { registerMockRoutes } from './modules/api/mockRoutes.js';
import { registerParameterSetRoutes } from './modules/api/parameterSetRoutes.js';

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: process.env.FRONTEND_ORIGIN || true,
  credentials: true,
});

// 注册 HTTP Errors 插件以便使用 httpErrors
import httpErrors from '@fastify/sensible';
fastify.register(httpErrors);

fastify.get<{ Reply: HealthCheckResponse }>('/api/health', async () => ({
  status: 'ok',
  message: 'Backend server is running',
  timestamp: new Date().toISOString(),
}));

// 在开发环境中注册 Mock API 路由
if (process.env.NODE_ENV !== 'production') {
  fastify.register(registerMockRoutes);
}

// 注册数据库 API 路由（生产参数等）
fastify.register(registerParameterSetRoutes);

const port = Number(process.env.PORT || 5001);
const host = '0.0.0.0';

const start = async () => {
  try {
    const address = await fastify.listen({ port, host });
    fastify.log.info(`server listening at ${address}`);

    // 初始化Socket.IO服务器
    initSocketServer(fastify);

    // 启动模拟数据生成器
    startMockDataGenerator();
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
