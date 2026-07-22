
# gt4_web Agent Notes

## Scope

- This file applies to the `gt4_web` monorepo.
- Use `.github/instructions/frontend.instructions.md` for `frontend/src/**`, `.github/instructions/backend.instructions.md` for `backend/src/**`, and `.github/instructions/shared.instructions.md` for `packages/shared/src/**`.
- Keep this file high level. Link to repo docs and example files instead of restating detailed implementation rules here.

## Build And Validation

- Require Node 20+ and `pnpm`. Install dependencies from the repo root with `pnpm install`.
- Common workspace commands from the repo root are:

	```bash
	npm run dev
	npm run build
	npm run typecheck
	npm run lint
	```

- Prefer the narrowest useful validation after edits:
	- `npm run typecheck --workspace frontend`
	- `npm run typecheck --workspace backend`
	- `npm run typecheck --workspace @gt4_web/shared`
- Use repo-level validation only when a change crosses package boundaries.

## Project Map

- Monorepo structure:
	- `frontend`: Vue 3 HMI application
	- `backend`: Fastify + Socket.IO server
	- `packages/shared`: shared TypeScript contracts
- Shared contracts are split by concern under `packages/shared/src/` and re-exported from `packages/shared/src/index.ts`.
	- `db_types.ts`: HTTP and database-facing contracts
	- `redis_types.ts`: WebSocket, Redis, and command payload contracts
	- `alarm_types.ts`: alarm module contracts
- Frontend HTTP calls go through axios `/api` requests and Vite proxying. WebSocket traffic goes through `/socket.io`.
- `frontend/src/views/HomePage.vue` is the app shell. Except for `LoginView`, business screens are child routes mounted beneath it.
- Backend HTTP routes live under `backend/src/modules/api/`; WebSocket coordination lives under `backend/src/modules/websocket/`; Redis bridge code lives under `backend/src/modules/redis/`.

## Working Guidance

- Preserve the HMI layout model: fixed fullscreen, no page scroll, and route-driven `meta.hmiScale` for fixed-resolution screens.
- When a contract is shared by frontend and backend, update the relevant file under `packages/shared/src/` first and keep `packages/shared/src/index.ts` exporting it.
- Keep frontend API modules thin and centered on `frontend/src/api/client.ts`. Keep backend route behavior consistent with existing raw-object responses.
- WebSocket subscriptions are full replacements. An empty tag list clears subscriptions. Keep that behavior aligned across `frontend/src/services/websocket.ts`, `backend/src/modules/websocket/socketServer.ts`, and `backend/src/modules/redis/redisSubscriber.ts`.
- Redis uses two ioredis singletons: data commands on the data client, Pub/Sub only on the subscriber client.
- Follow the repo comment convention: business logic comments in Chinese, structural or technical comments in English.

## High-Value References

- Product and task context: `doc/prd.md`, `doc/mytasks/`
- UI component guidance: `doc/ui-components-guide.md`, `doc/component-userguide.md`
- Alarm rollout details: `doc/alarm-module-rollout.md`
- Frontend HMI pattern references: `frontend/src/views/MainMonitorView.vue`, `frontend/src/views/ContractEditingView.vue`
- WebSocket pattern references: `frontend/src/services/websocket.ts`, `frontend/src/stores/realtimeData.ts`, `backend/src/modules/websocket/socketServer.ts`
- Backend route pattern references: `backend/src/modules/api/mockRoutes.ts`, `backend/src/modules/api/orderDataRoutes.ts`, `backend/src/modules/api/parameterSetRoutes.ts`
