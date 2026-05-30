# alarm-cpp-publisher-contract Specification

## Purpose

定义 `gt4_app` 中统一报警发布模块的职责边界、请求模型和 Redis 发布契约，确保各 C++ 业务模块通过同一套接口发布报警，而不是分散拼装 JSON 或直接操作 Redis。

## ADDED Requirements

### Requirement: 系统必须提供统一的 C++ 报警发布抽象

系统 SHALL 在 `gt4_app` 中提供共享 `AlarmPublisher` 抽象，业务模块只能通过该抽象执行报警产生和报警清除，不应各自拼装报警事件 JSON 或直接向 `AlarmChanged` 频道发布消息。

#### Scenario: 业务模块通过统一入口发布 raise 事件

- **GIVEN** 某个 C++ 业务模块检测到需要上报的报警条件
- **WHEN** 该模块调用 `AlarmPublisher` 的 `Raise` 能力并提交 `AlarmRaiseRequest`
- **THEN** 发布模块必须负责生成固定的 Redis 事件键和事件载荷
- **AND** 调用方不得感知 Redis 键名、频道名或 JSON 字段排列细节

#### Scenario: 业务模块通过统一入口发布 clear 事件

- **GIVEN** 某个已上报报警的业务条件已经恢复
- **WHEN** 该模块调用 `AlarmPublisher` 的 `Clear` 能力并提交 `AlarmClearRequest`
- **THEN** 发布模块必须按固定的 `clear` 事件契约输出报警事件
- **AND** 调用方只需要提供清除所需的稳定业务字段

### Requirement: 系统必须固定 AlarmRaiseRequest 和 AlarmClearRequest 的最小字段语义

系统 SHALL 为 C++ 侧报警发布契约定义固定的请求模型，使不同业务模块对同一报警事件使用一致字段语义。

#### Scenario: Raise 请求包含固定最小字段

- **GIVEN** 调用方向发布模块提交 `AlarmRaiseRequest`
- **WHEN** 发布模块执行序列化
- **THEN** 请求必须至少包含 `alarmCode`、`areaCode`、`severity`、`sourceModule`、`sourceKey`、`title`、`message`、`detailJson`、`requireAck`、`autoClear`、`dedupeKey` 和 `occurredAt`
- **AND** `severity` 的序列化值必须限定为 `critical | major | minor | warning | info`
- **AND** `occurredAt` 必须序列化为 UTC ISO 8601 时间字符串

#### Scenario: Clear 请求包含稳定标识字段并保持事件可自描述

- **GIVEN** 调用方向发布模块提交 `AlarmClearRequest`
- **WHEN** 发布模块执行清除事件序列化
- **THEN** 请求必须至少包含 `alarmCode`、`areaCode`、`sourceModule`、`sourceKey`、`dedupeKey` 和 `occurredAt`
- **AND** 请求可以附带 `severity`、`title`、`message` 和 `detailJson` 作为恢复时的最后业务快照
- **AND** 发布模块必须保证最终发出的 `clear` 事件仍满足固定 Redis 载荷结构

### Requirement: 系统必须通过固定 Redis 键和频道发布报警事件

系统 SHALL 使用固定的 Redis 键、频道和最小事件载荷发布报警变化，确保 Web 后端只需要对接一套稳定协议。

#### Scenario: Raise 事件先写事件键再发布唯一键通知

- **GIVEN** 发布模块收到一个有效的 `AlarmRaiseRequest`
- **WHEN** 发布模块执行报警发布
- **THEN** 系统必须先将序列化后的事件写入 `alarm:event:<dedupe_key>`
- **AND** 系统必须再向 `AlarmChanged` 频道发布该事件的唯一键
- **AND** 事件载荷必须至少包含 `alarmCode`、`areaCode`、`severity`、`sourceModule`、`sourceKey`、`title`、`message`、`detailJson`、`dedupeKey`、`occurredAt` 和 `eventType = raise`

#### Scenario: Clear 事件沿用同一唯一键和载荷结构

- **GIVEN** 发布模块收到一个有效的 `AlarmClearRequest`
- **WHEN** 发布模块执行报警清除发布
- **THEN** 系统必须将 `eventType` 固定写为 `clear`
- **AND** 系统必须沿用同一 `dedupeKey` 对应的事件键命名规则
- **AND** 发布到 `AlarmChanged` 的通知消息仍必须是该事件的唯一键

### Requirement: 系统必须让发布失败对调用方可见

系统 SHALL 将 Redis 序列化、写键或发频道失败视为显式发布失败，不得静默吞掉错误。

#### Scenario: Redis 写入或发布失败时返回失败结果并记录上下文

- **GIVEN** 发布模块在处理报警请求时遇到 Redis 写入失败、发布失败或序列化异常
- **WHEN** 当前调用结束
- **THEN** `AlarmPublisher` 必须向调用方返回失败结果
- **AND** 系统必须记录至少包含 `alarmCode`、`sourceModule` 和 `dedupeKey` 的错误上下文
- **AND** 系统不得把这次失败误报为成功发布
