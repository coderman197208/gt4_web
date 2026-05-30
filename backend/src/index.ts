import { buildBackendApp, startBackendApp } from './app.js';

const fastify = buildBackendApp();

console.log('process.env.DATABASE_URL=', process.env.DATABASE_URL);

startBackendApp(fastify).catch((error) => {
  fastify.log.error(error);
  process.exit(1);
});
