# Proposal: Add WebSocket Real-Time Data Subscription and Push

## Status
Draft

## Context
当前系统已实现REST API方式的数据获取，但工业应用需要实时数据推送能力。根据项目架构要求，需要增加基于WebSocket的实时数据订阅-推送机制，使前端能够订阅特定数据项，后端定时模拟并推送这些数据。

本提案解决以下核心需求：
1. 前端与后端建立WebSocket连接，支持自动重连
2. 所有前端页面共享同一个WebSocket连接
3. 前端通过订阅机制告知后端需要哪些数据标签（tags）
4. 后端保存每个连接的订阅列表，并按订阅推送数据
5. 前端使用Pinia store管理推送的实时数据
6. 在HealthCheckView中演示订阅tag1、tag2、tag3并展示数据

## Goals
- 实现完整的WebSocket双向通信基础设施（基于Socket.IO）
- 建立订阅-推送数据模式，支持多个标签（tag）的订阅管理
- 前端自动重连机制，确保连接断开后能恢复
- 前端通过Pinia store统一管理实时数据，响应式更新UI
- 后端模拟数据生成器，每秒更新tag1、tag2、tag3数据并推送
- 在HealthCheckView页面集成订阅和数据展示功能

## Non-Goals
- 不涉及生产环境的真实数据源集成（Redis订阅等）
- 不实现复杂的权限控制或加密机制
- 不支持历史数据查询或持久化

## Success Criteria
- 前端能够成功建立WebSocket连接并在断开后自动重连
- 前端可以发送订阅请求，后端正确保存和管理订阅列表
- 后端每秒生成模拟数据，并仅向订阅了相应tag的连接推送
- 前端Pinia store能够根据tag分类存储推送数据
- HealthCheckView正确显示tag1（表格6字段）、tag2（单个数字）、tag3（6行表格）

## Affected Components
- **Backend**: 
  - 新增Socket.IO服务器模块
  - 新增订阅管理模块
  - 新增模拟数据生成器
- **Frontend**:
  - 新增WebSocket客户端服务（composable或service）
  - 新增Pinia store管理实时数据
  - 扩展HealthCheckView组件
- **Shared**: 
  - 新增WebSocket消息类型定义（订阅请求、数据推送格式）

## Dependencies
- Socket.IO (backend: `socket.io`, frontend: `socket.io-client`)
- Pinia (frontend: 已安装)

## Risks & Mitigations
- **风险**: Socket.IO版本兼容性问题
  - **缓解**: 使用最新稳定版本并在安装时统一版本
- **风险**: 前端重连逻辑可能导致重复订阅
  - **缓解**: 重连后重新发送完整订阅列表，后端全量替换而非追加
- **风险**: 后端模拟数据生成器可能在无连接时继续运行
  - **缓解**: 仅在有至少一个活跃连接时启动定时器

## Open Questions
- 是否需要在前端UI上显示WebSocket连接状态？
- 是否需要日志记录订阅和推送事件以便调试？
