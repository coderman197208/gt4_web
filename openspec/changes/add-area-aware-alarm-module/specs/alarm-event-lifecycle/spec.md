# alarm-event-lifecycle Specification

## Purpose

定义报警事件的持久化生命周期、固定 REST 接口、Socket 推送语义以及活动报警归并规则，确保报警从产生到恢复、确认、查询和同步都有稳定契约。

## ADDED Requirements

### Requirement: 系统必须持久化报警主状态和操作历史

系统 SHALL 在持久化层维护活动报警主记录和追加式报警操作日志；报警产生、恢复和人工确认都必须落库，并保留对应的时间戳和操作者信息。

#### Scenario: 新报警产生时创建活动报警并追加 raise 日志

- **GIVEN** C++ 业务后端发布一个新的 `raise` 报警事件，且该 `dedupe_key` 当前不存在活动报警
- **WHEN** Web 后端完成报警处理
- **THEN** 系统必须写入一条活动报警主记录
- **AND** 该记录的 `condition_state` 必须为 `active`
- **AND** 该记录的 `ack_state` 必须为 `unacked`
- **AND** 系统必须追加一条 `raise` 操作日志

#### Scenario: 报警恢复时保留确认状态并追加 clear 日志

- **GIVEN** 某条报警当前处于活动状态
- **WHEN** Web 后端收到对应的 `clear` 报警事件
- **THEN** 系统必须将该报警的 `condition_state` 更新为 `cleared`
- **AND** 系统必须记录 `cleared_at`
- **AND** 系统不得自动重置该报警已有的 `ack_state`
- **AND** 系统必须追加一条 `clear` 操作日志

#### Scenario: 人工确认时更新确认字段并追加 ack 日志

- **GIVEN** 某条报警当前 `ack_state` 为 `unacked`
- **WHEN** 有权限的用户执行确认操作
- **THEN** 系统必须将该报警的 `ack_state` 更新为 `acked`
- **AND** 系统必须写入 `acked_at`、`acked_by_user_id` 和 `acked_by_name`
- **AND** 系统必须追加一条 `ack` 操作日志

### Requirement: 系统必须按 dedupe_key 归并活动报警

系统 SHALL 以 `dedupe_key` 作为活动报警唯一键；同一 `dedupe_key` 在活动状态下重复触发时必须归并到同一条活动报警，而不是新建第二条活动报警。

#### Scenario: 活动报警重复触发时不得产生第二条活动记录

- **GIVEN** 某个 `dedupe_key` 已存在一条活动报警
- **WHEN** Web 后端再次收到同一 `dedupe_key` 的 `raise` 事件
- **THEN** 系统不得创建第二条活动报警记录
- **AND** 系统必须更新原记录的 `last_occurred_at`
- **AND** 系统必须追加新的 `raise` 操作日志

#### Scenario: 已恢复报警再次触发时重新打开原记录

- **GIVEN** 某条报警记录当前 `condition_state` 为 `cleared`
- **WHEN** Web 后端再次收到相同 `dedupe_key` 的 `raise` 事件
- **THEN** 系统必须复用原报警记录而不是创建新记录
- **AND** 系统必须将 `condition_state` 重新更新为 `active`
- **AND** 系统必须将 `ack_state` 重置为 `unacked`
- **AND** 系统必须将 `reopen_count` 加 `1`

### Requirement: 系统必须提供固定的报警查询 REST 契约

系统 SHALL 提供固定路径和固定字段结构的报警查询接口，包括 `GET /api/alarms/summary`、`GET /api/alarms` 和 `GET /api/alarms/:id`。

#### Scenario: 汇总接口返回活动数和未确认数

- **GIVEN** 当前用户拥有至少一个报警区域授权
- **WHEN** 客户端请求 `GET /api/alarms/summary`
- **THEN** 系统必须返回 `server_time`、`total_active`、`total_unacked` 和 `highest_severity`
- **AND** 系统必须返回按严重级别统计的 `by_severity`
- **AND** 系统必须返回按区域统计的 `by_area`

#### Scenario: 列表接口返回可筛选的分页结果

- **GIVEN** 当前用户请求 `GET /api/alarms?scope=history&page=1&page_size=50`
- **WHEN** 系统完成查询
- **THEN** 响应必须包含 `items`、`page`、`page_size` 和 `total`
- **AND** 每个列表项都必须包含 `condition_state`、`ack_state`、`severity` 和 `version`

#### Scenario: 详情接口返回报警详情和操作历史

- **GIVEN** 当前用户对某条报警有查看权限
- **WHEN** 客户端请求 `GET /api/alarms/:id`
- **THEN** 系统必须返回 `alarm` 对象
- **AND** 系统必须返回按时间倒序排列的 `logs` 集合

### Requirement: 系统必须提供固定的报警确认 REST 契约

系统 SHALL 通过 `POST /api/alarms/:id/ack` 执行人工确认，并使用 `expected_version` 进行乐观并发控制。

#### Scenario: 版本匹配时确认成功

- **GIVEN** 某条报警当前版本号为 `3`
- **AND** 用户提交 `expected_version = 3`
- **WHEN** 客户端请求 `POST /api/alarms/:id/ack`
- **THEN** 系统必须完成确认写入
- **AND** 响应必须返回最新的 `ack_state`、`acked_at`、`acked_by_name` 和递增后的 `version`

#### Scenario: 版本冲突时返回 409

- **GIVEN** 某条报警在客户端提交前已被其他人更新到版本 `4`
- **WHEN** 客户端仍提交 `expected_version = 3`
- **THEN** 系统必须拒绝本次确认
- **AND** 系统必须返回 `409` 冲突状态

### Requirement: 系统必须通过固定 Socket 事件推送报警变化

系统 SHALL 通过固定名称的 Socket 事件向前端推送报警变化，至少包括 `alarm:snapshot`、`alarm:upsert`、`alarm:summary` 和 `alarm:resync-required`。

#### Scenario: 建立连接后发送快照事件

- **GIVEN** 客户端已通过认证建立 Socket 连接
- **WHEN** 服务端完成区域授权解析
- **THEN** 系统必须先发送一次 `alarm:snapshot`
- **AND** 该事件必须包含 `summary` 和 `active_items`

#### Scenario: 报警状态变化后发送增量更新事件

- **GIVEN** 某条报警发生 `raise`、`clear`、`ack` 或 `reopen`
- **WHEN** 服务端完成持久化更新
- **THEN** 系统必须发送 `alarm:upsert`
- **AND** 该事件必须包含变化原因 `reason`
- **AND** 系统必须同步发送最新的 `alarm:summary`
