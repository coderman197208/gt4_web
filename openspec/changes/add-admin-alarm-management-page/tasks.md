## 1. Shared contracts and admin management payloads

- [x] 1.1 在 `packages/shared` 中补齐 admin 报警管理页所需共享类型，至少覆盖 admin 用户目录项、目标用户报警区域上下文、批量确认请求、批量确认逐条结果和批量确认响应结构。
- [x] 1.2 为批量确认请求固定最小字段集合，明确 `items` 中每项必须包含 `alarm_id` 和 `expected_version`，并允许顶层 `operator_note` 作为统一备注。
- [x] 1.3 更新前后端报警相关模块的类型导入，复用新的共享契约，避免在 frontend 和 backend 各自维护 admin 管理页的本地 ad hoc 类型。

## 2. Backend access scope resolution and admin user area management APIs

- [x] 2.1 重构 `backend/src/modules/auth/alarmAreaAccess.ts` 中的区域求值逻辑，新增统一的报警访问范围解析层，使 `admin` 默认获得全部启用区域，普通用户继续按 `user_area` 授权区域求值。
- [x] 2.2 对齐 `GET /api/users/me/alarm-areas`、`GET /api/alarm-areas`、报警 summary/list/detail 查询以及 Socket 初始化使用同一套访问范围解析结果，确保 admin 在 HTTP 与 Socket 两侧都获得全区域视角。
- [x] 2.3 新增 admin-only 普通用户目录接口 `GET /api/admin/alarm-users`，只返回 `role = user` 的目录项，并明确拒绝非 admin 请求。
- [x] 2.4 新增 admin-only 目标用户报警区域上下文读取接口 `GET /api/users/:userId/alarm-areas`，允许 admin 读取普通用户当前的默认区域和授权区域集合，并拒绝不存在用户或 admin 目标账号。
- [x] 2.5 收紧现有 `PUT /api/users/:userId/alarm-areas` 的目标用户约束，确保该接口只允许 admin 配置普通用户，拒绝对 admin 账号本身或不存在用户做区域授权写入。

## 3. Backend batch acknowledgment workflow

- [x] 3.1 在后端新增 admin-only 批量确认接口 `POST /api/admin/alarms/batch-ack`，接收当前页可见未确认报警项的显式提交列表，而不是通过查询条件重算当前页。
- [x] 3.2 抽取并复用现有单条确认核心逻辑，让批量确认沿用同一套状态迁移、版本校验、日志写入和 `ack_state` 更新语义。
- [x] 3.3 为批量确认实现部分成功结果模型，逐条返回 `acked`、`already_acked`、`conflict`、`not_found` 等处理状态，并返回 `requested_count` 与 `acked_count` 汇总字段；不额外返回冲突或已确认条目的最新版本号。
- [x] 3.4 在每条成功确认的报警日志中写入统一 `operator_note`，并保证失败、冲突或已确认条目不会产生新的确认日志。
- [x] 3.5 对批量确认成功项沿用现有报警同步机制，逐条广播 `alarm:upsert`，并按受影响区域去重后刷新 `alarm:summary`，不新增专用批量 Socket 事件。

## 4. Frontend admin alarm management page

- [x] 4.1 在 `frontend/src/router` 和 `HomePage` 壳层中注册独立的 admin 报警管理页路由，并同时补齐前端 admin 路由守卫和侧边导航入口控制。
- [x] 4.2 新增 admin 报警管理页的数据接入层，封装普通用户目录、目标用户区域上下文读取/写入和批量确认接口的前端 API 包装。
- [x] 4.3 为管理页建立独立状态管理，覆盖历史查询条件、分页状态、当前页结果、详情选中态、批量确认提交态、普通用户目录和目标用户区域授权编辑态；不要直接复用操作员报警中心的 `alarmCenter` store。
- [x] 4.4 实现管理页双模式工作台，默认打开“历史管理”模式，并提供切换到“用户区域配置”模式的交互。
- [x] 4.5 在历史管理模式中实现当前页未确认项的批量确认流程，包括统一备注输入、当前页可确认项筛选、提交后结果提示，以及列表/汇总/详情整页刷新；管理页保持拉取式刷新，不接入报警 Socket 增量事件维护当前页结果。
- [x] 4.6 在用户区域配置模式中实现普通用户目录选择、目标用户当前授权区域展示、默认区域选择和整组保存交互。
- [x] 4.7 保持管理页整体视觉语言与现有 HMI 管理页一致，沿用浅灰工业面板、固定全屏和无浏览器滚动的布局约束。

## 5. Verification and rollout readiness

- [x] 5.1 为后端补齐覆盖 admin 全区域访问模型的验证，至少包含 admin summary/list/detail 查询、admin Socket 首屏快照，以及普通用户权限未被放宽的场景。
- [x] 5.2 为后端补齐批量确认验证，至少包含统一备注写日志、部分成功返回、版本冲突、已确认条目跳过和广播汇总更新场景。
- [x] 5.3 手动验证前端管理页核心流程：admin 入口可见且默认进入历史模式、当前页批量确认成功、批量确认后整页刷新、普通用户目录只列普通用户、区域配置保存后可重新读取最新结果。
- [x] 5.4 执行受影响范围的静态检查和可运行验证，并记录当前 change 的实现边界与联调注意事项，避免把 admin 管理页行为和现有操作员报警中心语义混淆。
