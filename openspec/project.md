# Project Context

## Purpose

[Describe your project's purpose and goals]

这是一个基于B/S架构的工业软件，目的是实现数据的显示和用户命令的输入；采用前后端分离技术实现，前端为SPA单页应用，所有页面切换在前端完成，完全不涉及后端渲染。

## Tech Stack

- [List your primary technologies]
- [e.g., TypeScript, React, Node.js]

### 后端
- Node.js + TypeScript
- Fastify轻量级Web服务器
- Socket.IO（WebSocket通信）
- Prisma（ORM）
- 数据库：PostgreSQL + Redis

### 前端
- Vue.js + TypeScript
- Vite（构建工具）
- Vue Router、Pinia
- axios（HTTP客户端）
- shadcn-vue、Tailwind CSS

### 开发工具
- TypeScript（类型检查）
- ESLint（代码质量检查）
- Prettier（代码格式化）
- Concurrently（同时运行多个命令）

## Project Conventions

### Code Style

[Describe your code style preferences, formatting rules, and naming conventions]

### Architecture Patterns

[Document your architectural decisions and patterns]

#### 工作区结构（Monorepo）
项目使用npm workspaces进行管理，分为三个主要工作区：
- frontend : 前端Vue应用
- backend : Node.js后端服务
- packages/shared : 前后端共享代码

#### 数据交互方式
- RESTFUL API : 用于数据库CRUD操作
- WebSocket : 用于实时数据推送和命令传输，实时数据从Redis主题订阅获取

### Testing Strategy

[Explain your testing approach and requirements]

### Git Workflow

[Describe your branching strategy and commit conventions]

## Domain Context

[Add domain-specific knowledge that AI assistants need to understand]

## Important Constraints

[List any technical, business, or regulatory constraints]

## External Dependencies

[Document key external services, APIs, or systems]
