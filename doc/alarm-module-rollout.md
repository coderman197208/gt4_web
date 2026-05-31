# 报警模块交付说明

本文记录 `add-area-aware-alarm-module` 的当前实现落点、Redis 契约、数据库表用途、最小登录依赖、`gt4_app` 接入方式，以及当前验证状态。

## 1. Redis 报警契约

报警链路与实时 tag 链路分离，固定使用以下 Redis 约定：

- 事件键：`alarm:event:<dedupeKey>`
- 事件频道：`AlarmChanged`
- 事件类型：`raise` / `clear`

最小事件载荷如下：

```json
{
  "alarmCode": "WEIGHT_DATA_INVALID",
  "areaCode": "AREA-A",
  "severity": "major",
  "sourceModule": "TubeTrack",
  "sourceKey": "weight.position.measurement",
  "title": "称重工位无效重量数据",
  "message": "称重超时，未获得有效的重量数据，请尝试人工称重",
  "detailJson": {
    "rawWeight": -2,
    "tubeNo": 101,
    "flowNo": 5001
  },
  "dedupeKey": "tubetrack:weight-position:invalid-data",
  "occurredAt": "2026-05-30T10:00:00Z",
  "eventType": "raise"
}
```

Web 后端 `redisSubscriber.ts` 订阅 `AlarmChanged` 后，会读取该键并调用 `handleAlarmChanged()` 做落库和推送。`handleAlarmChanged()` 现在同时兼容完整 `alarm:event:<dedupeKey>` 键名和裸 `dedupeKey`，避免发布端和消费端再次出现前缀漂移。

## 2. 数据库对象用途

报警主存储在 PostgreSQL，当前表结构由 `backend/src/modules/database/alarmStorage.ts` 负责初始化，字段类型与 Prisma schema 已对齐为 `VARCHAR + CHECK` 约束，而不是 PostgreSQL enum。

- `alarm_area`：报警区域定义，控制区域名称、启用状态和排序。
- `user_area`：用户与报警区域的授权关系，包含默认区域。
- `alarm_definition`：报警码元数据，包含默认等级、默认区域、确认要求和去重策略。
- `alarm_event`：当前报警主记录，保存活动/清除状态、确认状态、去重键、来源和详情快照。
- `alarm_event_log`：追加式审计日志，记录 `raise` / `clear` / `ack` 动作及其当时载荷。

查询与推送主路径：

1. C++ 或脚本写入 Redis 事件键并发布 `AlarmChanged`
2. Node 后端读取 Redis 载荷，归并到 `alarm_event`
3. 后端追加 `alarm_event_log`
4. 后端按区域房间推送 `alarm:upsert` 和 `alarm:summary`
5. 前端通过 HTTP 和 Socket 同步活动列表、历史列表和详情

## 3. 最小登录依赖

当前报警模块依赖仓库现有的最小 mock 登录模型：

- 登录接口：`POST /api/auth/login`
- 请求体：`{ "username": "user1", "password": "任意非空值" }`
- 返回：稳定 `token` 与 `{ id, username, role }` 组成的 `user`

报警相关前端和 Socket 都复用同一令牌：

1. 前端登录成功后保存 `token`
2. 调用 `GET /api/users/me/alarm-areas` 获取当前用户区域上下文
3. 所有报警 HTTP 请求携带 `Authorization: Bearer <token>`
4. Socket.IO 连接通过 `auth.token` 携带同一令牌

当前种子权限：

- `admin`：可见 `AREA-A` / `AREA-B` / `AREA-C`
- `user1`：可见 `AREA-A`
- `user2`：可见 `AREA-B`

## 4. gt4_app 接入方式

`gt4_app` 已包含顶层静态库 `AlarmPublisher`，头文件位于 `AlarmPublisher/include/AlarmPublisher.h`，固定暴露两条同步调用面：

- `AlarmPublishResult Raise(const AlarmRaiseRequest&)`
- `AlarmPublishResult Clear(const AlarmClearRequest&)`

推荐接入模式：

1. 业务模块继续复用自己已有的 `sw::redis::Redis` 连接
2. 在进程上下文中持有 `std::unique_ptr<AlarmPublisher>`
3. 发现异常时构造 `AlarmRaiseRequest`
4. 异常恢复时构造 `AlarmClearRequest`
5. `AlarmPublisher` 统一负责 JSON 序列化、事件键写入、`AlarmChanged` 发布和错误日志

当前已接入的真实业务模块：

- `gt4_app/TubeTrack/src/WeightPosition.cpp`

该模块将“称重乱码 / 称重超时 / 称重值为 0”从单纯日志升级为统一报警发布，并在称重恢复有效或功能停用时发送清除事件。

## 5. 验证与现状

新增的后端验证入口：

- 命令：`pnpm verify:alarms`
- 位置：`backend/src/scripts/verifyAlarmFlow.ts`

该脚本会在有 PostgreSQL 和 Redis 的环境中自动覆盖以下场景：

- dedupe 重复触发归并
- clear 后 reopen
- 区域过滤（HTTP 和 Socket）
- admin 全区域访问（summary/list/detail 与首屏 snapshot）
- 确认冲突 `409`
- admin 批量确认的部分成功结果、统一备注日志写入与广播汇总更新
- 新连接首屏 `alarm:snapshot`
- `报警产生 -> 持久化 -> 推送 -> 人工确认 -> 历史可查` 的后端闭环

当前已完成验证：

- `shared` 的 `pnpm --filter @gt4_web/shared typecheck` 通过
- `backend` 的 `pnpm typecheck` 通过
- `frontend` 的 `pnpm --filter @gt4_web/frontend typecheck` 通过
- `pnpm verify:alarms` 通过

前端已完成一次手动联调验证（`admin` 登录后在 `http://127.0.0.1:5173/alarm-management`）：

- 未登录直达 `/alarm-management` 会被路由守卫重定向到 `/login?redirect=/alarm-management`
- admin 登录后会自动回跳到报警管理页，且默认进入“历史管理”模式
- admin 侧边栏可见“报警管理”入口
- 历史管理模式可对当前页未确认项执行批量确认，提交后页面会整页刷新并更新结果摘要
- 用户区域配置模式只列普通用户目录项，不包含 admin 账号
- 修改普通用户授权区域后，页面会重新读取并显示最新保存结果

## 6. Admin 管理页边界与联调注意事项

- `admin` 的全区域视角是角色语义，不依赖 `user_area` 预置数据。联调时如果 admin 看不到区域，先查 `alarm_area.enabled`，不要去补 admin 的 `user_area` 记录。
- 独立管理页路由是 `/alarm-management`，它走拉取式刷新模型，不消费报警 Socket 增量事件来维护“当前页可见集合”。
- 现有页头报警角标与右侧 `AlarmCenterPanel` 仍然是操作员语义的实时工作面；admin 管理页是独立的历史/授权工作台，不要把两者的状态容器混用。
- 当前管理页依赖的新增接口为：`GET /api/admin/alarm-users`、`GET /api/users/:userId/alarm-areas`、`PUT /api/users/:userId/alarm-areas`、`POST /api/admin/alarms/batch-ack`。
- 当前批量确认只面向 admin 管理页，仍沿用现有 `alarm:upsert` 和 `alarm:summary` 广播，不新增专用批量 Socket 事件。
- 若前端本地调试页已打开但看不到新入口，优先确认 Vite dev server 已启动且页面不是旧缓存页；当前会话验证时同时启动了 frontend `:5173` 与 backend `:5001`。

当前剩余阻塞：

- `gt4_app` 的实际二进制构建与联调仍依赖 Linux 环境；当前 Windows 会话里 `cmake --preset linux-debug` 无法使用，因此 `6.2` 还不能在本机会话里完成真正的 C++ 进程级联调。
