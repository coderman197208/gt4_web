# alarm-center-operations Specification

## Purpose

定义前端报警中心的数据展示、状态差异化显示和人工确认闭环，确保操作员能够稳定查看和处理本区域报警。

## ADDED Requirements

### Requirement: 系统必须向前端提供可直接驱动报警中心的标准字段

系统 SHALL 在报警列表、详情和 Socket 事件中返回统一字段集，使前端可以直接渲染报警中心，而不需要自行推断报警状态。

#### Scenario: 列表和推送都返回双状态字段

- **GIVEN** 前端通过 HTTP 或 Socket 接收报警数据
- **WHEN** 系统返回报警项
- **THEN** 每个报警项必须显式包含 `condition_state`
- **AND** 每个报警项必须显式包含 `ack_state`
- **AND** 每个报警项必须显式包含 `severity`、`area_name` 和 `version`

### Requirement: 系统必须区分未确认报警和已确认报警的展示状态

系统 SHALL 为报警中心提供明确的状态语义，使前端能够区分“活动未确认”“活动已确认”“恢复未确认”和“恢复已确认”四种显示状态。

#### Scenario: 活动未确认报警进入高优先级显示区

- **GIVEN** 某条报警 `condition_state = active` 且 `ack_state = unacked`
- **WHEN** 前端渲染报警中心
- **THEN** 该报警必须被视为待处理活动报警
- **AND** 该报警必须参与页头未确认数量统计

#### Scenario: 已恢复报警不得继续作为活动报警显示

- **GIVEN** 某条报警 `condition_state = cleared`
- **WHEN** 前端渲染活动报警列表
- **THEN** 该报警不得继续显示在活动报警区域
- **AND** 该报警只能出现在历史或已恢复视图中

### Requirement: 系统必须通过 HTTP 确认接口完成报警确认闭环

系统 SHALL 允许操作员从报警中心触发人工确认，并在确认成功后通过 HTTP 响应和 Socket 增量事件同步界面状态。

#### Scenario: 确认成功后界面切换为已确认状态

- **GIVEN** 操作员在报警中心选中一条未确认报警
- **WHEN** 前端调用 `POST /api/alarms/:id/ack` 且后端返回成功
- **THEN** 前端必须将该报警更新为 `ack_state = acked`
- **AND** 页头未确认数量必须同步减少

#### Scenario: 确认冲突后前端重新同步数据

- **GIVEN** 操作员提交确认时收到 `409` 冲突响应
- **WHEN** 前端处理该失败结果
- **THEN** 前端必须重新拉取当前报警详情和列表
- **AND** 前端不得继续使用冲突前的旧版本状态

### Requirement: 系统必须在连接建立后提供报警中心首屏快照

系统 SHALL 在认证连接建立后向前端推送 `alarm:snapshot`，用于报警中心和页头状态的首屏初始化。

#### Scenario: 重连成功后用快照恢复报警中心状态

- **GIVEN** 客户端因网络抖动发生 Socket 重连
- **WHEN** 连接恢复且服务端完成身份解析
- **THEN** 系统必须重新发送 `alarm:snapshot`
- **AND** 前端必须使用该快照恢复报警中心首屏状态
