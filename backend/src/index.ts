import Fastify from 'fastify';
import cors from '@fastify/cors';
import type { HealthCheckResponse } from '@gt4_web/shared';
import { initSocketServer } from './modules/websocket/socketServer.js';
import { startMockDataGenerator } from './modules/websocket/mockDataGenerator.js';

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: process.env.FRONTEND_ORIGIN || true,
  credentials: true,
});

fastify.get<{ Reply: HealthCheckResponse }>('/api/health', async () => ({
  status: 'ok',
  message: 'Backend server is running',
  timestamp: new Date().toISOString(),
}));

const port = Number(process.env.PORT || 3000);
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
