# realtime-data-store Specification

## Purpose
TBD - created by archiving change add-websocket-realtime-data. Update Purpose after archive.
## Requirements
### Requirement: Pinia Store状态结构

系统 SHALL 提供名为 `useRealtimeDataStore` 的Pinia store，包含tag1、tag2、tag3的状态字段。

#### Scenario: Store初始状态

- **GIVEN** 应用启动并创建realtimeDataStore
- **WHEN** store初始化
- **THEN** state应包含以下字段:
  - `tag1: Tag1Data | null` (初始值为 `null`)
  - `tag2: number | null` (初始值为 `null`)
  - `tag3: number[] | null` (初始值为 `null`)

#### Scenario: Store提供TypeScript类型安全

- **GIVEN** 前端代码使用store
- **WHEN** 访问 `realtimeDataStore.tag1`
- **THEN** TypeScript应推断类型为 `Tag1Data | null`
- **AND** 编辑器应提供字段自动补全（如 `tag1.ph`, `tag1.tlxh`）

### Requirement: 更新实时数据

系统 SHALL 提供 `updateData` action，根据tag名称更新对应的状态字段。

#### Scenario: 更新tag1数据

- **GIVEN** WebSocket接收到tag1推送数据 `{ ph: '123456', lh: '12345678', czh: '3456', tlxh: 10, zzwj: 139.7, zzbh: 5 }`
- **WHEN** 调用 `realtimeDataStore.updateData('tag1', data)`
- **THEN** store的 `tag1` 字段应更新为该数据对象
- **AND** 所有使用 `tag1` 的组件应自动响应式更新

#### Scenario: 更新tag2数据

- **GIVEN** WebSocket接收到tag2推送数据 `20`
- **WHEN** 调用 `realtimeDataStore.updateData('tag2', 20)`
- **THEN** store的 `tag2` 字段应更新为 `20`

#### Scenario: 更新tag3数据

- **GIVEN** WebSocket接收到tag3推送数据 `[5, 6, 7, 8, 9, 10]`
- **WHEN** 调用 `realtimeDataStore.updateData('tag3', [5, 6, 7, 8, 9, 10])`
- **THEN** store的 `tag3` 字段应更新为该数组

#### Scenario: 更新未知tag时忽略或记录日志

- **GIVEN** WebSocket接收到未定义的tag `tag99`
- **WHEN** 调用 `realtimeDataStore.updateData('tag99', someData)`
- **THEN** store应忽略该更新或记录警告日志
- **AND** 不应导致运行时错误

### Requirement: 响应式数据访问

系统 SHALL 支持在Vue组件中响应式访问store中的实时数据。

#### Scenario: HealthCheckView响应式显示tag1数据

- **GIVEN** HealthCheckView组件使用 `const store = useRealtimeDataStore()`
- **WHEN** store的 `tag1` 数据更新
- **THEN** 组件中使用 `store.tag1` 的表格应自动更新显示
- **AND** 无需手动调用 `forceUpdate` 或其他刷新方法

#### Scenario: 组件访问null状态时不崩溃

- **GIVEN** store的 `tag1` 当前为 `null`（尚未收到推送数据）
- **WHEN** 组件尝试访问 `store.tag1?.ph`
- **THEN** 应返回 `undefined` 而不抛出异常
- **AND** 组件可选显示占位符或"等待数据"提示

