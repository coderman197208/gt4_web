---
description: "Create a new HMI view wired to an existing frontend API module or service, following the repo's fixed-screen view workflow."
name: 'New HMI View'
argument-hint: 'Describe the screen name, route path, data source to use from existing API/service modules, and the operator workflow'
agent: 'agent'
---

Implement a new HMI view that uses existing frontend API modules, stores, or services.

Use the user input after this prompt as the feature brief. The input should ideally include:

- View name
- Route path and route name
- Which existing API module, service, or store should provide the data
- Main operator tasks or screen sections
- Whether the screen is read-only, interactive, or realtime

If key details are missing, ask only for the minimum information needed to build the view correctly.

## Required workflow

1. Inspect existing patterns before editing.
   Use these files as the main references:
   - [frontend/src/views/HomePage.vue](../../frontend/src/views/HomePage.vue)
   - [frontend/src/router/index.ts](../../frontend/src/router/index.ts)
   - [frontend/src/views/MainMonitorView.vue](../../frontend/src/views/MainMonitorView.vue)
   - [frontend/src/views/HealthCheckView.vue](../../frontend/src/views/HealthCheckView.vue)
   - [frontend/src/views/ApiDemoView.vue](../../frontend/src/views/ApiDemoView.vue)

2. Reuse existing data access layers.
   Prefer consuming existing modules from [frontend/src/api](../../frontend/src/api), [frontend/src/services](../../frontend/src/services), or [frontend/src/stores](../../frontend/src/stores) instead of introducing a new transport layer inside the view.

3. Create the screen in the views folder.
   Add the new file in [frontend/src/views](../../frontend/src/views) using the `*View.vue` naming convention and `<script setup lang="ts">`.
   Keep the layout aligned with the repo's HMI constraints:
   - fixed fullscreen feel
   - no page-level scrolling
   - stable grid, panel, or virtual-coordinate layout
   - reuse existing UI primitives from [frontend/src/components/ui](../../frontend/src/components/ui)

4. Wire the route.
   Register the new screen as a child route of `HomePage` in [frontend/src/router/index.ts](../../frontend/src/router/index.ts) unless the feature explicitly belongs outside the main shell.

5. Connect the data flow without breaking boundaries.
   - Views may call existing API functions or services directly when the pattern already exists in the repo.
   - If shared cross-view state is needed, reuse or extend an existing Pinia store instead of duplicating state in multiple places.
   - If the request requires new backend contracts, stop and switch to the shared-resource workflow first instead of inventing frontend-only data shapes.

6. Validate the relevant scope.
   Run the smallest useful verification commands for the touched frontend code, such as frontend typecheck, lint, or the repo-level command if that is the narrowest practical option.

## Output expectations

- Make the code changes directly instead of only describing them.
- Keep the visual and structural language consistent with existing HMI screens.
- Summarize the new route, the data source that was wired in, and any assumptions made.
- Report which validation commands were run and whether they passed.

## Guardrails

- Do not add a new backend route or shared type if the request says to use an existing API or service.
- Do not register the route outside the `HomePage` child routes unless there is a clear reason.
- Do not build a generic scrolling dashboard layout that ignores the repo's HMI screen constraints.
- Do not duplicate logic that already belongs in [frontend/src/api](../../frontend/src/api), [frontend/src/services](../../frontend/src/services), or [frontend/src/stores](../../frontend/src/stores).
