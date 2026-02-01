# websocket-realtime-data Specification

## Purpose

TBD - created by archiving change add-websocket-realtime-data. Update Purpose after archive.

## Requirements

### Requirement: WebSocket连接建立与生命周期管理

系统 SHALL 支持前端与后端之间建立WebSocket连接，并在连接断开时自动重连，确保实时数据通道的持久性。

#### Scenario: 前端成功建立WebSocket连接

- **GIVEN** 后端WebSocket服务器正在运行
- **WHEN** 前端应用加载并初始化WebSocket客户端
- **THEN** 前端应成功连接到后端 `ws://localhost:3000`（或配置的地址）
- **AND** 前端连接状态应更新为 `connected: true`
- **AND** 后端应记录新连接的Socket ID

#### Scenario: 连接断开后自动重连

- **GIVEN** 前端已建立WebSocket连接
- **WHEN** 网络中断或后端服务重启导致连接断开
- **THEN** 前端应自动尝试重新连接
- **AND** 重连策略应使用指数退避（初始延迟1秒，最大延迟5秒）
- **AND** 重连成功后，前端连接状态应恢复为 `connected: true`

#### Scenario: 所有前端页面共享同一WebSocket连接

- **GIVEN** 前端应用已加载
- **WHEN** 用户在不同页面（如HealthCheckView、其他视图）之间切换
- **THEN** 所有页面应使用同一个WebSocket连接实例
- **AND** 连接不应因路由切换而断开或重建

### Requirement: 前端数据标签订阅机制

系统 SHALL 允许前端页面通过WebSocket向后端发送订阅请求，指定需要接收的数据标签（tags）列表。

#### Scenario: HealthCheckView订阅tag1、tag2、tag3

- **GIVEN** 前端WebSocket连接已建立
- **WHEN** HealthCheckView组件挂载（`onMounted`）
- **THEN** 组件应调用订阅API `subscribe(['tag1', 'tag2', 'tag3'])`
- **AND** 前端应通过WebSocket发送 `subscribe` 事件，消息格式为 `{ tags: ['tag1', 'tag2', 'tag3'] }`
- **AND** 后端应接收并保存该连接订阅的标签列表

#### Scenario: 重连后重新订阅

- **GIVEN** 前端之前已订阅 `['tag1', 'tag2', 'tag3']`
- **WHEN** 连接断开后重新连接成功
- **THEN** 前端应自动重新发送订阅请求
- **AND** 后端应用新的订阅列表全量替换之前的订阅

#### Scenario: 订阅请求全量替换而非追加

- **GIVEN** 某连接当前订阅了 `['tag1', 'tag2']`
- **WHEN** 该连接发送新的订阅请求 `{ tags: ['tag3'] }`
- **THEN** 后端应将该连接的订阅列表替换为 `['tag3']`
- **AND** 后端不应保留之前的 `tag1` 和 `tag2` 订阅

### Requirement: 后端订阅列表管理

系统 SHALL 在后端维护每个WebSocket连接的订阅标签列表，支持添加连接、更新订阅、移除连接操作。

#### Scenario: 后端保存新连接的订阅列表

- **GIVEN** 一个新的WebSocket连接已建立，Socket ID为 `socket-123`
- **WHEN** 后端接收到来自该连接的订阅请求 `{ tags: ['tag1', 'tag2'] }`
- **THEN** 后端应在订阅管理器中保存 `socket-123 -> Set(['tag1', 'tag2'])`
- **AND** 后端应能根据标签查询订阅者（如查询订阅了 `tag1` 的所有连接）

#### Scenario: 连接断开时清理订阅列表

- **GIVEN** 连接 `socket-123` 订阅了 `['tag1', 'tag2', 'tag3']`
- **WHEN** 该连接断开（`disconnect` 事件）
- **THEN** 后端应从订阅管理器中移除 `socket-123` 及其订阅列表
- **AND** 后续查询订阅者时，不应包含已断开的连接

#### Scenario: 查询订阅了特定标签的所有连接

- **GIVEN** 连接 `socket-1` 订阅了 `['tag1', 'tag3']`
- **AND** 连接 `socket-2` 订阅了 `['tag1', 'tag2']`
- **WHEN** 后端查询订阅了 `tag1` 的连接
- **THEN** 应返回 `['socket-1', 'socket-2']`

### Requirement: 后端数据推送机制

系统 SHALL 按照订阅列表向前端推送实时数据，数据格式为JSON字符串，包含标签名和数据值。

#### Scenario: 后端向订阅者推送tag1数据

- **GIVEN** 连接 `socket-1` 订阅了 `['tag1']`
- **WHEN** 后端模拟数据生成器更新tag1数据
- **THEN** 后端应向 `socket-1` 发送 `data:push` 事件
- **AND** 消息格式应为 `{ tag: 'tag1', value: '{"ph":"123456","lh":"12345678","czh":"3456","tlxh":1,"zzwj":139.7,"zzbh":5}' }`

#### Scenario: 后端仅向订阅者推送数据

- **GIVEN** 连接 `socket-1` 订阅了 `['tag1']`
- **AND** 连接 `socket-2` 订阅了 `['tag2']`
- **WHEN** 后端更新tag1数据并推送
- **THEN** 应仅向 `socket-1` 推送tag1数据
- **AND** 不应向 `socket-2` 推送tag1数据

#### Scenario: 推送消息中value为JSON字符串

- **GIVEN** tag1数据为 `{ ph: '123456', lh: '12345678', czh: '3456', tlxh: 1, zzwj: 139.7, zzbh: 5 }`
- **WHEN** 后端向订阅者推送tag1数据
- **THEN** 消息的 `value` 字段应为该对象的JSON字符串表示
- **AND** 前端接收后需调用 `JSON.parse(value)` 解析

### Requirement: 后端模拟数据生成器

系统 SHALL 提供模拟数据生成器，初始化tag1、tag2、tag3数据，并每秒递增字段值后推送给订阅者。

#### Scenario: 初始化模拟数据

- **GIVEN** 后端服务启动
- **WHEN** 模拟数据生成器初始化
- **THEN** tag1应初始化为 `{ ph: '123456', lh: '12345678', czh: '3456', tlxh: 1, zzwj: 139.7, zzbh: 5 }`
- **AND** tag2应初始化为 `10`
- **AND** tag3应初始化为 `[1, 2, 3, 4, 5, 6]`

#### Scenario: 每秒更新并推送tag1数据

- **GIVEN** tag1当前值为 `{ ..., tlxh: 1, ... }`
- **WHEN** 1秒后定时器触发
- **THEN** tag1的 `tlxh` 字段应递增为 `2`
- **AND** 后端应查询订阅了 `tag1` 的所有连接
- **AND** 向这些连接推送更新后的tag1数据

#### Scenario: 每秒更新并推送tag2数据

- **GIVEN** tag2当前值为 `10`
- **WHEN** 1秒后定时器触发
- **THEN** tag2值应递增为 `11`
- **AND** 后端应向订阅了 `tag2` 的连接推送 `{ tag: 'tag2', value: '11' }`

#### Scenario: 每秒更新并推送tag3数组数据

- **GIVEN** tag3当前值为 `[1, 2, 3, 4, 5, 6]`
- **WHEN** 1秒后定时器触发
- **THEN** tag3每一项应递增为 `[2, 3, 4, 5, 6, 7]`
- **AND** 后端应向订阅了 `tag3` 的连接推送更新后的数组（JSON字符串格式）

### Requirement: 前端接收并处理推送数据

系统 SHALL 在前端监听 `data:push` 事件，解析数据并更新到Pinia store，触发UI响应式更新。

#### Scenario: 前端接收tag1推送数据并更新store

- **GIVEN** 前端已订阅tag1
- **WHEN** 后端推送 `{ tag: 'tag1', value: '{"ph":"123456","lh":"12345678","czh":"3456","tlxh":5,"zzwj":139.7,"zzbh":5}' }`
- **THEN** 前端应调用 `JSON.parse(value)` 解析为Tag1Data对象
- **AND** 调用 `realtimeDataStore.updateData('tag1', parsedData)`
- **AND** store中 `tag1` 状态应更新为解析后的数据

#### Scenario: 前端接收tag2推送数据

- **GIVEN** 前端已订阅tag2
- **WHEN** 后端推送 `{ tag: 'tag2', value: '15' }`
- **THEN** 前端应解析 `value` 为数字 `15`
- **AND** 更新store中 `tag2` 为 `15`

#### Scenario: 前端接收tag3推送数据

- **GIVEN** 前端已订阅tag3
- **WHEN** 后端推送 `{ tag: 'tag3', value: '[10,11,12,13,14,15]' }`
- **THEN** 前端应解析 `value` 为数字数组 `[10,11,12,13,14,15]`
- **AND** 更新store中 `tag3` 为该数组

#### Scenario: 前端处理无效推送数据

- **GIVEN** 前端接收到推送消息
- **WHEN** `value` 字段不是有效的JSON字符串
- **THEN** 前端应捕获 `JSON.parse` 异常
- **AND** 记录错误日志或忽略该消息
- **AND** 不应导致应用崩溃

### Requirement: TypeScript类型定义

系统 SHALL 在共享包中定义所有WebSocket消息类型和数据标签类型，确保前后端类型一致。

#### Scenario: Tag1Data类型定义

- **GIVEN** 需要定义tag1的数据结构
- **THEN** 应在 `packages/shared/src/types.ts` 中定义接口:

```typescript
export interface Tag1Data {
  ph: string;
  lh: string;
  czh: string;
  tlxh: number;
  zzwj: number;
  zzbh: number;
}
```

#### Scenario: Tag2和Tag3类型定义

- **GIVEN** 需要定义tag2和tag3的数据结构
- **THEN** 应定义:

```typescript
export type Tag2Data = number;
export type Tag3Data = number[]; // 长度为6
```

#### Scenario: WebSocket消息格式定义

- **GIVEN** 需要定义订阅请求和推送消息格式
- **THEN** 应定义:

```typescript
export interface SubscribeRequest {
  tags: string[];
}

export interface DataPushMessage {
  tag: string;
  value: string; // JSON字符串
}
```
