# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GT4 Web is a **full-stack TypeScript monorepo** for an industrial HMI (Human Machine Interface) — a fixed-fullscreen monitoring system that displays real-time sensor data. Uses pnpm workspaces with three packages: `frontend`, `backend`, `packages/shared`.

> For deeper reference, see `AGENTS.md` (AI agent conventions with code examples) and `WORKSPACE_GUIDELINES.md` (comprehensive reference with full examples and environment details). **CLAUDE.md is the single source of truth for high-level rules**; the other two files elaborate but should not contradict it.

## Commands

```bash
# Install
pnpm install

# Development (frontend :5173 + backend :5001 concurrently)
npm run dev

# Build all packages (shared ; backend ; frontend — uses `;` so each runs regardless of prior exit code)
npm run build

# Type check all packages
npm run typecheck

# Lint all (ESLint 9.x)
npm run lint

# Format all files (Prettier)
npm run format

# Individual workspace
npm run dev --workspace frontend
npm run dev --workspace backend
```

Health check endpoint: `http://localhost:5001/api/health`

## Architecture

```
frontend/src/
  api/          # axios client + resource modules (client.ts, index.ts, users.ts, ...)
  components/ui/ # shadcn-vue components built on Reka UI + Tailwind
  views/        # Page components (*View.vue)
  stores/       # Pinia stores (realtimeData.ts)
  services/     # websocket.ts (Socket.IO client singleton)
  router/       # Vue Router (nested routes under HomePage)
  lib/          # Utility functions (cn() etc.)
  assets/       # Static resources and styles

backend/src/
  index.ts      # Fastify setup, CORS, route/WebSocket registration
  modules/api/  # HTTP routes (mockRoutes.ts, parameterSetRoutes.ts, orderDataRoutes.ts, ...)
  modules/database/ # Prisma client singleton (prismaClient.ts)
  modules/websocket/ # Socket.IO server, subscriptionManager, mockDataGenerator
  modules/redis/ # Redis data/subscriber clients + RealDataChanged bridge
backend/prisma/
  schema.prisma # Prisma schema (PostgreSQL introspection)

packages/shared/src/
  types.ts      # All shared TypeScript interfaces (ApiResponse<T>, Tag1/2/3Data, etc.)
```

### Communication Patterns

**HTTP API**: Frontend axios (`/api` proxied by Vite to `:5001`) → Fastify routes → direct data response (routes do not use `ApiResponse<T>` envelope). Mock data served from `mockRoutes.ts`; real database routes (Prisma + PostgreSQL) live in separate files such as `parameterSetRoutes.ts` and `orderDataRoutes.ts`.

**WebSocket**: `useWebSocket().subscribe(['tag1','tag2','tag3'])` → backend `subscriptionManager` (full replacement semantics) → server immediately reads current Redis values for subscribed tags and emits `data:push` → frontend singleton service updates Pinia store. Vite also proxies `/socket.io` to `:5001` with `ws: true`.

**Redis bridge**: backend uses two ioredis singletons: a data client for GET/SET/PUBLISH and a subscriber client for Pub/Sub. `redisSubscriber.ts` listens to `RealDataChanged`, fetches the new value, and pushes it only to subscribed sockets; command writes go to `operation_cmd`.

**Shared types**: Both frontend and backend import from `@gt4_web/shared` — always define new types there first.

### HMI Layout Constraint

All pages use **fixed fullscreen layout with no scroll**. `HomePage.vue` is the current app shell for in-app pages, and fixed-resolution HMI screens should use route `meta.hmiScale` with the current `1920 x 1080` baseline rather than ad hoc page-level scaling. SVG panels use `viewBox="0 0 1920 1080"` virtual coordinates with `preserveAspectRatio`. Reference screenshots in `view_sample/`; task specs in `doc/mytasks/`.

## Key Conventions

**Language**: Business logic comments in Chinese; technical/structural comments in English.

**Naming**:

- Components: `PascalCase`; pages: `*View.vue` (exception: `HomePage.vue` as layout container)
- API functions: `[verb][Resource]()` e.g. `getUsers()`, `createPost()`
- Pinia stores: `use[Feature]Store()` (composition API style)
- Services: expose as `use[Service]()` composable

**Vue 3**: Always use `<script setup lang="ts">` + Composition API. `ref<T>()` for state, `computed()` for derived values.

**Path alias**: Frontend uses `@` → `src/` (configured in both `tsconfig.json` and `vite.config.ts`). Import as `@/api`, `@/components/ui`, etc.

**UI components**: Use existing components from `frontend/src/components/ui/`. Install missing ones (shadcn-vue CLI) before building new ones. Use `cn()` for class merging, `lucide-vue-next` for icons.

**Adding a new API resource**:

1. Define types in `packages/shared/src/types.ts`
2. Create `frontend/src/api/[resource].ts`
3. Export from `frontend/src/api/index.ts`
4. Add route in `backend/src/modules/api/` — mock 数据加到 `mockRoutes.ts`；真实数据库路由创建独立文件（如 `parameterSetRoutes.ts`），使用 Prisma 访问 PostgreSQL

**Adding a new page**:

1. Create `frontend/src/views/[FeatureName]View.vue`
2. Add as child route of `HomePage` in `frontend/src/router/index.ts` (keep `LoginView` as the standalone top-level route)
3. If the page is a fixed-size HMI screen, declare route `meta.hmiScale`

## Key Files

| Purpose                           | File                                            |
| --------------------------------- | ----------------------------------------------- |
| Shared types                      | `packages/shared/src/types.ts`                  |
| API client (axios + interceptors) | `frontend/src/api/client.ts`                    |
| Router                            | `frontend/src/router/index.ts`                  |
| App shell                         | `frontend/src/views/HomePage.vue`               |
| Realtime data store               | `frontend/src/stores/realtimeData.ts`           |
| WebSocket composable              | `frontend/src/services/websocket.ts`            |
| Backend entry                     | `backend/src/index.ts`                          |
| HTTP routes                       | `backend/src/modules/api/mockRoutes.ts`         |
| WebSocket server                  | `backend/src/modules/websocket/socketServer.ts` |
| Redis bridge                      | `backend/src/modules/redis/redisSubscriber.ts`  |
| Database client (Prisma)          | `backend/src/modules/database/prismaClient.ts`  |
| DB route example                  | `backend/src/modules/api/parameterSetRoutes.ts` |
| Order data route example          | `backend/src/modules/api/orderDataRoutes.ts`    |
| Prisma schema                     | `backend/prisma/schema.prisma`                  |
| UI component guide                | `doc/ui-components-guide.md`                    |
