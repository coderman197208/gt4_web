# Mock API 修复说明

## 问题

使用 `pnpm dev` 运行项目时，WebSocket 工作正常，但 Mock API endpoints 无法工作。

## 原因

- 后端服务器运行在 3000 端口，只提供 WebSocket 和 `/api/health` endpoint
- 前端 Vite 配置将 `/api` 代理到 3001 端口（json-server）
- 但运行 `pnpm dev` 时没有启动 json-server，导致 API 调用失败

## 解决方案

将 Mock API 集成到后端服务器中，在开发环境下自动提供 Mock endpoints。

### 修改内容

1. **新增文件**：
   - `backend/src/modules/api/mockData.ts` - Mock 数据定义
   - `backend/src/modules/api/mockRoutes.ts` - Mock API 路由

2. **修改文件**：
   - `backend/src/index.ts` - 注册 Mock 路由
   - `backend/package.json` - 添加 @fastify/sensible 依赖
   - `frontend/vite.config.ts` - 修改代理配置指向后端服务器（3000端口）

3. **新增依赖**：
   - `@fastify/sensible` - 提供 HTTP 错误处理

### Mock API Endpoints

现在后端服务器提供以下 endpoints：

#### 用户相关

- `GET /api/users` - 获取所有用户
- `GET /api/users/:id` - 获取单个用户
- `GET /api/users/:id/posts` - 获取用户的文章

#### 文章相关

- `GET /api/posts` - 获取所有文章
- `GET /api/posts/:id` - 获取单个文章
- `GET /api/posts/:id/comments` - 获取文章的评论

#### 评论相关

- `GET /api/comments` - 获取所有评论
- `GET /api/comments/:id` - 获取单个评论

#### 认证相关

- `POST /api/auth/login` - 用户登录

### 使用方式

#### 开发模式（推荐）

```bash
pnpm dev
```

- 同时启动后端（3000端口）和前端（5173端口）
- 后端自动提供 Mock API 和 WebSocket
- 前端代理 `/api` 到后端服务器

#### 使用 json-server（可选）

```bash
pnpm dev:mock
```

- 启动 json-server（3001端口）和前端
- 前端代理 `/api` 到 json-server
- 没有 WebSocket 功能

### 环境变量

如果需要指定不同的 API 目标：

```bash
VITE_API_TARGET=http://localhost:3001 pnpm dev
```

## 测试

安装依赖后重启开发服务器：

```bash
pnpm install
pnpm dev
```

访问以下 URL 测试：

- http://localhost:5173/ - 前端应用
- http://localhost:3000/api/health - 健康检查
- http://localhost:3000/api/users - 用户列表
- http://localhost:3000/api/posts - 文章列表

## 注意事项

1. Mock 路由仅在非生产环境下注册
2. 所有 Mock 数据在 `mockData.ts` 中定义
3. WebSocket 代理也已配置，确保 Socket.IO 正常工作
