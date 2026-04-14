# kylin-production-deployment Specification

## Purpose

定义 GT4 Web 在目标 Kylin Linux Advanced Server V11 上的生产部署要求，确保前端静态站点、Node.js 后端、Nginx 反向代理、Redis 和 PostgreSQL 具备可安装、可运行、可验证、可回滚的统一交付标准。

## ADDED Requirements

### Requirement: 生产环境软件清单与安装前提

系统 SHALL 提供面向目标服务器的生产软件清单、版本选择原则和安装前提，覆盖 Web 运行环境所需的核心组件与基础系统工具。

#### Scenario: 部署前识别必需软件组件

- **GIVEN** 运维人员准备在 Kylin Linux Advanced Server V11 上部署 GT4 Web
- **WHEN** 运维人员查阅生产部署方案
- **THEN** 方案应明确列出 Nginx、Node.js LTS、pnpm、Redis、PostgreSQL 以及 systemd 为必需组件
- **AND** 方案应说明构建或排障所需的基础工具，例如 tar、curl、git、ss 或 netstat

#### Scenario: 部署前验证运行环境版本

- **GIVEN** 服务器已安装部分运行组件
- **WHEN** 运维人员执行环境检查
- **THEN** 方案应提供用于验证 Node.js、pnpm、Nginx、Redis 和 PostgreSQL 是否已正确安装的检查命令
- **AND** 方案应要求在正式部署前确认软件版本满足项目运行要求

### Requirement: 生产入口与反向代理拓扑

系统 SHALL 定义以 Nginx 作为统一公网入口的生产访问拓扑，并区分静态资源、HTTP API 与 Socket.IO 的代理路径。

#### Scenario: 前端静态资源由 Nginx 直接提供

- **GIVEN** 前端已生成生产构建产物
- **WHEN** 用户通过浏览器访问生产站点根路径
- **THEN** Nginx 应直接返回前端静态资源
- **AND** 前端路由刷新时应能够正确回退到应用入口文件

#### Scenario: API 请求被转发到本机 Node.js 服务

- **GIVEN** 后端 Node.js 服务运行在受控本地监听端口
- **WHEN** 浏览器向 `/api` 发送请求
- **THEN** Nginx 应将请求反向代理到后端服务
- **AND** 后端应能接收到原始 Host 与 X-Forwarded-\* 头信息

#### Scenario: Socket.IO 连接通过 Nginx 代理升级

- **GIVEN** 前端需要建立实时连接
- **WHEN** 浏览器访问 `/socket.io`
- **THEN** Nginx 配置应支持 HTTP Upgrade 与 Connection 头透传
- **AND** 后端 Socket.IO 服务应能够成功建立并保持连接

### Requirement: 前后端发布目录与运行目录规范

系统 SHALL 定义生产部署目录结构，支持版本化发布、当前版本切换、持久化配置与日志隔离。

#### Scenario: 使用版本目录和 current 软链接发布

- **GIVEN** 运维人员准备发布新版本
- **WHEN** 生产制品被复制到服务器
- **THEN** 方案应要求将新版本发布到独立的 releases 版本目录
- **AND** 方案应使用 current 软链接指向当前生效版本

#### Scenario: 配置与日志不随版本覆盖

- **GIVEN** 服务器已存在历史版本和运行日志
- **WHEN** 运维人员发布新版本
- **THEN** 环境变量文件、日志目录和其他持久化内容应位于 shared 或独立目录
- **AND** 新版本上线不应覆盖既有配置和历史日志

### Requirement: Node.js 后端生产常驻运行

系统 SHALL 定义后端 Node.js 服务的生产运行方式，使其具备开机自启、故障自动恢复、状态检查与日志查看能力。

#### Scenario: 使用 systemd 守护后端服务

- **GIVEN** 后端生产构建结果和环境配置已就绪
- **WHEN** 运维人员按方案创建并启动 systemd 服务
- **THEN** 后端应以 systemd 托管方式启动
- **AND** 服务应支持 enable、start、stop、restart 和 status 操作

#### Scenario: 后端进程异常退出后可自动恢复

- **GIVEN** systemd 已接管后端服务
- **WHEN** 后端 Node.js 进程意外退出
- **THEN** 服务配置应具备自动重启策略
- **AND** 运维人员应能通过 journald 或约定日志路径查看失败原因

### Requirement: 生产配置与依赖服务接入

系统 SHALL 规定后端环境变量与 Redis、PostgreSQL 等依赖服务的接入方式，确保应用可在生产环境中正确连接基础设施。

#### Scenario: 环境变量通过独立文件注入

- **GIVEN** 后端服务需要数据库、Redis、端口和运行模式配置
- **WHEN** 运维人员准备生产配置
- **THEN** 方案应要求使用独立环境文件存放敏感参数
- **AND** systemd 服务应通过 EnvironmentFile 或等效机制注入配置

#### Scenario: 部署前验证 Redis 与 PostgreSQL 连通性

- **GIVEN** Redis 和 PostgreSQL 已安装或已提供远端连接地址
- **WHEN** 运维人员进行上线前检查
- **THEN** 方案应包含验证两类依赖服务可达性的检查步骤
- **AND** 若依赖不可用，后端服务不应在未确认风险的情况下直接切换上线

### Requirement: 上线验收、巡检与回滚

系统 SHALL 提供生产部署完成后的验收、巡检、故障排查与版本回滚步骤。

#### Scenario: 上线后执行基础验收

- **GIVEN** 新版本已切换为 current 并启动相关服务
- **WHEN** 运维人员执行验收流程
- **THEN** 方案应要求检查 Nginx、Node.js、Redis、PostgreSQL 服务状态
- **AND** 方案应要求验证首页访问、`/api/health` 健康检查以及 Socket.IO 实时连接

#### Scenario: 发生异常时回滚到上一版本

- **GIVEN** 新版本上线后发现关键功能异常
- **WHEN** 运维人员执行回滚
- **THEN** 方案应提供将 current 软链接切回上一版本的步骤
- **AND** 方案应要求在回滚后重启或重载必要服务并重新执行健康检查

#### Scenario: 例行巡检定位生产问题

- **GIVEN** 系统进入日常运行阶段
- **WHEN** 运维人员需要排查服务异常或性能问题
- **THEN** 方案应包含查看端口监听、服务状态、Nginx 日志和后端日志的命令入口
- **AND** 方案应覆盖常见问题的排查起点，例如代理失败、端口占用、依赖服务未启动
