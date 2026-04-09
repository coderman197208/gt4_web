---
description: 'Use when editing Fastify routes, backend modules, websocket server logic, or mock data code in backend/src. Covers route typing, httpErrors usage, mock API response shape, and Socket.IO subscription handling.'
name: 'Backend Guidelines'
applyTo: 'backend/src/**'
---

# Backend Guidelines

- Keep backend code in TypeScript ESM and import shared contracts from `@gt4_web/shared` instead of redefining request or response shapes locally.
- Fastify HTTP routes belong under `backend/src/modules/api/` and should use typed generics for `Params`, `Body`, and `Reply` when request or response contracts matter.
- Register API endpoints under the `/api` namespace and wire them from `backend/src/index.ts`. The current server registers `/api/health`, mock routes in non-production, plus standalone database routes such as `registerParameterSetRoutes()` and `registerOrderDataRoutes()`.
- For mock API routes, return raw data objects by default. Do not wrap every response in `ApiResponse<T>`; the login route is an existing exception that returns a `success` structure. Database-backed routes currently also return raw data objects or simple `{ message }` payloads.
- Parse and validate route params or request bodies at the edge of the handler before applying business logic. Follow the existing simple guard style used in `backend/src/modules/api/mockRoutes.ts` and `orderDataRoutes.ts`.
- `@fastify/sensible` is registered globally, so `fastify.httpErrors.*` is available for new handlers. Keep error responses consistent with the surrounding module; existing database routes still commonly use `reply.code(...).send({ message })`.
- WebSocket server setup should go through `initSocketServer()` in `backend/src/modules/websocket/socketServer.ts`. Reuse `SubscriptionManager` for connection tracking instead of creating a second subscription store.
- Socket subscription updates are full replacements, not incremental merges. An empty tag list from the frontend should be treated as clearing subscriptions.
- On each `subscribe` event, the server currently updates `SubscriptionManager` first, then reads the latest values for each tag from Redis and emits immediate `data:push` messages back to that socket.
- Operation commands come from the frontend `cmd:push` event and are forwarded to Redis channel `operation_cmd` through the data client.
- Redis integration is split between two singleton clients in `backend/src/modules/redis/redisClient.ts`: one data client for GET/SET/PUBLISH and one subscriber client for Pub/Sub. Do not issue ordinary Redis commands through the subscriber client.
- `backend/src/modules/redis/redisSubscriber.ts` currently listens on Redis channel `RealDataChanged`, fetches the changed tag value, checks subscribers through `SubscriptionManager`, and emits `data:push` only to interested sockets.
- Preserve existing log prefixes for observability: websocket server logs use `[SocketServer]`, and subscription manager logs use `[SubscriptionManager]`.
- Preserve Redis log prefixes as well: connection management uses `[RedisClient]`, and Redis subscription flow uses `[RedisSubscriber]`.
- Keep comments aligned with repo conventions: business logic comments in Chinese, structural or technical explanations in English.
- When adding new realtime tags or events, update shared types first, then backend websocket handling, and only then frontend consumers.
