## Why

当前项目仍停留在本地开发环境，缺少面向目标麒麟 Linux 服务器的生产部署方案，无法稳定交付给现场环境运行。需要把前端静态资源发布、Nginx 反向代理、Node.js 后端常驻、Redis 和 PostgreSQL 等运行依赖统一梳理成一套可执行的部署规范，降低上线和运维风险。

## What Changes

- 新增一套面向 Kylin Linux Advanced Server V11 的生产部署方案，覆盖服务器准备、目录规划、依赖安装、构建发布和运行验证。
- 明确前端静态资源由 Nginx 托管，HTTP API 和 Socket.IO 请求由 Nginx 反向代理到 Node.js 后端服务。
- 定义后端 Node.js 生产运行方式，包括环境变量、进程守护、开机自启、日志管理和故障恢复建议。
- 补充 Redis、PostgreSQL、Node.js、pnpm、Nginx 等生产环境所需软件与配置要点。
- 补充生产部署后的验收与运维内容，包括健康检查、端口与防火墙、服务状态检查、更新回滚与常见故障排查。

## Capabilities

### New Capabilities

- kylin-production-deployment: Define the required production deployment plan, environment dependencies, reverse proxy topology, and operational steps for running GT4 Web on the target Kylin Linux server.

### Modified Capabilities

- None.

## Impact

- Affected systems: target Kylin Linux server, Nginx reverse proxy, Node.js backend runtime, frontend static asset hosting, Redis, PostgreSQL.
- Affected artifacts: deployment documentation, production environment variables, service management and release procedure.
- Affected code areas for follow-up implementation may include frontend build output handling, backend runtime configuration, and any deployment-related scripts or docs added later.
