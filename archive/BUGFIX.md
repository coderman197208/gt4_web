# 问题修复说明

## 问题

运行 `pnpm mock:server` 时遇到错误：

```
Command "mock:server" not found
```

## 原因

1. `mock:server` 脚本只在 `frontend/package.json` 中定义
2. `server.js` 使用CommonJS语法，但frontend的 `"type": "module"` 导致Node.js将其作为ES模块处理

## 解决方案

### 1. 添加根目录脚本

在 `package.json` 中添加：

```json
"scripts": {
  "mock:server": "pnpm --filter @gt4_web/frontend mock:server",
  "dev:mock": "concurrently -n mock,front -c yellow,blue \"npm:mock:server\" \"npm:dev --workspace frontend\""
}
```

### 2. 修复ES模块问题

将 `server.js` 重命名为 `server.cjs`，并更新相关引用。

## 现在可以使用

### 方式1：在项目根目录运行（推荐）

```bash
# 只启动Mock服务器
pnpm mock:server

# 一键启动Mock + 前端
pnpm dev:mock
```

### 方式2：在frontend目录运行

```bash
cd frontend
pnpm mock:server
```

## 验证

Mock服务器启动后会显示：

```
JSON Server is running on http://localhost:3001
Resources available at:
  - http://localhost:3001/users
  - http://localhost:3001/posts
  - http://localhost:3001/comments
  - http://localhost:3001/health
```

可以访问：

- http://localhost:3001/users - 获取用户列表
- http://localhost:3001/health - 健康检查
- http://localhost:5173/api-demo - 前端测试页面（需先启动前端）

## 已修复的文件

- ✅ [package.json](../package.json) - 添加mock:server和dev:mock脚本
- ✅ [frontend/package.json](../frontend/package.json) - 更新脚本指向server.cjs
- ✅ `frontend/mock/server.js` → `frontend/mock/server.cjs` - 重命名为CommonJS扩展名
- ✅ [frontend/mock/README.md](../frontend/mock/README.md) - 更新文件名引用
- ✅ [doc/json-server-integration.md](../doc/json-server-integration.md) - 更新文档
- ✅ [QUICKSTART-MOCK-API.md](../QUICKSTART-MOCK-API.md) - 更新快速开始指南
- ✅ [IMPLEMENTATION-SUMMARY.md](../IMPLEMENTATION-SUMMARY.md) - 更新实施总结
