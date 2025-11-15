import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/health', async () => ({ status: 'ok' }));

const port = Number(process.env.PORT || 3000);
const host = '0.0.0.0';

fastify
  .listen({ port, host })
  .then((addr) => {
    fastify.log.info(`server listening at ${addr}`);
  })
  .catch((err) => {
    fastify.log.error(err);
    process.exit(1);
  });
