# Mock Data Server

本目录包含使用 JSON Server 的模拟数据配置，用于前端开发时的数据Mock。

## 文件说明

- **db.json** - 模拟数据库文件，包含所有Mock数据
- **server.cjs** - JSON Server配置文件，包含自定义路由和中间件

## 数据结构

### Users (用户)
```json
{
  "id": number,
  "username": string,
  "email": string,
  "role": "admin" | "user",
  "createdAt": string (ISO 8601)
}
```

### Posts (文章)
```json
{
  "id": number,
  "title": string,
  "content": string,
  "authorId": number,
  "createdAt": string (ISO 8601),
  "published": boolean
}
```

### Comments (评论)
```json
{
  "id": number,
  "postId": number,
  "userId": number,
  "content": string,
  "createdAt": string (ISO 8601)
}
```

## API端点

### 标准REST端点

JSON Server自动为每个资源生成标准的REST API：

#### Users
- `GET /users` - 获取所有用户
- `GET /users/:id` - 获取单个用户
- `POST /users` - 创建用户
- `PUT /users/:id` - 更新用户（全量）
- `PATCH /users/:id` - 更新用户（部分）
- `DELETE /users/:id` - 删除用户

#### Posts
- `GET /posts` - 获取所有文章
- `GET /posts/:id` - 获取单个文章
- `POST /posts` - 创建文章
- `PUT /posts/:id` - 更新文章（全量）
- `PATCH /posts/:id` - 更新文章（部分）
- `DELETE /posts/:id` - 删除文章

#### Comments
- `GET /comments` - 获取所有评论
- `GET /comments/:id` - 获取单个评论
- `POST /comments` - 创建评论
- `PUT /comments/:id` - 更新评论（全量）
- `PATCH /comments/:id` - 更新评论（部分）
- `DELETE /comments/:id` - 删除评论

### 自定义端点

- `GET /health` - 健康检查
- `POST /auth/login` - 模拟登录（接收username和password）
- `GET /users/:id/posts` - 获取指定用户的所有文章

### 查询参数

JSON Server支持丰富的查询参数：

#### 过滤
```
GET /posts?published=true
GET /users?role=admin
GET /posts?authorId=1&published=true
```

#### 分页
```
GET /posts?_page=1&_limit=10
```

#### 排序
```
GET /posts?_sort=createdAt&_order=desc
GET /users?_sort=username&_order=asc
```

#### 切片
```
GET /posts?_start=0&_end=10
```

#### 全文搜索
```
GET /posts?q=Vue
```

#### 关系查询
```
GET /posts?_embed=comments  # 包含评论
GET /comments?_expand=post  # 包含所属文章
```

## 使用方法

### 启动Mock服务器

```bash
# 在项目根目录执行
pnpm mock:server
```

服务器将在 `http://localhost:3001` 启动。

### 在前端代码中使用

```typescript
import { getUsers, createPost } from '@/api';

// 获取用户列表
const users = await getUsers();

// 创建文章
const newPost = await createPost({
  title: 'New Post',
  content: 'Post content',
  authorId: 1,
  published: true
});
```

## 特性

- **自动保存** - 通过POST、PUT、PATCH或DELETE请求修改的数据会自动保存到db.json
- **网络延迟模拟** - 所有请求添加300ms延迟，模拟真实网络环境
- **CORS支持** - 默认启用CORS，支持跨域请求
- **热重载** - 修改db.json后无需重启服务器

## 注意事项

1. Mock服务器仅用于开发环境，不要在生产环境使用
2. 数据修改会持久化到db.json，需要时可手动恢复
3. 服务器端口为3001（避免与backend的3000端口冲突）
4. Vite开发服务器已配置代理，前端通过`/api`访问Mock服务器

## 参考资源

- [JSON Server文档](https://github.com/typicode/json-server)
- [JSON Server查询语法](https://github.com/typicode/json-server#routes)
