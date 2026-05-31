# alarm-area-access-control Specification Delta

## MODIFIED Requirements

### Requirement: 系统必须维护报警区域和用户区域授权关系

系统 SHALL 同时支持两种报警区域可见范围来源：普通用户继续使用持久化的 `user_area` 授权关系，而 `admin` 用户默认拥有全系统所有启用报警区域的可见范围，且该范围不依赖额外的 `user_area` 预配置。

#### Scenario: admin 查询自己的报警区域上下文时获得全部启用区域

- **GIVEN** 系统存在多个启用报警区域和至少一个已禁用报警区域
- **AND** 当前登录用户角色为 `admin`
- **WHEN** 客户端请求 `GET /api/users/me/alarm-areas`
- **THEN** 系统必须返回全部启用报警区域
- **AND** 系统不得要求该 `admin` 用户在 `user_area` 中预先维护覆盖全部区域的授权记录
- **AND** 返回的 `default_area_id` 必须属于本次返回的启用区域集合

#### Scenario: 普通用户查询自己的报警区域上下文时仍只获得已授权区域

- **GIVEN** 当前登录用户角色为 `user`
- **AND** 该用户仅被授权查看 `A区` 和 `B区`
- **WHEN** 客户端请求 `GET /api/users/me/alarm-areas`
- **THEN** 系统必须只返回该用户已授权的启用区域
- **AND** 系统不得因为引入 admin 全区域语义而扩大普通用户可见范围

### Requirement: 系统必须按授权区域过滤报警 REST 查询结果

系统 SHALL 在所有报警 REST 查询中根据当前登录用户的有效可见区域范围执行过滤；其中 `admin` 的默认范围为全部启用区域，普通用户的默认范围为自身已授权区域。

#### Scenario: admin 未显式指定 area_ids 时默认按全部启用区域查询

- **GIVEN** 当前登录用户角色为 `admin`
- **AND** 系统存在多个启用报警区域
- **WHEN** 客户端请求不带 `area_ids` 的 `GET /api/alarms` 或 `GET /api/alarms/summary`
- **THEN** 系统必须按全部启用报警区域范围返回结果
- **AND** 查询结果不得包含已禁用区域的数据

#### Scenario: admin 显式指定 area_ids 时只返回其子集结果

- **GIVEN** 当前登录用户角色为 `admin`
- **AND** 系统存在多个启用报警区域
- **WHEN** 客户端请求 `GET /api/alarms?area_ids=1,2`
- **THEN** 系统必须只返回这些启用区域子集内的报警数据
- **AND** 系统不得因为 admin 具备全区域权限而忽略显式传入的区域子集

#### Scenario: 普通用户请求未授权区域时仍不得越权返回数据

- **GIVEN** 当前登录用户角色为 `user`
- **AND** 该用户仅被授权查看 `A区`
- **WHEN** 客户端请求 `GET /api/alarms?area_ids=1,2`
- **THEN** 系统必须只返回该用户已授权区域内的数据
- **AND** 系统不得返回 `B区` 的报警记录

### Requirement: 系统必须按授权区域过滤报警 Socket 推送

系统 SHALL 在 Socket 连接建立后根据当前登录用户的有效可见区域范围加入报警区域房间，并且只向这些房间推送报警首屏快照、增量变化和汇总更新。

#### Scenario: admin 建立连接后加入全部启用区域房间并收到全局快照

- **GIVEN** 当前登录用户角色为 `admin`
- **AND** 系统存在多个启用报警区域
- **WHEN** 该用户建立报警 Socket 连接
- **THEN** 系统必须将该连接加入全部启用区域对应的报警房间
- **AND** 系统必须按全部启用区域范围发送 `alarm:snapshot`

#### Scenario: 普通用户建立连接后仍只加入自身授权区域房间

- **GIVEN** 当前登录用户角色为 `user`
- **AND** 该用户仅被授权查看 `A区`
- **WHEN** 该用户建立报警 Socket 连接
- **THEN** 系统必须只将该连接加入 `A区` 对应的报警房间
- **AND** 系统不得将该连接加入其他区域房间

### Requirement: 系统必须提供当前用户可见的区域定义列表

系统 SHALL 通过 `GET /api/alarm-areas` 返回当前登录用户可见且处于启用状态的报警区域定义；其中 admin 返回全部启用区域，普通用户返回自身可见区域。

#### Scenario: admin 查询区域定义列表时返回全部启用区域

- **GIVEN** 当前登录用户角色为 `admin`
- **AND** 系统存在多个报警区域，其中一部分已禁用
- **WHEN** 客户端请求 `GET /api/alarm-areas`
- **THEN** 系统必须返回全部启用区域定义
- **AND** 返回结果不得包含已禁用区域
