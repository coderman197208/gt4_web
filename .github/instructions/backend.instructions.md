---
description: 'Use when editing Fastify routes, backend modules, websocket server logic, or mock data code in backend/src. Covers route typing, httpErrors usage, mock API response shape, and Socket.IO subscription handling.'
name: 'Backend Guidelines'
applyTo: 'backend/src/**'
---

# Backend Guidelines

- Keep backend code in TypeScript ESM and import shared contracts from `@gt4_web/shared` instead of redefining request or response shapes locally.
- Fastify HTTP routes belong under `backend/src/modules/api/` and should use typed generics for `Params`, `Body`, and `Reply` when request or response contracts matter.
- Register API endpoints under the `/api` namespace and follow the existing `registerMockRoutes(fastify)` module pattern instead of scattering routes across unrelated files.
- For mock API routes, return raw data objects by default. Do not wrap every response in `ApiResponse<T>`; the login route is an existing exception that returns a `success` structure.
- Use `fastify.httpErrors.*` for request validation and lookup failures rather than hand-rolled error payloads. Ensure `@fastify/sensible` remains the source of these helpers.
- Parse and validate route params or request bodies at the edge of the handler before applying business logic. Follow the existing simple guard style used in `backend/src/modules/api/mockRoutes.ts`.
- WebSocket server setup should go through `initSocketServer()` in `backend/src/modules/websocket/socketServer.ts`. Reuse `SubscriptionManager` for connection tracking instead of creating a second subscription store.
- Socket subscription updates are full replacements, not incremental merges. An empty tag list from the frontend should be treated as clearing subscriptions.
- Preserve existing log prefixes for observability: websocket server logs use `[SocketServer]`, and subscription manager logs use `[SubscriptionManager]`.
- Keep comments aligned with repo conventions: business logic comments in Chinese, structural or technical explanations in English.
- When adding new realtime tags or events, update shared types first, then backend websocket handling, and only then frontend consumers.
