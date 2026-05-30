## Context

GT4 当前的实时数据链路是围绕 tag 订阅建立的：C++ 程序把最新值写入 Redis，并向 `RealDataChanged` 频道发布 tag 名称，Node.js 后端再读取该 tag 的当前值并通过 Socket.IO 的 `data:push` 事件推送给前端。当前的操作命令链路也已稳定运行：前端通过 WebSocket 发送 `cmd:push`，后端把命令序列化后发布到 Redis `operation_cmd` 频道，由 C++ 命令监听模块解析并执行。

报警需求虽然可以复用 Redis、Socket.IO 和共享类型这些现有基础设施，但不能直接复用现有 tag 模型。报警不是简单的 key-value 实时值，而是具备生命周期的事件记录：它需要表达报警何时产生、是否仍然有效、是否已经人工确认、由谁确认，以及历史上发生过哪些操作。当前前端 `realtimeData` store 和后端 `data:push` 语义都不适合承载这一类有状态、可审计、可筛选的事件数据。

此外，当前登录上下文只有基础用户信息，没有区域授权字段，前端登录页本身也还处于占位实现状态。这意味着“按区域显示报警”不能只在界面层补一个过滤条件，而必须补齐用户与区域之间的授权模型，并把该模型贯穿到 HTTP 查询和 Socket.IO 推送两个入口上。

## Goals / Non-Goals

**Goals:**

- 建立一条独立的报警事件链路，使 C++、Node.js、数据库和前端对报警有一致的数据模型和生命周期定义。
- 将报警状态拆分为“条件状态”和“确认状态”，保证报警恢复与人工确认可以独立演进。
- 在后端实现区域级访问控制，保证报警查询和实时推送都按用户所属区域过滤。
- 为前端提供符合现有 HMI 风格的报警中心，支持活动报警展示、状态差异化显示和人工确认。
- 通过清晰的数据表、API 契约和 C++ 接口设计，为后续 specs 和 tasks 拆分提供稳定边界。

**Non-Goals:**

- 不替换现有 tag 实时数据链路，也不把报警强行塞入 `realtimeData` store。
- 不重做现有 `HomePage` 应用壳层或主监控页整体布局，只在其上增加报警入口与报警交互区域。
- 不在本 change 中扩展完整的角色权限系统，除报警区域可见范围和确认操作权限外，不引入新的通用 RBAC 体系。
- 不设计站外通知、短信、邮件等外部告警触达方式，本 change 仅覆盖系统内展示与确认闭环。

## Decisions

### 1. 报警采用独立事件模型，不复用现有 tag 推送协议

报警将使用独立的数据通道和独立的前端状态容器，而不是复用当前 `data:push` + tag 的更新模式。C++ 发布报警时，写入 `alarm:event:<dedupe_key>` 这类 Redis key，并向新的 `AlarmChanged` 频道发布该事件的唯一键；Node.js 后端读取事件负载后完成持久化和状态归并，再通过专用 Socket.IO 事件向前端推送报警更新。

这样设计的原因是，报警需要保留完整事件语义和操作历史，而不是只关心“某个 key 的最新值”。如果继续使用 tag 语义，前端只能看到当前态，无法可靠表达恢复、确认、历史与去重逻辑。

### 2. 报警状态拆分为条件状态与确认状态两条独立维度

报警主记录不使用单一 `status` 字段，而是拆分为两条正交状态：`condition_state` 表示报警条件是否仍然存在，取值为 `active` 或 `cleared`；`ack_state` 表示报警是否已经被人工确认，取值为 `unacked` 或 `acked`。这样系统可以自然表达四类关键场景：活动未确认、活动已确认、恢复未确认、恢复已确认。

对应的数据表采用以下结构：

- `alarm_area`：维护报警区域定义，包括区域编码、名称、启用状态和排序信息。
- `user_area`：维护用户与区域的授权关系，并支持默认区域概念。
- `alarm_definition`：维护报警码、默认等级、默认区域、确认要求和去重策略等定义信息。
- `alarm_event`：维护当前报警主记录，包括标题、文案、等级、区域、来源、去重键、条件状态、确认状态、发生时间、恢复时间和确认人信息。
- `alarm_event_log`：维护追加式审计日志，记录 `raise`、`clear`、`ack` 等动作及其操作者。

这种拆分能保证人工确认和报警恢复互不覆盖，避免“报警恢复就等于已经被人确认”的错误语义，同时为历史审计和前端差异化展示提供稳定基础。

### 3. 区域过滤在后端执行，并延伸到 Socket.IO 房间模型

报警区域访问控制必须在服务端执行，而不是让前端接收全量报警后再自行过滤。HTTP 查询接口根据当前登录用户的授权区域返回报警列表和汇总数据；Socket.IO 连接建立后，后端根据该用户的区域集合把连接加入对应的 `alarm-area:<id>` 房间，只向这些房间广播报警更新。

这要求登录用户上下文扩展出区域信息，至少包括用户可访问的区域集合和默认区域。对于单区域用户，前端直接使用默认区域作为当前视图范围；对于多区域用户，前端可以提供切换和汇总视图，但无论界面如何选择，服务端都必须在授权范围内响应。

之所以拒绝前端本地过滤，是因为报警天然属于敏感生产信息。只要让前端先收到全量数据，就已经违反了区域隔离目标。

### 4. 人工确认采用 HTTP 写操作，必要时再回写 C++ 命令通道

人工确认接口设计为后端显式写操作，而不是默认作为 WebSocket 命令发送。推荐的主路径是 `POST /api/alarms/:id/ack`，后端在单次事务中更新 `alarm_event` 的确认状态、确认人和确认时间，并向 `alarm_event_log` 追加一条确认记录。确认成功后，后端再向相关区域房间广播最新报警状态。

如果某些 C++ 模块确实需要感知“报警已确认”这一动作，后端可以在确认完成后，复用现有 `operation_cmd` 通道回发一个专用命令，例如 `AckAlarmCmd`。但默认不把确认动作设计为前端直达 C++，因为确认属于审计型业务写操作，需要稳定的冲突检测、权限校验和落库能力，这些都更适合由 HTTP API 承担。

与此配套的后端接口边界建议包括：

- `GET /api/alarms/summary`：返回当前用户区域范围内的活动报警汇总和未确认计数。
- `GET /api/alarms`：按状态、等级、区域和时间范围查询报警列表。
- `POST /api/alarms/:id/ack`：执行人工确认。
- `GET /api/alarm-areas`：查询报警区域定义。
- 管理类接口：维护用户区域授权关系，用于后台配置场景。

### 5. C++ 侧提供统一 AlarmPublisher 接口，避免业务模块自行拼装 Redis 负载

`gt4_app` 侧需要新增统一报警发布接口，而不是让每个业务模块各自序列化 JSON 并直接操作 Redis。推荐引入共享 `AlarmPublisher` 抽象，并定义两个基础请求模型：`AlarmRaiseRequest` 和 `AlarmClearRequest`。最小字段集合包括：`alarmCode`、`areaCode`、`severity`、`sourceModule`、`sourceKey`、`title`、`message`、`detailJson`、`requireAck`、`autoClear`、`dedupeKey` 和 `occurredAt`。

对业务模块而言，核心调用面只保留三类能力：产生或更新报警、清除报警，以及在需要时生成静态快照。Redis 连接、序列化格式、事件键命名和频道发布都由统一接口封装。这样可以减少不同模块间的格式漂移，也能保证 Web 后端只需要对接一套稳定契约。

### 6. 前端采用“全局入口 + 报警中心”结构，并保持现有 HMI 视觉语言

前端不增加一个完全脱离现有壳层的新应用，而是在现有 `HomePage` 之上叠加报警入口和报警中心。具体形式采用两层结构：页头右侧显示报警入口和未确认数量；点击入口后打开右侧报警中心面板，用于查看活动报警、历史报警、报警详情和执行确认。对于需要配置区域或做全量历史查询的管理人员，再补充独立的报警管理页。

报警中心内部使用独立 store 管理 `summary`、`activeList`、`historyList`、`selectedAlarm` 和筛选条件，不并入现有 `realtimeData` store。视觉上沿用当前 HMI 的工业灰底、表格框体和高密度布局风格，未确认报警使用高优先级强调色，已确认报警降低视觉强度，恢复后的历史报警以弱化样式进入历史区。

这种方案兼顾了操作效率和现有页面结构稳定性：监控页可以快速看到报警状态，完整交互仍集中在报警中心，不会把主监控画面挤成一个后台管理页面。

### 7. REST 契约固定为 HTTP 直出 JSON，不使用额外响应包裹

报警相关 HTTP 接口沿用仓库现有 API 风格，直接返回 JSON 对象，不再额外套一层通用响应包裹。接口分为操作员查询接口和管理接口两类，其中操作员接口依赖当前登录用户上下文自动完成区域过滤。

#### 7.1 GET /api/alarms/summary

用途：返回当前用户授权区域范围内的报警汇总，用于页头未确认角标和报警中心顶部统计。

查询参数：

- `area_ids`：可选，逗号分隔，仅允许传入当前用户授权区域的子集。

响应结构：

```json
{
  "server_time": "2026-05-30T09:30:00.000Z",
  "total_active": 5,
  "total_unacked": 2,
  "highest_severity": "critical",
  "by_severity": {
    "critical": 1,
    "major": 2,
    "minor": 1,
    "warning": 1,
    "info": 0
  },
  "by_area": [
    {
      "area_id": 1,
      "area_code": "AREA-A",
      "area_name": "A区",
      "active_count": 3,
      "unacked_count": 1
    }
  ]
}
```

#### 7.2 GET /api/alarms

用途：分页查询报警列表，支持活动态、历史态和混合视图。

查询参数：

- `scope`：可选，`active | history | all`，默认 `active`
- `area_ids`：可选，逗号分隔，仅允许传入授权区域子集
- `severity`：可选，逗号分隔，取值 `critical,major,minor,warning,info`
- `condition_state`：可选，`active | cleared`
- `ack_state`：可选，`unacked | acked`
- `keyword`：可选，按标题、文案、报警码模糊过滤
- `page`：可选，默认 `1`
- `page_size`：可选，默认 `50`，最大 `200`

单条列表项结构固定为：

```json
{
  "id": 101,
  "alarm_code": "SPRAY_PRESS_LOW",
  "area_id": 1,
  "area_code": "AREA-A",
  "area_name": "A区",
  "severity": "critical",
  "title": "喷码压力过低",
  "message": "喷码工位压力低于下限 0.35MPa",
  "source_module": "SprayWeight",
  "source_key": "spray.pressure.low",
  "condition_state": "active",
  "ack_state": "unacked",
  "first_occurred_at": "2026-05-30T09:20:00.000Z",
  "last_occurred_at": "2026-05-30T09:29:00.000Z",
  "cleared_at": null,
  "acked_at": null,
  "acked_by_name": null,
  "version": 3
}
```

分页响应结构：

```json
{
  "items": [],
  "page": 1,
  "page_size": 50,
  "total": 0
}
```

#### 7.3 GET /api/alarms/:id

用途：获取报警详情和操作历史。

响应结构：

```json
{
  "alarm": {
    "id": 101,
    "alarm_code": "SPRAY_PRESS_LOW",
    "area_id": 1,
    "area_code": "AREA-A",
    "area_name": "A区",
    "severity": "critical",
    "title": "喷码压力过低",
    "message": "喷码工位压力低于下限 0.35MPa",
    "source_module": "SprayWeight",
    "source_key": "spray.pressure.low",
    "condition_state": "active",
    "ack_state": "unacked",
    "first_occurred_at": "2026-05-30T09:20:00.000Z",
    "last_occurred_at": "2026-05-30T09:29:00.000Z",
    "cleared_at": null,
    "acked_at": null,
    "acked_by_name": null,
    "version": 3,
    "detail_json": {
      "threshold": 0.35,
      "actual": 0.31,
      "unit": "MPa"
    }
  },
  "logs": [
    {
      "id": 9001,
      "action": "raise",
      "operator_type": "system",
      "operator_id": null,
      "operator_name": "SprayWeight",
      "payload_json": {
        "actual": 0.31
      },
      "created_at": "2026-05-30T09:20:00.000Z"
    }
  ]
}
```

#### 7.4 POST /api/alarms/:id/ack

用途：执行人工确认，并利用 `expected_version` 做乐观并发控制。

请求体：

```json
{
  "expected_version": 3,
  "operator_note": "已通知设备工检查喷码压力"
}
```

成功响应：

```json
{
  "alarm": {
    "id": 101,
    "ack_state": "acked",
    "acked_at": "2026-05-30T09:31:12.000Z",
    "acked_by_name": "operator-a",
    "version": 4
  }
}
```

失败约定：

- `403`：当前用户无权确认该区域报警
- `404`：报警不存在或不在当前用户可见范围内
- `409`：`expected_version` 与数据库当前版本不一致，前端必须重新拉取详情与列表

#### 7.5 GET /api/alarm-areas

用途：查询当前用户可见的报警区域定义。

响应结构：

```json
[
  {
    "id": 1,
    "area_code": "AREA-A",
    "area_name": "A区",
    "sort_order": 10,
    "enabled": true
  }
]
```

#### 7.6 GET /api/users/me/alarm-areas

用途：返回当前登录用户的报警区域授权上下文。

响应结构：

```json
{
  "user_id": 7,
  "default_area_id": 1,
  "areas": [
    {
      "area_id": 1,
      "area_code": "AREA-A",
      "area_name": "A区",
      "is_default": true
    }
  ]
}
```

#### 7.7 PUT /api/users/:userId/alarm-areas

用途：管理用户的报警区域授权关系，按“整组替换”语义写入。

请求体：

```json
{
  "default_area_id": 1,
  "area_ids": [1, 2]
}
```

成功响应：

```json
{
  "user_id": 7,
  "default_area_id": 1,
  "area_ids": [1, 2]
}
```

### 8. Socket 事件固定为服务端推送增量更新，客户端不直接通过 Socket 执行报警业务写操作

报警域的写操作全部走 HTTP，Socket.IO 只承担身份绑定、初始快照和增量推送职责。连接建立时，客户端通过 `auth.token` 提交登录令牌，服务端解析用户与区域授权后，将该连接加入对应的 `alarm-area:<areaId>` 房间。

固定事件如下：

#### 8.1 服务端 -> 客户端 `alarm:snapshot`

触发时机：认证连接建立后或重连完成后。

载荷：

```json
{
  "server_time": "2026-05-30T09:30:00.000Z",
  "summary": {
    "total_active": 5,
    "total_unacked": 2,
    "highest_severity": "critical"
  },
  "active_items": []
}
```

说明：`active_items` 只包含当前用户授权范围内、按优先级排序的活动报警快照，默认返回前 `50` 条，用于报警中心首屏快速渲染；完整列表仍以 HTTP 查询为准。

#### 8.2 服务端 -> 客户端 `alarm:upsert`

触发时机：报警产生、重复触发归并、恢复、重新打开或确认后。

载荷：

```json
{
  "reason": "raise",
  "alarm": {
    "id": 101,
    "alarm_code": "SPRAY_PRESS_LOW",
    "area_id": 1,
    "severity": "critical",
    "condition_state": "active",
    "ack_state": "unacked",
    "version": 3
  }
}
```

`reason` 固定取值：`raise | clear | ack | reopen | refresh`

#### 8.3 服务端 -> 客户端 `alarm:summary`

触发时机：任一会影响汇总计数的报警状态变更后。

载荷结构与 `GET /api/alarms/summary` 一致，但服务端可只发送必要字段。

#### 8.4 服务端 -> 客户端 `alarm:resync-required`

触发时机：服务端重启、连接恢复后无法确认客户端状态连续性、或服务端发现客户端必须重新拉取完整数据时。

载荷：

```json
{
  "reason": "server_restart"
}
```

客户端收到后必须重新调用 `GET /api/alarms/summary`、`GET /api/alarms` 和当前打开的详情接口。

### 9. SQL DDL 固定为 PostgreSQL 主存储 + Redis 事件中转

报警的最终权威存储落 PostgreSQL，Redis 只承担事件中转和临时事件负载承载职责。数据库对象固定如下。

```sql
CREATE TABLE alarm_area (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	area_code VARCHAR(64) NOT NULL UNIQUE,
	area_name VARCHAR(128) NOT NULL,
	sort_order INTEGER NOT NULL DEFAULT 0,
	enabled BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_area (
	user_id BIGINT NOT NULL,
	area_id BIGINT NOT NULL REFERENCES alarm_area(id) ON DELETE CASCADE,
	is_default BOOLEAN NOT NULL DEFAULT FALSE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY (user_id, area_id)
);

CREATE UNIQUE INDEX uq_user_area_default
	ON user_area (user_id)
	WHERE is_default = TRUE;

CREATE TABLE alarm_definition (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	alarm_code VARCHAR(64) NOT NULL UNIQUE,
	alarm_name VARCHAR(128) NOT NULL,
	severity VARCHAR(16) NOT NULL CHECK (severity IN ('critical', 'major', 'minor', 'warning', 'info')),
	source_module VARCHAR(64) NOT NULL,
	default_area_id BIGINT NULL REFERENCES alarm_area(id),
	confirm_required BOOLEAN NOT NULL DEFAULT TRUE,
	auto_clear BOOLEAN NOT NULL DEFAULT FALSE,
	dedupe_strategy VARCHAR(32) NOT NULL DEFAULT 'by_dedupe_key'
		CHECK (dedupe_strategy IN ('by_dedupe_key', 'by_alarm_code_and_source')),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE alarm_event (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	definition_id BIGINT NULL REFERENCES alarm_definition(id),
	alarm_code VARCHAR(64) NOT NULL,
	area_id BIGINT NOT NULL REFERENCES alarm_area(id),
	source_module VARCHAR(64) NOT NULL,
	source_key VARCHAR(128) NOT NULL,
	severity VARCHAR(16) NOT NULL CHECK (severity IN ('critical', 'major', 'minor', 'warning', 'info')),
	title VARCHAR(256) NOT NULL,
	message TEXT NOT NULL,
	detail_json JSONB NOT NULL DEFAULT '{}'::JSONB,
	condition_state VARCHAR(16) NOT NULL CHECK (condition_state IN ('active', 'cleared')),
	ack_state VARCHAR(16) NOT NULL CHECK (ack_state IN ('unacked', 'acked')),
	first_occurred_at TIMESTAMPTZ NOT NULL,
	last_occurred_at TIMESTAMPTZ NOT NULL,
	cleared_at TIMESTAMPTZ NULL,
	acked_at TIMESTAMPTZ NULL,
	acked_by_user_id BIGINT NULL,
	acked_by_name VARCHAR(64) NULL,
	dedupe_key VARCHAR(256) NOT NULL,
	reopen_count INTEGER NOT NULL DEFAULT 0,
	version INTEGER NOT NULL DEFAULT 1,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CHECK (
		(condition_state = 'active' AND cleared_at IS NULL)
		OR (condition_state = 'cleared' AND cleared_at IS NOT NULL)
	)
);

CREATE UNIQUE INDEX uq_alarm_event_active_dedupe
	ON alarm_event (dedupe_key)
	WHERE condition_state = 'active';

CREATE INDEX idx_alarm_event_active_query
	ON alarm_event (area_id, ack_state, severity, last_occurred_at DESC)
	WHERE condition_state = 'active';

CREATE INDEX idx_alarm_event_history_query
	ON alarm_event (area_id, last_occurred_at DESC);

CREATE INDEX idx_alarm_event_code_source
	ON alarm_event (alarm_code, source_module, source_key);

CREATE TABLE alarm_event_log (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	alarm_event_id BIGINT NOT NULL REFERENCES alarm_event(id) ON DELETE CASCADE,
	action VARCHAR(16) NOT NULL CHECK (action IN ('raise', 'clear', 'ack')),
	operator_type VARCHAR(16) NOT NULL CHECK (operator_type IN ('system', 'user')),
	operator_id BIGINT NULL,
	operator_name VARCHAR(64) NULL,
	payload_json JSONB NOT NULL DEFAULT '{}'::JSONB,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alarm_event_log_event_time
	ON alarm_event_log (alarm_event_id, created_at DESC);
```

Redis 键和频道约定固定为：

- 事件键：`alarm:event:<dedupe_key>`
- 事件频道：`AlarmChanged`
- 事件载荷最小字段：`alarmCode`、`areaCode`、`severity`、`sourceModule`、`sourceKey`、`title`、`message`、`detailJson`、`dedupeKey`、`occurredAt`、`eventType`

其中 `eventType` 固定取值为 `raise | clear`。人工确认不通过 Redis 事件直接写库，而是先由 HTTP 完成落库，再按需通过 `operation_cmd` 回写 C++。

## Risks / Trade-offs

- 当前登录与用户上下文模型仍然较弱，区域过滤落地前必须补齐用户区域信息，否则后端无法可靠判定用户可见范围。
- 报警去重键设计如果过粗，会把不同来源的报警错误合并；如果过细，又会导致同一持续报警反复创建新记录，需要在实现前用真实业务样本校准。
- 采用“Redis key + 频道通知 + 后端落库”的两段式流程，与现有实时链路保持一致，但也意味着后端必须处理 Redis 与数据库之间的幂等和重试问题。
- 人工确认通过 HTTP 落库最稳妥，但如果 C++ 后续强依赖确认动作，就需要额外维护确认回写命令的兼容性与失败补偿。
- 前端采用全局报警中心能保持壳层一致性，但如果未来报警数量很大，仍可能需要专门的历史查询页或更细粒度的分页与筛选策略。
