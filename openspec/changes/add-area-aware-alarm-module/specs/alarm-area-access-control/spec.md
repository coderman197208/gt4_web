# alarm-area-access-control Specification

## Purpose

定义报警区域、用户区域授权以及区域级访问控制行为，确保报警数据不会超出用户授权范围暴露给前端。

## ADDED Requirements

### Requirement: 系统必须维护报警区域和用户区域授权关系

系统 SHALL 持久化报警区域定义和用户区域授权关系，并提供稳定的区域查询与授权写入接口。

#### Scenario: 当前用户能够查询自己的报警区域授权上下文

- **GIVEN** 某用户已登录且已配置报警区域授权
- **WHEN** 客户端请求 `GET /api/users/me/alarm-areas`
- **THEN** 系统必须返回该用户的 `default_area_id`
- **AND** 系统必须返回该用户可访问的全部 `areas`

#### Scenario: 管理员能够整组替换用户区域授权

- **GIVEN** 管理员准备为某个用户配置新的报警区域集合
- **WHEN** 管理员请求 `PUT /api/users/:userId/alarm-areas`
- **THEN** 系统必须按请求体中的 `area_ids` 整组替换该用户的区域授权关系
- **AND** 系统必须保证 `default_area_id` 属于该用户新的授权区域集合

### Requirement: 系统必须按授权区域过滤报警 REST 查询结果

系统 SHALL 在所有报警相关 REST 查询中按当前用户的授权区域执行过滤，不得返回未授权区域的报警数据。

#### Scenario: 查询参数请求未授权区域时不得越权返回数据

- **GIVEN** 当前用户仅授权查看 `A区`
- **WHEN** 客户端请求 `GET /api/alarms?area_ids=1,2`
- **THEN** 系统必须只返回当前用户有权访问的区域数据
- **AND** 系统不得返回 `B区` 的报警记录

#### Scenario: 未显式指定区域时默认按全部授权区域查询

- **GIVEN** 当前用户同时授权查看 `A区` 和 `B区`
- **WHEN** 客户端请求不带 `area_ids` 的报警查询接口
- **THEN** 系统必须默认按该用户全部授权区域范围执行查询

### Requirement: 系统必须按授权区域过滤报警 Socket 推送

系统 SHALL 在 Socket 连接建立后根据用户区域授权加入对应的区域房间，并只向这些房间推送报警事件。

#### Scenario: 连接建立后仅加入授权区域房间

- **GIVEN** 某用户仅授权查看 `A区`
- **WHEN** 该用户建立 Socket 连接
- **THEN** 系统必须只将该连接加入 `alarm-area:A区` 对应的房间
- **AND** 系统不得将该连接加入其他区域房间

#### Scenario: 未授权区域报警变化时不得向该用户推送

- **GIVEN** 某用户未被授权查看 `B区`
- **WHEN** `B区` 发生报警新增、恢复或确认
- **THEN** 系统不得向该用户连接发送对应的 `alarm:upsert` 或 `alarm:summary` 事件

### Requirement: 系统必须提供当前用户可见的区域定义列表

系统 SHALL 通过 `GET /api/alarm-areas` 返回当前用户有权访问且处于启用状态的报警区域定义。

#### Scenario: 查询区域列表时只返回启用且可见的区域

- **GIVEN** 系统存在多个报警区域，其中一部分已禁用
- **AND** 当前用户仅被授权其中两个启用区域
- **WHEN** 客户端请求 `GET /api/alarm-areas`
- **THEN** 系统必须只返回这两个启用且可见的区域
- **AND** 返回结果必须包含 `area_code`、`area_name`、`sort_order` 和 `enabled`
