import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: process.env.FRONTEND_ORIGIN || true,
  credentials: true,
});

fastify.get('/api/health', async () => ({ status: 'ok' }));

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
