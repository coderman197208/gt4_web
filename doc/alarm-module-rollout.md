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
- 确认冲突 `409`
- 新连接首屏 `alarm:snapshot`
- `报警产生 -> 持久化 -> 推送 -> 人工确认 -> 历史可查` 的后端闭环

当前已完成验证：

- `backend` 的 `pnpm typecheck` 通过
- `pnpm verify:alarms` 通过

当前剩余阻塞：

- `gt4_app` 的实际二进制构建与联调仍依赖 Linux 环境；当前 Windows 会话里 `cmake --preset linux-debug` 无法使用，因此 `6.2` 还不能在本机会话里完成真正的 C++ 进程级联调。
