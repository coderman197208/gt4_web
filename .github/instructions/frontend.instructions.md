---
description: 'Use when editing frontend Vue views, components, router, stores, services, or API modules in frontend/src. Covers HMI layout constraints, route registration, UI component reuse, API wrappers, and websocket usage.'
name: 'Frontend Guidelines'
applyTo: 'frontend/src/**'
---

# Frontend Guidelines

- Use Vue 3 with `<script setup lang=\"ts\">` and Composition API. Prefer `ref<T>()` for local state and `computed()` for derived state.
- Keep page components in `frontend/src/views/` with the `*View.vue` suffix. New app screens must be added as child routes under `HomePage` in `frontend/src/router/index.ts`.
- Preserve the HMI layout model: fixed fullscreen, no page scroll, and predictable panel positioning. Prefer virtual-coordinate or SVG `viewBox` thinking for monitor-style screens instead of responsive document flow.
- Reuse components from `frontend/src/components/ui/` before building new primitives. Use the existing alias imports such as `@/components/ui/button` and `@/lib/utils`.
- Frontend API modules should stay as thin wrappers around `request.get/post/put/patch/delete` from `frontend/src/api/client.ts`. Import shared types from `@gt4_web/shared` and re-export new API functions from `frontend/src/api/index.ts`.
- Do not introduce frontend-only copies of shared domain types. Add or adjust shared interfaces in `packages/shared/src/types.ts` first.
- WebSocket work should go through `useWebSocket()` in `frontend/src/services/websocket.ts`. Subscribe with `subscribe(tags)` and clear subscriptions with an empty array instead of creating a parallel socket state model.
- Follow existing logging and comment conventions: business logic comments in Chinese, structural or technical explanations in English, and frontend websocket logs prefixed with `[WebSocket]`.
- Use `@` path aliases for frontend source imports instead of long relative paths.
- When adding a new HMI screen, use `frontend/src/views/MainMonitorView.vue`, `frontend/src/views/ContractEditingView.vue`, and `doc/mytasks/` as pattern references rather than inventing a new layout style.
