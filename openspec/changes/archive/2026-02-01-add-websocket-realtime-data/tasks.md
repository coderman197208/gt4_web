# Tasks: Add WebSocket Real-Time Data Subscription and Push

## Implementation Checklist

### Phase 1: 依赖安装与类型定义

- [x] 安装后端依赖: `pnpm add socket.io --filter @gt4_web/backend`
- [x] 安装前端依赖: `pnpm add socket.io-client --filter @gt4_web/frontend`
- [x] 安装前端状态管理依赖: `pnpm add pinia --filter @gt4_web/frontend` (检查是否已安装)
- [x] 在 `packages/shared/src/types.ts` 中添加Tag1Data、Tag2Data、Tag3Data接口定义
- [x] 在 `packages/shared/src/types.ts` 中添加SubscribeRequest和DataPushMessage接口定义
- [x] 验证：运行 `pnpm typecheck` 确保类型定义无误

### Phase 2: 后端WebSocket服务器实现

- [x] 创建 `backend/src/modules/websocket/socketServer.ts`，集成Socket.IO到Fastify
- [x] 在 `socketServer.ts` 中监听 `connection` 事件，记录新连接
- [x] 在 `socketServer.ts` 中监听 `disconnect` 事件，清理连接订阅
- [x] 创建 `backend/src/modules/websocket/subscriptionManager.ts`，实现订阅管理类
  - `addConnection(socketId: string): void`
  - `updateSubscriptions(socketId: string, tags: string[]): void` (全量替换)
  - `removeConnection(socketId: string): void`
  - `getSubscribers(tag: string): string[]`
- [x] 在 `socketServer.ts` 中监听 `subscribe` 事件，调用subscriptionManager更新订阅
- [x] 验证：使用WebSocket客户端工具测试连接、订阅、断开流程

### Phase 3: 后端模拟数据生成器

- [x] 创建 `backend/src/modules/websocket/mockDataGenerator.ts`
- [x] 在mockDataGenerator中初始化tag1、tag2、tag3数据:
  - tag1: `{ ph: '123456', lh: '12345678', czh: '3456', tlxh: 1, zzwj: 139.7, zzbh: 5 }`
  - tag2: `10`
  - tag3: `[1, 2, 3, 4, 5, 6]`
- [x] 实现 `setInterval` 定时器，每秒递增数据:
  - tag1.tlxh += 1
  - tag2 += 1
  - tag3每项 += 1
- [x] 在定时器中查询订阅者并推送数据:
  - 对每个tag，调用 `subscriptionManager.getSubscribers(tag)`
  - 向订阅者发送 `data:push` 事件，格式: `{ tag, value: JSON.stringify(data) }`
- [x] 在 `backend/src/index.ts` 中启动mockDataGenerator
- [x] 验证：启动后端，使用WebSocket客户端订阅tag1，观察每秒推送的数据

### Phase 4: 前端WebSocket客户端服务

- [x] 创建 `frontend/src/services/websocket.ts`（或composable）
- [x] 在websocket.ts中实现 `useWebSocket` 函数:
  - 创建Socket.IO客户端连接到 `http://localhost:3000`
  - 提供响应式状态 `isConnected`, `error`
  - 监听 `connect` 事件，更新 `isConnected = true`
  - 监听 `disconnect` 事件，更新 `isConnected = false`
  - 提供 `subscribe(tags: string[]): void` 方法，发送 `subscribe` 事件
  - 提供 `onDataPush(callback): void` 方法，监听 `data:push` 事件
- [x] 确保WebSocket连接为单例模式（所有页面共享）
- [x] 实现自动重连逻辑（Socket.IO默认支持，配置reconnection选项）
- [x] 验证：在浏览器中加载应用，检查WebSocket连接是否建立

### Phase 5: 前端Pinia状态管理

- [x] 在 `frontend/src/main.ts` 中创建Pinia实例并挂载到Vue应用（如果尚未配置）
- [x] 创建 `frontend/src/stores/realtimeData.ts`
- [x] 在realtimeData.ts中定义store状态:
  ```typescript
  state: () => ({
    tag1: null as Tag1Data | null,
    tag2: null as number | null,
    tag3: null as number[] | null,
  });
  ```
- [x] 实现 `updateData(tag: string, value: any): void` action:
  - 根据tag名称更新对应字段（tag1/tag2/tag3）
  - 处理未知tag的情况（记录日志或忽略）
- [x] （可选）实现 `resetData` action清空数据
- [x] 验证：在组件中使用store，手动调用updateData，观察响应式更新

### Phase 6: 集成WebSocket与Pinia Store

- [x] 在 `useWebSocket` 中调用 `onDataPush` 监听数据推送
- [x] 在推送回调中解析 `{ tag, value }` 消息:
  - 调用 `JSON.parse(value)` 解析数据
  - 根据tag类型转换value（Tag1Data | number | number[]）
  - 调用 `realtimeDataStore.updateData(tag, parsedValue)`
- [x] 添加错误处理，捕获JSON解析异常
- [x] 验证：订阅tag1后，检查store中tag1数据是否每秒更新

### Phase 7: 扩展HealthCheckView页面

- [x] 在 `frontend/src/views/HealthCheckView.vue` 的 `<script setup>` 中引入 `useWebSocket` 和 `useRealtimeDataStore`
- [x] 在 `onMounted` 生命周期钩子中调用 `subscribe(['tag1', 'tag2', 'tag3'])`
- [x] 在template中添加shadcn-vue Table组件显示tag1数据（一行，6列：ph, lh, czh, tlxh, zzwj, zzbh）
- [x] 在template中添加shadcn-vue Input组件显示tag2数据（单个数字，只读）
- [x] 在template中添加shadcn-vue Table组件显示tag3数据（6行1列，每行显示数组的一项）
- [x] 使用 `v-if` 或可选链处理数据为null时的占位显示
- [x] 保留原有的"Check Backend Health"按钮和功能
- [x] 验证：打开HealthCheckView页面，观察数据每秒更新

### Phase 8: 测试与调试

- [x] 测试：打开HealthCheckView，确认订阅成功并接收数据
- [x] 测试：手动断开网络或停止后端，确认前端显示连接断开状态
- [x] 测试：恢复网络或重启后端，确认前端自动重连并恢复数据推送
- [x] 测试：打开多个浏览器标签页，确认各自订阅独立管理
- [x] 测试：切换到其他页面再返回HealthCheckView，确认WebSocket连接保持不变
- [x] 调试：在浏览器DevTools Network标签查看WebSocket连接状态
- [x] 调试：在浏览器Console查看推送数据日志
- [x] 调试：在后端日志查看订阅管理和推送事件

### Phase 9: 代码审查与优化

- [x] 确保所有文件遵循项目代码风格（运行 `pnpm lint`）
- [x] 确保TypeScript类型检查通过（运行 `pnpm typecheck`）
- [x] 添加必要的注释说明WebSocket事件和订阅逻辑
- [x] 检查是否有内存泄漏（如未清理的事件监听器）
- [x] 优化：仅在有活跃连接时启动mockDataGenerator定时器
- [x] 优化：前端在组件卸载时取消订阅（如果需要）

### Phase 10: 文档与交付

- [x] 更新 `README.md` 或创建 `doc/websocket-integration.md` 说明WebSocket使用方法
- [x] 文档说明如何订阅新的tag（扩展性指南）
- [x] 文档说明如何在其他页面中使用实时数据
- [x] 确认所有任务完成，proposal中的Success Criteria已满足
- [x] 提交代码并请求Code Review

## Dependencies & Parallelization Notes

- **Phase 1** 必须首先完成（依赖安装和类型定义）
- **Phase 2-3** (后端) 和 **Phase 4-5** (前端) 可以并行开发
- **Phase 6** 依赖 Phase 4 和 Phase 5 完成
- **Phase 7** 依赖 Phase 6 完成
- **Phase 8-10** 必须在所有功能实现后进行

## Validation Points

每个Phase完成后，运行相应的验证步骤确保功能正确。关键验证点：

1. Phase 1后运行typecheck
2. Phase 3后测试后端推送
3. Phase 5后测试前端store
4. Phase 7后测试完整流程
5. Phase 9后运行lint和typecheck
