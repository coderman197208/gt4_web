# JSON Server Mock数据 - 快速开始

## 1. 启动Mock服务器

```bash
# 在项目根目录执行
pnpm mock:server

# 或者进入frontend目录
cd frontend
pnpm mock:server
```

服务器启动在：`http://localhost:3001`

## 2. 启动前端开发服务器

```bash
# 在新的终端窗口
cd frontend
pnpm dev
```

前端启动在：`http://localhost:5173`

## 3. 测试API

访问测试页面：`http://localhost:5173/api-demo`

## 4. 在代码中使用API

### 示例1：获取数据

```typescript
import { getUsers, getPosts } from '@/api';

// 获取所有用户
const users = await getUsers();

// 获取已发布的文章（带分页）
const posts = await getPosts({
  published: true,
  _page: 1,
  _limit: 10,
  _sort: 'createdAt',
  _order: 'desc',
});
```

### 示例2：创建数据

```typescript
import { createPost } from '@/api';

const newPost = await createPost({
  title: '我的新文章',
  content: '文章内容...',
  authorId: 1,
  published: true,
});
```

### 示例3：更新数据

```typescript
import { patchPost } from '@/api';

// 部分更新
await patchPost(1, { published: false });
```

### 示例4：删除数据

```typescript
import { deletePost } from '@/api';

await deletePost(1);
```

## 5. 可用的API端点

### 用户 (Users)

- `getUsers()` - 获取所有用户
- `getUserById(id)` - 获取单个用户
- `createUser(data)` - 创建用户
- `updateUser(id, data)` - 更新用户（全量）
- `patchUser(id, data)` - 更新用户（部分）
- `deleteUser(id)` - 删除用户

### 文章 (Posts)

- `getPosts(params?)` - 获取所有文章
- `getPostById(id, params?)` - 获取单个文章
- `createPost(data)` - 创建文章
- `updatePost(id, data)` - 更新文章（全量）
- `patchPost(id, data)` - 更新文章（部分）
- `deletePost(id)` - 删除文章
- `publishPost(id)` - 发布文章
- `unpublishPost(id)` - 取消发布文章

### 评论 (Comments)

- `getComments(params?)` - 获取所有评论
- `getCommentById(id)` - 获取单个评论
- `createComment(data)` - 创建评论
- `updateComment(id, data)` - 更新评论（全量）
- `patchComment(id, data)` - 更新评论（部分）
- `deleteComment(id)` - 删除评论
- `getPostComments(postId)` - 获取文章的所有评论
- `getUserComments(userId)` - 获取用户的所有评论

### 认证 (Auth)

- `login({ username, password })` - 登录
- `logout()` - 登出
- `healthCheck()` - 健康检查

## 6. 环境切换

### 使用Mock数据（默认）

`.env.development`:

```
VITE_API_TARGET=http://localhost:3001
```

### 切换到真实后端

修改 `.env.development`:

```
VITE_API_TARGET=http://localhost:3000
```

然后重启前端开发服务器。

## 常见查询参数

```typescript
// 过滤
getPosts({ published: true, authorId: 1 });

// 分页
getPosts({ _page: 1, _limit: 10 });

// 排序
getPosts({ _sort: 'createdAt', _order: 'desc' });

// 范围
getPosts({ _start: 0, _end: 20 });

// 全文搜索
getPosts({ q: 'Vue' });

// 包含关联数据
getPosts({ _embed: 'comments' }); // 包含评论
getComments({ _expand: 'post' }); // 包含所属文章
```

## 故障排除

### 问题1：Mock服务器启动失败

- 检查3001端口是否被占用
- 检查`db.json`文件格式是否正确

### 问题2：API调用失败

- 确认Mock服务器正在运行
- 检查浏览器控制台的网络请求
- 检查Vite代理配置是否正确

### 问题3：数据修改后丢失

- JSON Server会持久化修改到`db.json`
- 如需恢复，手动编辑`frontend/mock/db.json`

## 更多信息

详细文档：[doc/json-server-integration.md](../doc/json-server-integration.md)
Mock数据说明：[frontend/mock/README.md](../frontend/mock/README.md)
