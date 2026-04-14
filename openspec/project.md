# Project Context

## Purpose

GT4 Web 是一个基于 B/S 架构的工业 HMI 全栈项目，目标是在浏览器中完成生产现场数据展示、参数维护和操作命令下发。

项目采用前后端分离模式，前端是 Vue 3 SPA，页面切换全部在前端完成，不涉及后端模板渲染。系统同时面向两类场景：

- 工业监控页面：固定全屏、无滚动、强调实时数据显示。
- 业务配置页面：用于生产参数、合同数据、探伤/分组等业务录入与维护。

## Tech Stack

项目当前是一个 pnpm monorepo，包含 frontend、backend、packages/shared 三个工作区。

### 后端

- Node.js + TypeScript
- Fastify 4
- @fastify/cors
- @fastify/sensible
- Socket.IO 4（WebSocket 通信）
- Prisma Client 6
- ioredis
- 数据库：PostgreSQL + Redis
- tsx（本地开发 watch）

### 前端

- Vue 3.5 + TypeScript
- Vite 5
- Vue Router 4
- Pinia
- axios
- Socket.IO Client 4
- Tailwind CSS 4
- shadcn-vue / Reka UI
- lucide-vue-next
- TanStack Table（部分表格页面）
- 固定布局、全屏应用，不允许页面滚动

### 开发工具

- pnpm workspaces
- TypeScript strict 模式，ES2020，ESM
- ESLint 9
- Prettier 3
- Concurrently

## Runtime & Commands

- Node.js >= 20
- pnpm >= 8，仓库显式拒绝 npm install 和 yarn
- 根目录常用命令：
  - `pnpm install`
  - `npm run dev`
  - `npm run build`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run format`
- 默认开发地址：
  - Frontend: http://localhost:5173
  - Backend: http://localhost:5001
  - Health: http://localhost:5001/api/health

## Project Conventions

### package management

- 使用 pnpm 安装依赖和管理 workspace。
- 虽然根 package.json 保留了 workspaces 字段，但实际包管理约束以 pnpm 为准。

### Code Style

- 全项目使用 TypeScript strict 模式、ES2020 目标和 ESM。
- 格式由 Prettier 控制：单引号、100 字符行宽、保留分号、尾随逗号。
- Vue 统一使用 `<script setup lang="ts">` 和 Composition API。
- 状态优先使用 `ref()`，派生值使用 `computed()`。
- 组件命名使用 PascalCase，页面组件使用 `*View.vue`。
- API 函数采用 `[verb][Resource]()` 命名。
- Pinia store 采用 `use[Feature]Store()` 命名。
- 业务逻辑注释用中文，技术或结构性说明用英文。
- 前端 UI 优先复用 `frontend/src/components/ui/` 下已有组件；缺失时再补充 shadcn-vue 组件。

### Architecture Patterns

#### 工作区结构（Monorepo）

项目当前分为三个主要工作区：

- frontend : 前端Vue应用
- backend : Node.js后端服务
- packages/shared : 前后端共享类型与协议定义

共享类型当前按职责拆分在 `packages/shared/src/db_types.ts` 和 `packages/shared/src/redis_types.ts`，由 `packages/shared/src/index.ts` 统一导出。

#### 数据交互方式

- HTTP API：前端通过 axios 调用 `/api`，由 Vite 代理到 Fastify 后端。
- WebSocket：前端通过 Socket.IO 与后端保持长连接，使用 `subscribe(tags)` 订阅实时数据，使用 `sendCommand(cmdName, cmdPara?)` 下发操作命令。
- Pinia Store：前端 `realtimeData` store 负责统一保存实时数据状态。
- Redis Pub/Sub：后端通过 Redis 与 C++ 业务后端交互。

当前实时数据链路如下：

1. C++ 程序写入 Redis key 后，向 `RealDataChanged` 频道发布 tag 名称。
2. 后端 `redisSubscriber` 监听该频道，检查当前是否有前端订阅该 tag。
3. 若存在订阅者，后端再从 Redis 读取最新值，并通过 Socket.IO 发送 `data:push`。
4. 前端 `useWebSocket()` 的内部处理器收到推送后，更新 Pinia `realtimeData` store。

当前命令下发链路如下：

1. 前端调用 `useWebSocket().sendCommand()`。
2. 后端 Socket.IO 服务接收 `cmd:push`。
3. 后端将命令序列化后发布到 Redis `operation_cmd` 频道。
4. C++ 业务后端订阅该频道并执行命令。

#### 工业界面布局架构（HMI Layout）

- 所有 HMI 页面必须固定全屏显示，不允许出现浏览器滚动条。
- 当前应用壳层是 `HomePage.vue`，统一承载 `AppHeader`、`AppSidebar` 和内容区。
- 除 `LoginView` 外，其余业务页面作为 `HomePage` 子路由挂载。
- 固定分辨率页面通过路由 `meta.hmiScale` 声明设计尺寸，由 `HmiViewport` 统一负责缩放。
- 当前主监控页使用 `1920 x 1080` 作为设计基准。
- 页面内部优先使用 SVG `viewBox` 或虚拟坐标进行布局，避免依赖实际像素值。

#### 后端数据访问模式

- 后端 API 路由位于 `backend/src/modules/api/`。
- 开发环境会注册 `mockRoutes.ts`，提供用户、文章、评论、登录等 mock API。
- 真实业务数据通过独立路由访问 PostgreSQL：
  - `parameterSetRoutes.ts` 负责生产参数读取与保存。
  - `orderDataRoutes.ts` 负责合同号、项目号及合同明细查询与维护。
- `parameter_set` 表当前没有主键，无法映射为 Prisma model，因此相关操作使用 Prisma 的原生 SQL 能力完成。

### Testing Strategy

当前仓库没有独立的自动化测试脚本，变更验证以静态检查和构建为主：

- 优先运行受影响范围的 `typecheck`、`lint` 或 `build`。
- 跨前后端或共享类型的改动，至少应检查根目录 `npm run typecheck`。
- 前端页面改动需要额外验证固定全屏布局、无滚动、路由缩放和 WebSocket 订阅行为。
- 后端接口改动需要验证 HTTP 返回结构、Redis 链路和 Socket.IO 事件名保持兼容。

已知现状：frontend workspace 的 typecheck 目前可能因 `frontend/src/components/ui/chart/index.ts` 缺少 `@unovis/vue` 模块而失败；这属于仓库现存问题，不应误判为当前任务引入。

### Git Workflow

- 仓库默认分支是 `master`。
- 当前开发通常在独立工作分支上进行，再合并回主线。
- 修改时不要随意回退工作区内与当前任务无关的已有变更。
- 提交前应至少完成相关范围的静态检查，并确保前后端接口契约一致。

## Domain Context

这是一个工业产线 HMI 系统，AI 在生成代码或文档时需要理解以下领域事实：

- 系统既包含监控画面，也包含业务录入/维护页面。
- 生产参数对应 `parameter_set` 表，字段很多，保存逻辑是“先删后插”的单记录模式。
- 合同数据对应 `api_order_data_t` 表，围绕合同号 `order_no` 和项目号 `item_no` 查询与编辑。
- 实时数据目前至少包含 `tag1`、`tag2`、`tag3` 和 `PlanInfo`，前端 store 已对这些 tag 做显式处理。
- WebSocket 订阅模型是“单页面、单活跃订阅集合”设计，`subscribe(tags)` 的语义是全量替换，不是增量追加。
- 操作命令最终不是由 Node.js 执行业务，而是经 Redis 转发给 C++ 业务后端。

## Important Constraints

- 前端必须保持 SPA 架构，不能引入后端渲染。
- HMI 页面必须全屏、无滚动，并适配固定设计尺寸缩放。
- 前端新增页面时，通常需要注册为 `HomePage` 的子路由；`LoginView` 保持顶层独立路由。
- 前后端共享类型应优先定义在 `packages/shared`，避免各自维护重复类型。
- WebSocket 服务是单例服务，实时数据写入 `realtimeData` store 的内部处理器不能被外部监听管理误删。
- Redis 订阅客户端和数据客户端必须分离；订阅模式连接不能混用普通 GET/SET。
- 开发环境允许使用 mock API 和 mock 数据生成器；生产环境应依赖真实 PostgreSQL 和 Redis。

## External Dependencies

- PostgreSQL：业务数据持久化，当前用于 `parameter_set` 和 `api_order_data_t` 等表。
- Redis：保存实时 tag 数据，同时承担 `RealDataChanged` 和 `operation_cmd` 等频道通信。
- C++ 业务后端：负责实际生产业务执行，是 Redis Pub/Sub 的另一端。
- Socket.IO：浏览器与 Node.js 后端之间的实时通信协议。
- Vite 开发代理：前端开发时将 `/api` 和 `/socket.io` 分别代理到本地后端服务。
