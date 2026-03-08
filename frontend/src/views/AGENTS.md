# Views Guidelines

These instructions apply to screen-level Vue views under this folder and add to the root workspace guidance.

## Layout

- Treat each view as a fixed-screen HMI surface, not a scrolling document page.
- Keep `h-full`, `w-full`, and `overflow-hidden` behavior aligned with the existing layout container in `HomePage.vue` unless the screen explicitly needs an internal scroll region.
- Prefer stable panel grids, absolute overlays, or SVG/viewBox-style virtual layout thinking for monitor pages. Do not introduce generic responsive marketing-style layouts.
- Use `view_sample/` and `doc/mytasks/` as the primary reference for page structure and operator workflows.

## Composition

- Views stay in `frontend/src/views/` and keep the `*View.vue` suffix. `HomePage.vue` remains the layout shell and is the exception.
- New screens should plug into the child routes under `HomePage` in `frontend/src/router/index.ts` rather than reworking the app shell.
- Prefer existing UI primitives from `frontend/src/components/ui/` and shared app components before creating new view-local widgets.
- Keep state local to the view unless the data is shared across routes or comes from an existing Pinia store.

## Conventions

- Use `<script setup lang="ts">` and Composition API.
- Business-facing labels and logic comments can stay in Chinese. Structural notes should stay in English.
- Match the visual density and control layout already used in files such as `MainMonitorView.vue` and `ContractEditingView.vue` instead of inventing a new screen language per page.
