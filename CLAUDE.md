# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GT4 Web is a **full-stack TypeScript monorepo** for an industrial HMI (Human Machine Interface) — a fixed-fullscreen monitoring system that displays real-time sensor data. Uses pnpm workspaces with three packages: `frontend`, `backend`, `packages/shared`.

> For deeper reference, see `AGENTS.md` (concise guide) and `WORKSPACE_GUIDELINES.md` (comprehensive guide with full examples).

## Commands

```bash
# Install
pnpm install

# Development (frontend :5173 + backend :5001 concurrently)
npm run dev

# Build all packages (shared → backend → frontend)
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

backend/src/
  index.ts      # Fastify setup, CORS, route/WebSocket registration
  modules/api/  # HTTP routes (mockRoutes.ts) + mock data
  modules/websocket/ # Socket.IO server, subscriptionManager, mockDataGenerator

packages/shared/src/
  types.ts      # All shared TypeScript interfaces (ApiResponse<T>, Tag1/2/3Data, etc.)
```

### Communication Patterns

**HTTP API**: Frontend axios (`/api` proxied by Vite to `:5001`) → Fastify routes → `ApiResponse<T>` response

**WebSocket**: `useWebSocket().subscribe(['tag1','tag2','tag3'])` → backend `subscriptionManager` → `socket.emit('data:push', { tag, value })` → Pinia store update

**Shared types**: Both frontend and backend import from `@gt4_web/shared` — always define new types there first.

### HMI Layout Constraint

All pages use **fixed fullscreen layout with no scroll**. SVG panels use `viewBox="0 0 1920 1080"` virtual coordinates with `preserveAspectRatio`. Reference screenshots in `view_sample/`; task specs in `doc/mytasks/`.

## Key Conventions

**Language**: Business logic comments in Chinese; technical/structural comments in English.

**Naming**:

- Components: `PascalCase`; pages: `*View.vue`
- API functions: `[verb][Resource]()` e.g. `getUsers()`, `createPost()`
- Pinia stores: `use[Feature]Store()` (composition API style)
- Services: expose as `use[Service]()` composable

**Vue 3**: Always use `<script setup lang="ts">` + Composition API. `ref<T>()` for state, `computed()` for derived values.

**UI components**: Use existing components from `frontend/src/components/ui/`. Install missing ones (shadcn-vue CLI) before building new ones. Use `cn()` for class merging, `lucide-vue-next` for icons.

**Adding a new API resource**:

1. Define types in `packages/shared/src/types.ts`
2. Create `frontend/src/api/[resource].ts`
3. Export from `frontend/src/api/index.ts`
4. Add route in `backend/src/modules/api/mockRoutes.ts`

**Adding a new page**:

1. Create `frontend/src/views/[FeatureName]View.vue`
2. Add as child route of `HomePage` in `frontend/src/router/index.ts`

## Key Files

| Purpose                           | File                                            |
| --------------------------------- | ----------------------------------------------- |
| Shared types                      | `packages/shared/src/types.ts`                  |
| API client (axios + interceptors) | `frontend/src/api/client.ts`                    |
| Router                            | `frontend/src/router/index.ts`                  |
| Realtime data store               | `frontend/src/stores/realtimeData.ts`           |
| WebSocket composable              | `frontend/src/services/websocket.ts`            |
| Backend entry                     | `backend/src/index.ts`                          |
| HTTP routes                       | `backend/src/modules/api/mockRoutes.ts`         |
| WebSocket server                  | `backend/src/modules/websocket/socketServer.ts` |
| UI component guide                | `doc/ui-components-guide.md`                    |
