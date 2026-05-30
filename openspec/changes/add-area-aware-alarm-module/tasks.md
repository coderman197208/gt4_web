## 1. Shared Contracts And Storage Foundation

- [x] 1.1 在 `packages/shared` 中补齐报警相关共享类型，覆盖报警区域、用户区域上下文、报警汇总、报警列表项、报警详情、报警日志、确认请求以及 Socket `alarm:snapshot` / `alarm:upsert` / `alarm:summary` 载荷。
- [x] 1.2 在 Web 后端落地报警存储结构，创建 `alarm_area`、`user_area`、`alarm_definition`、`alarm_event`、`alarm_event_log` 的表结构、约束和索引，并与仓库现有 PostgreSQL 接入方式对齐。
- [x] 1.3 准备最小可运行的基础数据，至少包括报警区域定义、测试用户区域授权关系和一组可用于联调的报警定义或样例数据。

## 2. Authentication And Area Authorization

- [x] 2.1 对齐登录最小契约：前端登录请求改为 `username + password`，后端 `POST /api/auth/login` 返回可复用 `token` 与稳定 `user` 基础字段。
- [x] 2.2 新增当前用户报警区域上下文查询接口 `GET /api/users/me/alarm-areas`，并在后端基于令牌解析出当前用户身份与授权区域集合。
- [x] 2.3 为报警 HTTP API 和报警 Socket 连接补齐统一鉴权与区域解析逻辑，确保未登录或无效令牌无法获取报警快照、列表或实时推送。
- [x] 2.4 落地区域管理接口，至少实现 `GET /api/alarm-areas` 与 `PUT /api/users/:userId/alarm-areas`，并保证默认区域与授权区域集合一致性校验。

## 3. Backend Alarm Ingestion And Query APIs

- [x] 3.1 在后端新增 `AlarmChanged` 订阅处理链路，按 `alarm:event:<dedupe_key>` 读取事件负载并校验固定字段。
- [x] 3.2 实现报警持久化服务，完成 `raise`、`clear`、`reopen`、`ack` 的去重归并、状态迁移、版本递增和 `alarm_event_log` 追加写入。
- [x] 3.3 实现固定 REST 契约：`GET /api/alarms/summary`、`GET /api/alarms`、`GET /api/alarms/:id`、`POST /api/alarms/:id/ack`，并落实区域过滤与 `expected_version` 冲突校验。
- [x] 3.4 在 Socket.IO 中实现报警房间模型和固定事件 `alarm:snapshot`、`alarm:upsert`、`alarm:summary`、`alarm:resync-required`，确保只向授权区域连接推送。

## 4. Frontend Alarm Center Experience

- [x] 4.1 在前端认证接线中保存登录令牌并加载 `GET /api/users/me/alarm-areas`，让报警 API 与 Socket 连接共享同一身份上下文。
- [x] 4.2 新增报警 API 模块与独立 store，管理 `summary`、活动列表、历史列表、详情、筛选条件、分页状态和确认中的并发状态。
- [x] 4.3 在 `HomePage` 壳层增加报警入口和未确认数量展示，并实现符合现有 HMI 风格的报警中心面板或视图。
- [x] 4.4 完成报警中心交互闭环，覆盖首屏快照初始化、`alarm:upsert` 增量更新、确认成功刷新、`409` 冲突重拉和重连后快照恢复。

## 5. gt4_app Alarm Publisher Contract

- [x] 5.1 在 `gt4_app` 中新增共享 `AlarmPublisher` 模块及 `AlarmRaiseRequest`、`AlarmClearRequest` 模型，固定 `Raise` / `Clear` 两条调用面，避免业务模块直接拼 Redis 报文。
- [x] 5.2 实现 `AlarmPublisher` 的 Redis 序列化、事件键写入和 `AlarmChanged` 发布逻辑，保证 `raise` / `clear` 事件都使用统一载荷结构和 `dedupeKey` 规则。
- [x] 5.3 为 `AlarmPublisher` 增加失败结果和日志上下文输出，确保 Redis 写入、发布或序列化失败时不会被静默吞掉。
- [x] 5.4 选取至少一个实际报警来源模块接入 `AlarmPublisher`，替换分散的报警发布实现，并验证 Web 后端能够正常接收与持久化事件。

## 6. Verification And Rollout Readiness

- [x] 6.1 为后端补齐覆盖关键行为的验证，至少包含 dedupe/reopen、区域过滤、确认冲突和 Socket 首屏快照场景。
- [ ] 6.2 完成前后端联调与 C++ 发布链路联调，验证“报警产生 -> 持久化 -> 推送 -> 人工确认 -> 历史可查”的完整闭环。
- [x] 6.3 更新实现文档或交付说明，记录报警 Redis 契约、数据库表用途、最小登录依赖和 `gt4_app` 接入方式，便于后续模块复用。
