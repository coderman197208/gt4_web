# Project Guidelines for AI Agents

GT4 Web 是一个全栈 TypeScript 项目，采用 pnpm monorepo 结构。本指南帮助 AI agent 在开发中遵循项目约定。

## Code Style

**TypeScript & Vue 3**: 全项目使用 `"strict": true`，ES2020 目标。所有文件启用 ESM 模块。

**代码格式** (Prettier):

- 单引号、100字符行宽、末尾逗号 (all)

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "all"
}
```

**命名约定**:

- 组件: PascalCase (Views 后缀 `View.vue`)
- API 函数: `[verb][Resource]()` 如 `getUsers()`, `createPost()`
- Store: `use[Feature]Store()` (Pinia composition API)
- 业务逻辑注释: 中文; 技术代码: 英文

**Vue 3 模式**:

- `<script setup lang="ts">` 组合式 API
- `ref<T>()` 单值状态, `computed()` 派生值

## Architecture

**Monorepo 结构**: `frontend`, `backend`, `packages/shared`

```
frontend/
  ├── api/              # axios 客户端 + 资源模块
  ├── components/ui/    # Reka UI + Tailwind 组件 (shadcn-vue)
  ├── views/            # 页面级组件 (*View.vue)
  ├── stores/           # Pinia (realtimeData.ts)
  ├── router/           # Vue Router 路由
  ├── services/         # WebSocket 服务
  ├── lib/              # 工具函数 (cn() 等)
  └── assets/           # 静态资源与样式

backend/
  ├── modules/api/      # HTTP 路由 (mockRoutes.ts, mockData.ts)
  ├── modules/websocket/ # Socket.IO 服务器

packages/shared/
  ├── types.ts          # 前后端共享接口
  └── index.ts          # 统一导出

view_sample/            # WinForms 界面参考截图（用于 HMI 页面转换）
doc/mytasks/            # 页面转换任务规格说明
```

**关键集成**:

1. **HTTP API**: 前端通过 axios (`/api`) 代理到后端 Fastify 服务
2. **WebSocket**: Socket.IO 推送实时数据 (Tag1/2/3)
   - 前端: [useWebSocket().subscribe(tags)](frontend/src/services/websocket.ts)
   - 后端: [subscriptionManager](backend/src/modules/websocket/subscriptionManager.ts) 管理订阅
3. **共享类型**: [packages/shared/src/types.ts](packages/shared/src/types.ts) 防止不匹配

**HMI 布局架构**:

本项目为工业监控界面（HMI），采用固定全屏布局，不能滚动且要填满屏幕：

- 使用 SVG `viewBox` 建立虚拟坐标系（如 `viewBox="0 0 1920 1080"`）
- 数据点定位使用虚拟坐标或百分比，避免硬编码像素值
- 通过 `preserveAspectRatio` 控制缩放行为

**响应格式**:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

## Build & Test

**root 级命令**:

```bash
npm run dev          # 后端 + 前端并发
npm run build        # 编译所有包
npm run typecheck    # 类型检查全部
npm run lint         # lint 所有代码
npm run format       # prettier 格式化
```

**本地启动**:

```bash
pnpm install
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:5001
# Health: http://localhost:5001/api/health
```

**端口**:

- 前端 Vite: `:5173` (代理 `/api` 和 `/socket.io` 到后端)
- 后端 Fastify: `:5001`

## Project Conventions

**API 模块模式** ([frontend/src/api/users.ts](frontend/src/api/users.ts)):

```typescript
const request = createAxiosInstance();
export async function getUsers(params?: Record<string, any>): Promise<User[]> {
  return (await request.get('/users', { params })).data;
}
export async function createUser(data: CreateUserParams): Promise<User> {
  return (await request.post('/users', data)).data;
}
```

**Store 模式** ([frontend/src/stores/realtimeData.ts](frontend/src/stores/realtimeData.ts)):

```typescript
export const useRealtimeDataStore = defineStore('realtimeData', () => {
  const tag1 = ref<Tag1Data | null>(null);
  function updateData(tag: string, value: any): void {
    /* ... */
  }
  return { tag1, updateData };
});
```

**组件引用 UI 库**:

- 所有 UI 组件: [frontend/src/components/ui/](frontend/src/components/ui/) (Button, Card, Input, Table, Chart 等)
- 优先使用 shadcn-vue 组件库，缺失组件需先下载安装到 `components/ui/`
- Reka UI primitives + Tailwind CSS (`cn()` 合并类)
- 图标: lucide-vue-next
- 表格: @tanstack/vue-table
- 工具库: @vueuse/core

**添加新资源步骤**:

1. 在 `packages/shared/src/types.ts` 定义类型
2. 创建 `frontend/src/api/[resource].ts`
3. 在 `frontend/src/api/index.ts` 中统一导出
4. 在 `backend/src/modules/api/mockRoutes.ts` 添加路由
5. 前端组件使用: `import { getResource } from '@/api'`

**添加新页面步骤**:

1. 创建 `frontend/src/views/[FeatureName]View.vue`
2. 在 `frontend/src/router/index.ts` 中作为 `HomePage` 的子路由添加
3. 从 `@/components/ui/[component]` 导入 UI 组件
4. 按需使用 Store: `const store = use[Feature]Store()`

## Integration Points

**前端 API 客户端** ([frontend/src/api/client.ts](frontend/src/api/client.ts)):

- axios 实例自动注入 `localStorage` 的 `auth_token`
- GET 请求带时间戳避免缓存

**后端路由** ([backend/src/modules/api/mockRoutes.ts](backend/src/modules/api/mockRoutes.ts)):

- `/api/` 命名空间下所有端点
- 返回 `ApiResponse<T>` 类型的响应
- 非生产环境加载 mock 路由

**WebSocket 消息**:

```typescript
interface DataPushMessage {
  tag: string; // 'tag1' | 'tag2' | 'tag3'
  value: string; // JSON 字符串（客户端自动解析）
}
```

- 前端使用: `const { isConnected, error, subscribe, onDataPush } = useWebSocket()`
- 取消订阅: 调用 `subscribe([])` 传入空数组
- 调试日志: 前端 `[WebSocket]` 前缀，后端 `[SocketServer]` 前缀

## Key Reference Files

| 目的             | 文件                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| 共享类型         | [packages/shared/src/types.ts](packages/shared/src/types.ts)                                                 |
| 前端 API 客户端  | [frontend/src/api/client.ts](frontend/src/api/client.ts)                                                     |
| 前端路由         | [frontend/src/router/index.ts](frontend/src/router/index.ts)                                                 |
| 前端 Pinia Store | [frontend/src/stores/realtimeData.ts](frontend/src/stores/realtimeData.ts)                                   |
| WebSocket 服务   | [frontend/src/services/websocket.ts](frontend/src/services/websocket.ts)                                     |
| 后端入口         | [backend/src/index.ts](backend/src/index.ts)                                                                 |
| 后端 API 路由    | [backend/src/modules/api/mockRoutes.ts](backend/src/modules/api/mockRoutes.ts)                               |
| 后端 WebSocket   | [backend/src/modules/websocket/socketServer.ts](backend/src/modules/websocket/socketServer.ts)               |
| 订阅管理器       | [backend/src/modules/websocket/subscriptionManager.ts](backend/src/modules/websocket/subscriptionManager.ts) |
| UI 组件指南      | [doc/ui-components-guide.md](doc/ui-components-guide.md)                                                     |
| Prettier 配置    | [.prettierrc](.prettierrc)                                                                                   |
| Vite 配置        | [frontend/vite.config.ts](frontend/vite.config.ts)                                                           |
| Workspace 配置   | [pnpm-workspace.yaml](pnpm-workspace.yaml)                                                                   |

## Additional Resources

更详细的指南请参考 `WORKSPACE_GUIDELINES.md`，包含完整示例代码、环境变量配置、调试技巧等。
