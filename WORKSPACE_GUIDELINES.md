# GT4 Web Project - Workspace Guidelines for AI Agents

**Document Date:** 2026-02-10  
**Project Structure:** Monorepo with pnpm workspaces  
**Primary Tech Stack:** TypeScript, Vue 3, Fastify, Socket.IO, Tailwind CSS

---

## 1. Code Style & Patterns

### TypeScript Configuration

All packages use strict TypeScript with ES2020 target as standard:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true
  }
}
```

**Key compiler settings:**

- **Frontend** ([frontend/tsconfig.json](frontend/tsconfig.json)): `jsx: "preserve"`, `isolatedModules: true`, `noEmit: true`
  - Path aliases: `@/*` → `src/*`, `@gt4_web/shared` → `../packages/shared/src`
- **Backend** ([backend/tsconfig.json](backend/tsconfig.json)): `module: "ES2020"`, `esModuleInterop: true`
- **Shared** ([packages/shared/tsconfig.json](packages/shared/tsconfig.json)): Minimal config, declaration generation enabled

### Code Formatting & Linting

**Prettier Configuration** ([.prettierrc](.prettierrc)):

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "all"
}
```

**Global format command:**

```bash
npm run format  # prettier -w "**/*.{js,ts,tsx,vue,json,md,yml,yaml,css,scss}"
```

**ESLint setup:**

- No `.eslintrc` files found; projects use `@typescript-eslint/eslint-plugin` and `eslint-plugin-vue`
- Each package runs: `npm run lint` (backend has ESLint, frontend has ESLint with Vue support)
- Ignored patterns: node_modules, dist, build ([.eslintignore](.eslintignore))

### Code Patterns Observed

#### TypeScript Files

- **Comments use Chinese except for JSDoc** ([packages/shared/src/types.ts](packages/shared/src/types.ts)):

  ```typescript
  /**
   * 前后端共享的类型定义
   */
  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
  }
  ```

- **ES Modules throughout:** `"type": "module"` in all package.json files; uses `.js` file extensions in imports
- **Function documentation:** JSDoc comments above exported functions with `@param` and `@returns` tags ([frontend/src/api/users.ts](frontend/src/api/users.ts))

#### Vue 3 Files

- **Single File Components with `<script setup>` syntax** ([frontend/src/App.vue](frontend/src/App.vue)):

  ```vue
  <template>
    <!-- HTML structure -->
  </template>

  <script setup lang="ts">
  // Composition API with TypeScript
  </script>
  ```

- **Component naming:** PascalCase for components (e.g., `AppHeader.vue`, `HealthCheckView.vue`)
- **UI components use Reka UI primitives** ([frontend/src/components/ui/button/Button.vue](frontend/src/components/ui/button/Button.vue)):
  ```vue
  <Primitive :as="as" :as-child="asChild" :class="cn(...)">
    <slot />
  </Primitive>
  ```

---

## 2. Architecture & Structure

### Monorepo Setup

**Workspace Configuration** ([pnpm-workspace.yaml](pnpm-workspace.yaml)):

```yaml
packages:
  - backend
  - frontend
  - packages/*
```

**Root package.json** ([package.json](package.json)):

- Concurrent dev script: `npm run dev` runs backend + frontend simultaneously using `concurrently`
- Shared build/typecheck/lint scripts that run across all workspaces
- Requires Node >= 20.0.0 and pnpm >= 8.0.0

### Package Dependencies

**Shared Package** ([packages/shared/package.json](packages/shared/package.json)):

- Zero runtime dependencies (types only)
- Exports from `src/index.ts` directly as main entry
- Used by both frontend and backend via `@gt4_web/shared`

**Frontend** ([frontend/package.json](frontend/package.json)):

- Framework: Vue 3.5.0, Vue Router 4.4.5
- HTTP Client: axios 1.7.9
- WebSocket: socket.io-client 4.8.3
- State Management: pinia 3.0.4
- Styling: Tailwind CSS 4.1.17, Reka UI 2.6.1
- Tables: @tanstack/vue-table 8.21.3
- Icons: lucide-vue-next 0.555.0
- Build tool: Vite 5.4.0

**Backend** ([backend/package.json](backend/package.json)):

- Framework: Fastify 4.26.2
- WebSocket: socket.io 4.8.3
- Runtime: Node.js with tsx for watch mode
- CORS: @fastify/cors, @fastify/sensible

### Directory Organization

```
frontend/
├── src/
│   ├── api/           # API client layer (organized by resource)
│   │   ├── client.ts  # Axios instance, interceptors, request() wrapper
│   │   ├── index.ts   # Central export point
│   │   ├── users.ts, posts.ts, comments.ts, auth.ts
│   ├── components/    # Vue components (UI components in ui/ subfolder)
│   ├── services/      # Business logic (websocket.ts)
│   ├── stores/        # Pinia stores (realtimeData.ts)
│   ├── router/        # Vue Router config
│   ├── views/         # Page components
│   ├── lib/           # Utilities (utils.ts with cn() helper)
│   ├── assets/        # Static resources and styles

backend/
├── src/
│   ├── index.ts       # Fastify server setup, API registration
│   ├── modules/       # Feature modules
│   │   ├── api/       # HTTP API routes (mockRoutes.ts, mockData.ts)
│   │   ├── websocket/ # WebSocket setup (socketServer.ts, subscriptionManager.ts, mockDataGenerator.ts)

packages/shared/
├── src/
│   ├── types.ts       # Shared TypeScript interfaces
│   ├── index.ts       # Public exports
```

### Service Interactions

**Frontend API Client Flow:**

1. [frontend/src/api/client.ts](frontend/src/api/client.ts) creates axios instance with:
   - Base URL: `/api` (proxied to backend in dev mode)
   - Auto token injection from localStorage
   - Unified error handling
   - Cache-busting timestamp for GET requests

2. Module-specific API functions ([frontend/src/api/users.ts](frontend/src/api/users.ts)) wrap `request.get/post/put/patch/delete()` with resource-specific URLs

3. Components import and use: `import { getUsers, createPost } from '@/api'`

**Backend Route Registration ([backend/src/index.ts](backend/src/index.ts)):**

- Fastify setup with CORS and sensible error handling
- Registers mock routes from `modules/api` in non-production environments
- Initializes Socket.IO server for WebSocket connections

**WebSocket Data Flow:**

1. Frontend subscribes via [frontend/src/services/websocket.ts](frontend/src/services/websocket.ts) `useWebSocket().subscribe(tags)`
2. Backend subscription manager ([backend/src/modules/websocket/subscriptionManager.ts](backend/src/modules/websocket/subscriptionManager.ts)) tracks subscriptions per connection
3. Mock data generator pushes data to subscribed clients via `socket.emit('data:push', message)`
4. Frontend receives and updates Pinia store ([frontend/src/stores/realtimeData.ts](frontend/src/stores/realtimeData.ts))

---

## 3. Build & Test Commands

### Root-Level Commands

All commands run across all workspaces:

```bash
npm run dev        # Start both backend (tsx watch) and frontend (Vite) concurrently
npm run build      # Build all: shared → backend → frontend
npm run typecheck  # Type check all packages
npm run lint       # Lint backend and frontend
npm run format     # Format all files with Prettier
```

### Individual Package Commands

**Frontend** (`npm run dev --workspace frontend`):

- `vite`: Dev server on port 5173
- `vite build`: Production build
- `vite preview`: Preview production build
- Proxies `/api` to `http://localhost:5001` (configurable via `VITE_API_TARGET`)
- Proxies `/socket.io` to WebSocket at `http://localhost:5001`

**Backend** (`npm run dev --workspace backend`):

- `tsx watch src/index.ts`: Dev server with hot reload on port 5001
- Fastify logs all requests by default

**Shared**:

- `tsc`: Type check and declaration generation
- No runtime build artifacts

### Environment Variables

**Frontend** (Vite):

- `VITE_API_TARGET`: Backend API URL (defaults to `http://localhost:5001`)
- `VITE_WS_URL`: WebSocket server URL ([frontend/src/services/websocket.ts](frontend/src/services/websocket.ts))

**Backend**:

- `NODE_ENV`: Controls mock route registration
- `PORT`: Server port (defaults to 5001)
- `FRONTEND_ORIGIN`: CORS origin (defaults to true for dev)

---

## 4. Project Conventions

### Naming Patterns

**Components:**

- PascalCase for component files and component names
- Pages (Views) end with `View.vue` ([frontend/src/views/HealthCheckView.vue](frontend/src/views/HealthCheckView.vue))
- Layout/reusable components use semantic names (`AppHeader.vue`, `FullscreenToggle.vue`)

**API Functions:**

- Named exports: `getUsers()`, `createPost()`, `updateUser()`
- Pattern: `[verb][Resource]()` or `[verb][Resource][Qualifier]()` ([frontend/src/api/users.ts](frontend/src/api/users.ts))
- REST operations: get→read, create/post→create, update/put→update, patch→patch, delete→delete

**Stores (Pinia):**

- Named with `use[Feature]Store()` pattern ([frontend/src/stores/realtimeData.ts](frontend/src/stores/realtimeData.ts))
- Return object with state refs, computed values, and actions

**Services:**

- Export composable function `use[Service]()` returning reactive state and methods ([frontend/src/services/websocket.ts](frontend/src/services/websocket.ts#L89))

**TypeScript Interfaces:**

- Suffix with data category: `-Params` for request params, `-Response` for responses ([packages/shared/src/types.ts](packages/shared/src/types.ts))
- Use discriminated unions: `role: 'admin' | 'user'`

**Backend Classes:**

- PascalCase class names: `SubscriptionManager` ([backend/src/modules/websocket/subscriptionManager.ts](backend/src/modules/websocket/subscriptionManager.ts))
- Private fields use `#` or `private` keyword

### State Management

**Pinia Usage** ([frontend/src/stores/realtimeData.ts](frontend/src/stores/realtimeData.ts)):

```typescript
export const useRealtimeDataStore = defineStore('realtimeData', () => {
  // State
  const tag1 = ref<Tag1Data | null>(null);

  // Methods
  function updateData(tag: string, value: any): void { ... }

  // Return public interface
  return { tag1, updateData };
});
```

- Composition API style (setup function)
- Reactive refs for state
- No getters/setters syntax; direct ref access

**Vue Component State:**

- Use `ref<T>()` for single values, `computed()` for derived values
- Define emits with `defineEmits<{ 'event-name': [...] }>()`
- Props typed with `<Props>` interface passed to `defineProps<Props>()`

### Routing

**Vue Router Setup** ([frontend/src/router/index.ts](frontend/src/router/index.ts)):

- Nested routes under main layout (HomePage as parent)
- Path-based routing with named routes
- Lazy loading not used (all components imported directly)
- Fallback route: catch-all redirects to home

### API Response Consistency

**Shared Response Types** ([packages/shared/src/types.ts](packages/shared/src/types.ts)):

- All endpoints return typed response objects
- Generic `ApiResponse<T>` wrapper with success, data, message, error fields
- Paged endpoints return `PaginatedResponse<T>` with data, total, page, limit

**Error Handling** ([frontend/src/api/client.ts](frontend/src/api/client.ts)):

- Axios response interceptor handles all HTTP errors (400, 401, 403, 404, 500)
- 401 clears auth token and logs message
- Network errors logged separately from request errors

---

## 5. Integration Points

### Frontend-Backend Communication

#### HTTP API

**Client Setup** ([frontend/src/api/client.ts](frontend/src/api/client.ts)):

- Axios instance with request/response interceptors
- Authorization header auto-injected from `localStorage.getItem('auth_token')`
- GET requests include cache-busting `_t` timestamp parameter

**Request Wrapper Methods:**

```typescript
request.get<T>(url, config?)      // GET
request.post<T>(url, data, config)  // POST
request.put<T>(url, data, config)   // PUT
request.patch<T>(url, data, config) // PATCH
request.delete<T>(url, config)      // DELETE
```

**Backend Route Registration** ([backend/src/modules/api/mockRoutes.ts](backend/src/modules/api/mockRoutes.ts)):

- All routes under `/api/` namespace
- Returns typed responses matching shared types
- Uses Fastify `httpErrors` for proper HTTP error codes

#### WebSocket Real-Time Data

**Client Subscription** ([frontend/src/services/websocket.ts](frontend/src/services/websocket.ts)):

- Global singleton Socket.IO connection
- Auto-reconnect enabled (1-5 second delays)
- Composable `useWebSocket()` returns: `isConnected`, `error`, `subscribe()`, `unsubscribe()`
- Data push handler auto-parses JSON and updates Pinia store

**Server Push** ([backend/src/modules/websocket/socketServer.ts](backend/src/modules/websocket/socketServer.ts)):

- Socket.IO server initialized with Fastify HTTP server
- CORS enabled for frontend origin
- Subscription manager tracks which clients want which data tags
- Mock data generator pushes to subscribed sockets via `io.to(socketId).emit('data:push', message)`

**Message Format:**

```typescript
interface DataPushMessage {
  tag: string; // 'tag1', 'tag2', 'tag3'
  value: string; // JSON string (auto-parsed on client)
  timestamp?: string;
}
```

### Shared Types Management

**Module Export** ([packages/shared/src/index.ts](packages/shared/src/index.ts)):

- Central export point for all shared types
- Frontend API modules re-export: `export * from '@gt4_web/shared'`
- Backend imports specific types: `import type { HealthCheckResponse } from '@gt4_web/shared'`

**Current Shared Types** ([packages/shared/src/types.ts](packages/shared/src/types.ts)):

- `ApiResponse<T>` - Generic response wrapper
- `PaginatedResponse<T>` - Paginated list response
- `User`, `Post`, `Comment` - Domain entities
- `LoginParams`, `LoginResponse` - Auth payloads
- `HealthCheckResponse` - Health check response
- `SubscribeRequest`, `DataPushMessage` - WebSocket messages
- `Tag1Data`, `Tag2Data`, `Tag3Data` - Real-time sensor data types

### Environment-Specific Configuration

**Vite Configuration** ([frontend/vite.config.ts](frontend/vite.config.ts)):

```typescript
server: {
  port: 5173,
  proxy: {
    '/api': { target: process.env.VITE_API_TARGET || 'http://localhost:5001' },
    '/socket.io': { target: 'http://localhost:5001', ws: true }
  }
}
```

**Runtime Environment Access:**

- Frontend: `import.meta.env.VITE_*` (Vite automatically prefixes with VITE\_)
- Backend: `process.env.NODE_ENV`, `process.env.PORT`, etc.

### UI Component Library Integration

**Reka UI + Tailwind CSS:**

- All UI components ([frontend/src/components/ui/](frontend/src/components/ui/)) built on Reka UI primitives
- Button component ([frontend/src/components/ui/button/Button.vue](frontend/src/components/ui/button/Button.vue)):
  - Takes `variant` and `size` props controlled by `cva` (class-variance-authority)
  - Applies Tailwind classes via `cn()` utility (clsx + tailwindMerge)
  - Supports multiple semantic variants: default, destructive, outline, ghost, success, warning, info
- All components using `cn()` helper for class merging

**Tailwind Configuration:**

- Configured via `components.json` with shadowcn settings
- CSS variables for theming (baseColor: neutral)
- Path aliases preconfigured for easy imports

---

## 6. Development Workflow Tips

### Quick Local Setup

```bash
# Install dependencies
pnpm install

# Start dev servers (backend + frontend)
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:5001
# Backend health check: http://localhost:5001/api/health
```

### Type Safety

- All packages enforce TypeScript strict mode
- Run type checks before commits: `npm run typecheck`
- Shared types prevent frontend-backend mismatches

### Common Patterns to Follow

**Adding a New API Resource:**

1. Define types in `packages/shared/src/types.ts`
2. Create API module: `frontend/src/api/[resource].ts` with `async function` wrappers
3. Export from `frontend/src/api/index.ts`
4. Add backend routes in `backend/src/modules/api/mockRoutes.ts`

**Adding a New Page:**

1. Create `frontend/src/views/[FeatureName]View.vue`
2. Add route to `frontend/src/router/index.ts`
3. Import and use UI components from `@/components/ui/[component]`
4. Use stores via `const store = use[Feature]Store()`

**Debugging WebSocket:**

- Frontend logs use `[WebSocket]` prefix in console
- Backend logs use `[SocketServer]` prefix
- Check `isConnected` state in any component using `const { isConnected } = useWebSocket()`

---

## 7. Key Files Reference

| Purpose                      | File(s)                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Shared Type Definitions      | [packages/shared/src/types.ts](packages/shared/src/types.ts)                                                 |
| Frontend API Client          | [frontend/src/api/client.ts](frontend/src/api/client.ts)                                                     |
| Frontend Routing             | [frontend/src/router/index.ts](frontend/src/router/index.ts)                                                 |
| Frontend State (Pinia)       | [frontend/src/stores/realtimeData.ts](frontend/src/stores/realtimeData.ts)                                   |
| Frontend WebSocket Service   | [frontend/src/services/websocket.ts](frontend/src/services/websocket.ts)                                     |
| Backend Server Setup         | [backend/src/index.ts](backend/src/index.ts)                                                                 |
| Backend API Routes           | [backend/src/modules/api/mockRoutes.ts](backend/src/modules/api/mockRoutes.ts)                               |
| Backend WebSocket Server     | [backend/src/modules/websocket/socketServer.ts](backend/src/modules/websocket/socketServer.ts)               |
| Backend Subscription Manager | [backend/src/modules/websocket/subscriptionManager.ts](backend/src/modules/websocket/subscriptionManager.ts) |
| Code Formatting Config       | [.prettierrc](.prettierrc)                                                                                   |
| Frontend Config              | [frontend/vite.config.ts](frontend/vite.config.ts)                                                           |
| Workspace Config             | [pnpm-workspace.yaml](pnpm-workspace.yaml)                                                                   |

---

## 8. Chinese Language Convention

This project uses **Chinese for business logic comments and documentation**, with English reserved for technical terms and code structure:

```typescript
// ✓ Correct
/**
 * 获取所有用户
 * @param params 查询参数
 */
export function getUsers(params?: Record<string, any>): Promise<User[]> { ... }

// ✓ Also acceptable
// 从localStorage获取token
const token = localStorage.getItem('auth_token');
```

This pattern applies to all comment styles: JSDoc, inline comments, and log messages.
