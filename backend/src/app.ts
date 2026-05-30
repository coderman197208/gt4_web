import Fastify from 'fastify';
import cors from '@fastify/cors';
import httpErrors from '@fastify/sensible';
import type { FastifyInstance } from 'fastify';
import type { HealthCheckResponse } from '@gt4_web/shared';
import './loadEnv.js';
import { initSocketServer } from './modules/websocket/socketServer.js';
import { startMockDataGenerator } from './modules/websocket/mockDataGenerator.js';
import { startRedisSubscriber } from './modules/redis/redisSubscriber.js';
import { registerAuthRoutes } from './modules/api/authRoutes.js';
import { registerAlarmAreaRoutes } from './modules/api/alarmAreaRoutes.js';
import { registerAlarmRoutes } from './modules/api/alarmRoutes.js';
import { registerMockRoutes } from './modules/api/mockRoutes.js';
import { registerParameterSetRoutes } from './modules/api/parameterSetRoutes.js';
import { registerOrderDataRoutes } from './modules/api/orderDataRoutes.js';
import { registerBundleDataRoutes } from './modules/api/bundleDataRoutes.js';

export interface StartBackendAppOptions {
  port?: number;
  host?: string;
  startMockDataGenerator?: boolean;
  startRedisSubscriber?: boolean;
}

export function buildBackendApp(): FastifyInstance {
  const fastify = Fastify({ logger: true });

  fastify.register(cors, {
    origin: process.env.FRONTEND_ORIGIN || true,
    credentials: true,
  });

  fastify.register(httpErrors);

  fastify.get<{ Reply: HealthCheckResponse }>('/api/health', async () => ({
    status: 'ok',
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
  }));

  fastify.register(registerAuthRoutes);
  fastify.register(registerAlarmAreaRoutes);
  fastify.register(registerAlarmRoutes);

  if (process.env.NODE_ENV !== 'production') {
    fastify.register(registerMockRoutes);
  }

  fastify.register(registerParameterSetRoutes);
  fastify.register(registerOrderDataRoutes);
  fastify.register(registerBundleDataRoutes);

  return fastify;
}

export async function startBackendApp(
  fastify: FastifyInstance,
  options: StartBackendAppOptions = {},
): Promise<string> {
  const port = options.port ?? Number(process.env.PORT || 5001);
  const host = options.host ?? '0.0.0.0';

  const address = await fastify.listen({ port, host });
  fastify.log.info(`server listening at ${address}`);

  initSocketServer(fastify);

  if (options.startMockDataGenerator ?? process.env.NODE_ENV !== 'production') {
    startMockDataGenerator();
  }

  if (options.startRedisSubscriber ?? true) {
    startRedisSubscriber();
  }

  return address;
}
