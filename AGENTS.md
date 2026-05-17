
## Architecture

- Monorepo 由 `frontend`、`backend` 和 `packages/shared` 组成；共享类型统一定义在 `packages/shared/src/types.ts`。
- 前端通过 axios 调用 `/api`，由 Vite 代理到 Fastify 后端；WebSocket 通过 `/socket.io` 代理到 Socket.IO 服务。
- 前端当前以 `HomePage` 作为应用壳层，除 `LoginView` 外，其余业务页面作为其子路由挂载。
- 后端 HTTP 路由位于 `backend/src/modules/api/`，WebSocket 逻辑位于 `backend/src/modules/websocket/`。
- 后端通过 Redis Pub/Sub 与 C++ 业务后端通信，逻辑位于 `backend/src/modules/redis/`。

### Redis Pub/Sub 数据流

**实时数据推送（C++ → 前端）**:

1. C++ 程序将 tag 值写入 Redis（`SET tagName value`）后，向 `RealDataChanged` 频道发布 tagName
2. `redisSubscriber.ts` 监听 `RealDataChanged` 频道，收到 tagName 后通过 `subscriptionManager` 检查是否有前端订阅该 tag
3. 若有订阅者，从 Redis 读取对应 tag 数据（`GET tagName`），通过 Socket.IO 的 `data:push` 事件推送给前端
4. 前端 `useWebSocket()` 的内部处理器会把 `data:push` 更新写入 `frontend/src/stores/realtimeData.ts`

**操作命令下发（前端 → C++）**:

1. 前端通过 `useWebSocket().sendUserCommand(cmdName, cmdPara?)` 发送命令
2. Socket.IO 服务端监听 `cmd:push` 事件，将命令序列化为 JSON 后发布到 Redis 的 `operation_cmd` 频道
3. C++ 业务后端订阅 `operation_cmd` 频道，接收并执行命令

**Redis 客户端设计**: `redisClient.ts` 使用 ioredis 维护两个单例连接——`redisDataClient`（数据读写 + 命令发布）和 `redisSubClient`（Pub/Sub 订阅专用）。

## Build

- 安装依赖使用 `pnpm install`
