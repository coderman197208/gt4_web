# Project Guidelines for AI Agents

> 本文件是仓库唯一的工作区级 agent 指南。需要更细粒度约定时，优先新增嵌套 `AGENTS.md` 或 `.github/instructions/*.instructions.md`，不要再创建重复的工作区总说明。

GT4 Web 是一个面向工业 HMI 的全栈 TypeScript pnpm monorepo。高层规则见 `CLAUDE.md`，更完整的背景和示例见 `WORKSPACE_GUIDELINES.md`。

## Code Style

- 全项目使用 TypeScript strict 模式、ES2020 目标和 ESM。
- 格式约定由 Prettier 控制: 单引号、100 字符行宽、保留分号、尾随逗号。
- Vue 统一使用 `<script setup lang="ts">` 和 Composition API；状态优先 `ref<T>()`，派生值使用 `computed()`。
- 命名约定: 组件 `PascalCase`，页面使用 `*View.vue`，API 函数使用 `[verb][Resource]()`，Pinia store 使用 `use[Feature]Store()`。
- 业务逻辑注释用中文，技术或结构性说明用英文。
- 前端优先复用 `frontend/src/components/ui/` 中现有 UI 组件，缺失时再补充 shadcn-vue 组件。

## Architecture

- Monorepo 由 `frontend`、`backend` 和 `packages/shared` 组成；共享类型统一定义在 `packages/shared/src/types.ts`。
- 前端通过 axios 调用 `/api`，由 Vite 代理到 Fastify 后端；WebSocket 通过 `/socket.io` 代理到 Socket.IO 服务。
- 后端 HTTP 路由位于 `backend/src/modules/api/`，WebSocket 逻辑位于 `backend/src/modules/websocket/`。
- 后端通过 Redis Pub/Sub 与 C++ 业务后端通信，逻辑位于 `backend/src/modules/redis/`。
- HMI 页面采用固定全屏布局，不应引入滚动页面；需要按虚拟坐标或 SVG `viewBox` 思路布局，参考 `view_sample/` 和 `doc/mytasks/`。

### Redis Pub/Sub 数据流

系统通过 Redis 实现 Node.js 后端与 C++ 业务后端之间的双向通信：

**实时数据推送（C++ → 前端）**:

1. C++ 程序将 tag 值写入 Redis（`SET tagName value`）后，向 `RealDataChanged` 频道发布 tagName
2. `redisSubscriber.ts` 监听 `RealDataChanged` 频道，收到 tagName 后通过 `subscriptionManager` 检查是否有前端订阅该 tag
3. 若有订阅者，从 Redis 读取对应 tag 数据（`GET tagName`），通过 Socket.IO 的 `data:push` 事件推送给前端

**操作命令下发（前端 → C++）**:

1. 前端通过 `useWebSocket().sendCommand(cmdName, cmdPara?)` 发送命令
2. Socket.IO 服务端监听 `cmd:push` 事件，将命令序列化为 JSON 后发布到 Redis 的 `operation_cmd` 频道
3. C++ 业务后端订阅 `operation_cmd` 频道，接收并执行命令

**Redis 客户端设计**: `redisClient.ts` 使用 ioredis 维护两个单例连接——`DataClient`（数据读写 + 命令发布）和 `SubClient`（Pub/Sub 订阅专用，因为 Redis 订阅模式下客户端不能执行普通命令）。两个客户端均配置自动重连策略。

- 代表性文件:
  - API 模块: `frontend/src/api/users.ts`
  - API 客户端: `frontend/src/api/client.ts`
  - Store: `frontend/src/stores/realtimeData.ts`
  - WebSocket: `frontend/src/services/websocket.ts`
  - 路由: `frontend/src/router/index.ts`
  - 后端 Mock 路由: `backend/src/modules/api/mockRoutes.ts`
  - 后端数据库路由: `backend/src/modules/api/parameterSetRoutes.ts`
  - Prisma 客户端: `backend/src/modules/database/prismaClient.ts`
  - Redis 客户端: `backend/src/modules/redis/redisClient.ts`
  - Redis 订阅器: `backend/src/modules/redis/redisSubscriber.ts`

## Build and Test

- 安装依赖使用 `pnpm install`；仓库通过 `engines` 明确拒绝 `npm install` 和 `yarn`。
- 常用根命令:
  - `npm run dev` 启动前后端开发环境
  - `npm run build` 构建 shared、backend、frontend
  - `npm run typecheck` 运行全仓类型检查
  - `npm run lint` 运行前后端 ESLint
  - `npm run format` 运行 Prettier
- 常用地址:
  - Frontend: `http://localhost:5173`
  - Backend: `http://localhost:5001`
  - Health: `http://localhost:5001/api/health`
- 当前仓库没有独立的自动化测试脚本；修改后至少运行相关范围的 `typecheck`、`lint` 或 `build` 作为基线验证。

## Conventions

- 新增功能时先更新共享类型，再写前后端实现，避免前后端各自定义局部类型。
- 前端 API 模块保持 `request.get/post/...` 的薄封装模式，并统一从 `frontend/src/api/index.ts` 导出。
- Mock API 路由和真实数据库路由均直接返回数据对象，而不是 `ApiResponse<T>` 包装；登录接口是少数返回 `success` 结构的例外。
- 真实数据库路由使用 Prisma ORM 访问 PostgreSQL，连接通过 `backend/src/modules/database/prismaClient.ts` 单例管理；路由文件独立于 `mockRoutes.ts`，按资源命名（如 `parameterSetRoutes.ts`）。
- 新页面加入 `frontend/src/views/` 后，需要作为 `HomePage` 的子路由注册到 `frontend/src/router/index.ts`。
- WebSocket 订阅通过 `useWebSocket().subscribe(tags)` 管理；取消订阅传空数组，不要自行维护第二套 socket 状态。
- 产品约束默认始终只有一个活跃页面，并且任一时刻只允许一个页面拥有 WebSocket 订阅；因此 `subscribe(tags)` 语义是全量替换当前订阅集合，重连后恢复最后一次订阅属于设计预期，不应按多页面并发订阅模型改造。
- 操作命令通过 `useWebSocket().sendCommand(cmdName, cmdPara?)` 发送，后端经 Redis `operation_cmd` 频道转发给 C++ 业务后端；命令参数为对象时会自动序列化为 JSON 字符串。
- Redis 相关开发注意事项:
  - 订阅客户端（SubClient）只能用于 Pub/Sub，不能执行 GET/SET 等普通命令；数据读写和 PUBLISH 使用 DataClient。
  - 新增 Redis 频道时需同时考虑 C++ 端的发布/订阅对应关系。
  - 调试日志使用 `[RedisSubscriber]`（订阅器）和 `[RedisClient]`（连接管理）前缀。
- 调试日志沿用既有前缀: 前端使用 `[WebSocket]`，后端使用 `[SocketServer]`。
- 细节示例与扩展规则优先链接现有文档，不在本文件重复展开；需要深入背景时查看 `WORKSPACE_GUIDELINES.md` 和 `doc/ui-components-guide.md`。
