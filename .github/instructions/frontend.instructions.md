---
description: 'Use when editing frontend Vue views, components, router, stores, services, or API modules in frontend/src. Covers HMI layout constraints, route registration, UI component reuse, API wrappers, and websocket usage.'
name: 'Frontend Guidelines'
applyTo: 'frontend/src/**'
---

# Frontend Guidelines

- Use Vue 3 with `<script setup lang=\"ts\">` and Composition API. Prefer `ref<T>()` for local state and `computed()` for derived state.
- Keep page components in `frontend/src/views/` with the `*View.vue` suffix. New app screens must be added as child routes under `HomePage` in `frontend/src/router/index.ts`; `LoginView` remains a top-level standalone route.
- `HomePage` is the current app shell: it wraps child routes with `HmiViewport`, `AppHeader`, and `AppSidebar`. New screens should fit into this container instead of creating a second top-level layout.
- Preserve the HMI layout model: fixed fullscreen, no page scroll, and predictable panel positioning. Prefer virtual-coordinate or SVG `viewBox` thinking for monitor-style screens instead of responsive document flow.
- For fixed-resolution HMI pages, use route `meta.hmiScale` and let `HomePage` drive `HmiViewport` scaling. The current design baseline is `1920 x 1080`.
- Reuse components from `frontend/src/components/ui/` before building new primitives. Use the existing alias imports such as `@/components/ui/button` and `@/lib/utils`.
- Frontend API modules should stay as thin wrappers around `request.get/post/put/patch/delete` from `frontend/src/api/client.ts`. Import shared types from `@gt4_web/shared`, and keep `frontend/src/api/index.ts` as the single public barrel that re-exports both API functions and shared types.
- Do not introduce frontend-only copies of shared domain types. Add or adjust shared interfaces in `packages/shared/src/types.ts` first.
- WebSocket work should go through `useWebSocket()` in `frontend/src/services/websocket.ts`. Subscribe with `subscribe(tags)` and clear subscriptions with an empty array instead of creating a parallel socket state model.
- `useWebSocket()` is a global singleton service. It keeps the latest `currentTags`, restores them after reconnect, and routes incoming `data:push` messages into `useRealtimeDataStore()` through its internal handler.
- `frontend/src/stores/realtimeData.ts` is the canonical realtime store. It currently manages `tag1`, `tag2`, `tag3`, and `PlanInfo`; extend shared types and this store together when adding new realtime tags.
- Follow existing logging and comment conventions: business logic comments in Chinese, structural or technical explanations in English, and frontend websocket logs prefixed with `[WebSocket]`.
- Use `@` path aliases for frontend source imports instead of long relative paths.
- When adding a new HMI screen, use `frontend/src/views/MainMonitorView.vue`, `frontend/src/views/ContractEditingView.vue` as pattern references rather than inventing a new layout style.
