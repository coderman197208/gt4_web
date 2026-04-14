## 1. Confirm Deployment Baseline

- [x] 1.1 梳理目标服务器已知条件，确认操作系统、内核、IP、开放端口和单机部署边界。
- [x] 1.2 确认生产环境所需软件清单与版本原则，包括 Nginx、Node.js LTS、pnpm、Redis、PostgreSQL、systemd 和基础运维工具。
- [x] 1.3 确认项目在生产环境中的访问入口约束，明确前端静态资源、/api 和 /socket.io 的统一入口路径。

## 2. Define Runtime Topology And Directory Layout

- [x] 2.1 输出单机 Nginx + Node.js + Redis + PostgreSQL 的生产拓扑说明，明确各组件职责和监听关系。
- [x] 2.2 设计生产目录结构，覆盖 releases、current、shared、日志目录和环境配置文件位置。
- [x] 2.3 明确生产运行用户、目录权限和配置文件权限要求。

## 3. Specify Installation And Configuration Steps

- [x] 3.1 编写目标服务器的软件安装步骤与安装后验证命令。
- [x] 3.2 编写前端生产构建产物的发布步骤，并说明 Nginx 如何托管静态资源与支持前端路由回退。
- [x] 3.3 编写后端 Node.js 生产运行步骤，包括构建产物部署、环境变量注入和本地监听端口约定。
- [x] 3.4 编写 Nginx 反向代理配置要点，覆盖 /api 和 /socket.io 的代理与 WebSocket Upgrade 配置。
- [x] 3.5 编写 systemd 服务配置要点，覆盖开机自启、自动重启、状态查询和日志查看。
- [x] 3.6 编写 Redis 与 PostgreSQL 的接入要求和上线前连通性检查步骤。

## 4. Define Release, Verification, And Rollback Procedures

- [x] 4.1 编写推荐发布流程，区分构建机产物交付与服务器本机构建两种路径。
- [x] 4.2 编写上线验收清单，覆盖站点访问、/api/health、Socket.IO 连接、服务状态和端口检查。
- [x] 4.3 编写日常巡检与故障排查步骤，覆盖 Nginx 日志、后端日志、Redis、PostgreSQL 和端口监听检查。
- [x] 4.4 编写版本回滚流程，覆盖 current 软链接回切、服务重启或重载以及回滚后复验。

## 5. Finalize Delivery Artifact

- [x] 5.1 复核部署方案是否完整覆盖用户要求的“安装软件清单”和“目标服务器运行环境部署步骤”。
- [x] 5.2 复核方案内容是否与 proposal、design 和 spec 保持一致，避免遗漏生产代理、进程守护和运维闭环。
- [x] 5.3 输出最终可交付的详细部署方案文本，确保运维人员可直接按文执行。
