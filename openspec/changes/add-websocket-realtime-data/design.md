# Design: WebSocket Real-Time Data Subscription and Push

## Architecture Overview

```
┌──────────────────────────────────────────────┐
│             Frontend (Vue + Pinia)           │
│  ┌────────────────────────────────────────┐  │
│  │  HealthCheckView (订阅tag1,tag2,tag3) │  │
│  └─────────────┬──────────────────────────┘  │
│                │ subscribe(['tag1'...])       │
│  ┌─────────────▼──────────────────────────┐  │
│  │    WebSocket Service (Composable)      │  │
│  │   - 管理Socket.IO连接                   │  │
│  │   - 自动重连                            │  │
│  │   - 发送订阅请求                        │  │
│  │   - 接收数据推送                        │  │
│  └─────────────┬──────────────────────────┘  │
│                │ emit 'data:push'             │
│  ┌─────────────▼──────────────────────────┐  │
│  │   Realtime Data Store (Pinia)          │  │
│  │   state: {                              │  │
│  │     tag1: Tag1Data | null               │  │
│  │     tag2: number | null                 │  │
│  │     tag3: number[] | null               │  │
│  │   }                                     │  │
│  └────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────┘
                   │ Socket.IO Client
                   │
┌──────────────────▼───────────────────────────┐
│          Backend (Fastify + Socket.IO)       │
│  ┌────────────────────────────────────────┐  │
│  │     Socket.IO Server Plugin            │  │
│  │   - 管理连接生命周期                    │  │
│  │   - 监听 'subscribe' 事件               │  │
│  │   - 保存每个连接的订阅列表              │  │
│  └─────────────┬──────────────────────────┘  │
│                │                              │
│  ┌─────────────▼──────────────────────────┐  │
│  │    Subscription Manager                │  │
│  │    Map<SocketId, Set<string>>          │  │
│  │   - addConnection()                    │  │
│  │   - updateSubscriptions()  (替换)      │  │
│  │   - removeConnection()                 │  │
│  │   - getSubscribers(tag)                │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │    Mock Data Generator                 │  │
│  │   - 初始化tag1, tag2, tag3             │  │
│  │   - 每秒更新数据                        │  │
│  │   - 查询订阅者并推送                    │  │
│  └────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘
```

## Technology Decisions

### 1. WebSocket库选择: Socket.IO

**决策**: 使用Socket.IO而非原生WebSocket

**理由**:

- 项目已在project.md中明确要求使用Socket.IO
- 自动处理重连、心跳检测
- 支持事件驱动编程模型，简化订阅-推送逻辑
- 前后端一致的API设计

### 2. 前端连接管理: Vue Composable模式

**决策**: 创建 `useWebSocket` composable提供全局单例连接

**理由**:

- 符合Vue 3 Composition API最佳实践
- 便于在任意组件中使用（如HealthCheckView）
- 提供响应式连接状态（connected, error）
- 封装重连逻辑和订阅API

**接口设计**:

```typescript
export function useWebSocket() {
  const isConnected = ref(false);
  const error = ref<string | null>(null);

  function subscribe(tags: string[]): void;
  function onDataPush(callback: (data: DataPushMessage) => void): void;

  return { isConnected, error, subscribe, onDataPush };
}
```

### 3. 前端数据管理: Pinia Store

**决策**: 创建 `useRealtimeDataStore` 管理推送数据

**理由**:

- 集中管理所有tag的实时数据
- 响应式更新，自动同步到UI
- 便于跨组件共享数据
- 支持类型安全的数据访问

**状态结构**:

```typescript
interface RealtimeDataState {
  tag1: Tag1Data | null;
  tag2: number | null;
  tag3: number[] | null;
}
```

### 4. 后端订阅管理: In-Memory Map

**决策**: 使用 `Map<string, Set<string>>` 保存订阅关系

**理由**:

- 简单高效，适合MVP阶段
- 连接断开时自动清理
- 支持快速查询某个tag的订阅者
- 后期可扩展为Redis存储

**接口设计**:

```typescript
class SubscriptionManager {
  private subscriptions = new Map<string, Set<string>>();

  addConnection(socketId: string): void;
  updateSubscriptions(socketId: string, tags: string[]): void; // 全量替换
  removeConnection(socketId: string): void;
  getSubscribers(tag: string): string[]; // 返回订阅了该tag的socketId列表
}
```

### 5. 后端数据生成: 定时器 + 推送

**决策**: 使用 `setInterval` 每秒更新数据并推送

**理由**:

- 满足测试需求，无需外部数据源
- 简单直观，便于调试
- 推送前查询订阅列表，避免无效推送

**推送逻辑**:

```typescript
setInterval(() => {
  // 更新tag1, tag2, tag3数据
  updateMockData();

  // 对每个tag，查询订阅者并推送
  ['tag1', 'tag2', 'tag3'].forEach((tag) => {
    const subscribers = subscriptionManager.getSubscribers(tag);
    subscribers.forEach((socketId) => {
      io.to(socketId).emit('data:push', { tag, value: getData(tag) });
    });
  });
}, 1000);
```

### 6. 数据类型定义: Shared Package

**决策**: 在 `packages/shared/src/types.ts` 中定义所有WebSocket消息类型

**理由**:

- 前后端类型一致，避免不匹配
- TypeScript类型检查提高可靠性
- 便于维护和扩展

**类型定义**:

```typescript
// Tag数据类型
export interface Tag1Data {
  ph: string;
  lh: string;
  czh: string;
  tlxh: number;
  zzwj: number;
  zzbh: number;
}

export type Tag2Data = number;
export type Tag3Data = number[]; // 长度固定为6

// WebSocket消息格式
export interface SubscribeRequest {
  tags: string[];
}

export interface DataPushMessage {
  tag: string;
  value: string; // JSON字符串，需解析为Tag1Data | Tag2Data | Tag3Data
}
```

## Reconnection Strategy

**前端重连机制** (Socket.IO默认提供):

- 断开后自动尝试重连
- 指数退避策略（初始1s，最大5s）
- 重连成功后触发 `connect` 事件

**订阅恢复与清理**:

- 每次连接成功后，前端重新发送当前订阅列表
- 后端收到订阅请求后全量替换订阅列表
- **页面切换时清理订阅**：
  - 需要订阅的页面（如 HealthCheckView）在 `onMounted` 时订阅，在 `onUnmounted` 时取消订阅（发送空数组）
  - 不需要订阅的页面（如 ApiDemoView、LoginView）在 `onMounted` 时发送空数组清空订阅
  - 这样确保切换到不需要订阅的页面时，后端停止推送数据

## Data Flow Sequence

### 订阅流程

```
HealthCheckView
    │
    │ onMounted()
    ▼
subscribe(['tag1', 'tag2', 'tag3'])
    │
    ▼
WebSocket Service
    │
    │ emit('subscribe', { tags: [...] })
    ▼
Backend Socket.IO Handler
    │
    ▼
SubscriptionManager.updateSubscriptions(socketId, tags)
    │
    │ 替换订阅列表
    ▼
Map { socketId => Set(['tag1', 'tag2', 'tag3']) }
```

### 取消订阅流程（页面切换时）

```
HealthCheckView (onUnmounted) / ApiDemoView (onMounted)
    │
    │ subscribe([])  // 发送空数组清空订阅
    ▼
WebSocket Service
    │
    │ emit('subscribe', { tags: [] })
    ▼
Backend Socket.IO Handler
    │
    ▼
SubscriptionManager.updateSubscriptions(socketId, [])
    │
    │ 清空订阅列表
    ▼
Map { socketId => Set() }  // 空集合，不再接收任何推送
```

### 推送流程

```
Mock Data Generator (定时器)
    │
    │ 每秒更新数据
    ▼
subscriptionManager.getSubscribers('tag1')
    │
    │ 返回订阅了tag1的socketId列表
    ▼
io.to(socketId).emit('data:push', { tag: 'tag1', value: JSON.stringify(data) })
    │
    ▼
WebSocket Service (前端)
    │
    │ on('data:push', handler)
    ▼
realtimeDataStore.updateData(tag, JSON.parse(value))
    │
    ▼
HealthCheckView (响应式更新)
```

## Error Handling

- **连接失败**: 前端显示错误提示，自动重连
- **订阅失败**: 后端记录错误日志，前端可选显示
- **数据解析失败**: 前端捕获JSON解析异常，忽略无效数据
- **后端推送异常**: 捕获并记录日志，不影响其他连接

## Testing Considerations

- 前端手动断开连接，验证自动重连
- HealthCheckView订阅后，观察1秒1次的数据更新
- 打开多个浏览器标签页，验证各自订阅独立管理
- 后端日志验证订阅列表的添加、替换、删除逻辑
