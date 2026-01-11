import Fastify from 'fastify';
import cors from '@fastify/cors';
import type { HealthCheckResponse } from '@gt4_web/shared';

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
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
