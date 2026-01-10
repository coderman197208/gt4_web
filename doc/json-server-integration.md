# JSON Server Mock数据集成方案

## 概述

本项目使用JSON Server作为开发环境的Mock数据服务，通过axios封装REST API调用，实现前后端分离开发。

## 项目结构

```
frontend/
├── mock/                    # Mock数据目录
│   ├── db.json             # 模拟数据库文件
│   ├── server.cjs          # JSON Server配置
│   └── README.md           # Mock数据使用文档
├── src/
│   ├── api/                # API调用封装目录
│   │   ├── client.ts       # axios实例配置（拦截器、统一配置）
│   │   ├── types.ts        # API类型定义
│   │   ├── users.ts        # 用户相关API
│   │   ├── posts.ts        # 文章相关API
│   │   ├── comments.ts     # 评论相关API
│   │   ├── auth.ts         # 认证相关API
│   │   └── index.ts        # 统一导出
│   └── ...
├── .env.development        # 开发环境变量（API目标：JSON Server）
├── .env.production         # 生产环境变量（API目标：真实后端）
└── vite.config.ts          # Vite配置（代理设置）
```

## 目录规划说明

### 1. Mock数据存放位置

**位置：** `frontend/mock/`

**文件：**
- `db.json` - 包含所有Mock数据（users、posts、comments等）
- `server.js` - JSON Server自定义配置（路由、中间件、延迟模拟）
- `README.md` - Mock数据使用说明文档

**特点：**
- 数据独立于源代码，易于维护
- 支持自定义路由和业务逻辑
- 可模拟网络延迟，接近真实环境

### 2. REST API定义位置

**位置：** `frontend/src/api/types.ts`

**内容：**
- API请求/响应的TypeScript类型定义
- 数据模型接口（User、Post、Comment等）
- 通用类型（ApiResponse、PaginationParams等）

**示例：**
```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}
```

### 3. API调用函数封装位置

**位置：** `frontend/src/api/`

**文件组织：**
```
api/
├── client.ts          # axios实例和请求封装
├── types.ts           # 类型定义
├── users.ts           # 用户API：getUsers, createUser, updateUser等
├── posts.ts           # 文章API：getPosts, createPost, publishPost等
├── comments.ts        # 评论API：getComments, createComment等
├── auth.ts            # 认证API：login, logout, healthCheck等
└── index.ts           # 统一导出所有API
```

**设计原则：**
- **模块化**：按业务领域分文件（users、posts、comments）
- **类型安全**：所有函数都有完整的TypeScript类型
- **统一封装**：通过client.ts统一处理请求/响应
- **易于使用**：通过index.ts统一导出，支持按需导入

**使用示例：**
```typescript
// 方式1：导入所有API
import * as api from '@/api';
const users = await api.getUsers();

// 方式2：按需导入
import { getUsers, createPost } from '@/api';
const users = await getUsers();
```

## 技术实现

### 1. axios客户端配置（client.ts）

**功能：**
- 创建axios实例，配置baseURL为`/api`
- 请求拦截器：自动添加token、防缓存参数
- 响应拦截器：统一错误处理、token过期处理
- 封装通用请求方法（get、post、put、patch、delete）

**关键代码：**
```typescript
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 统一错误处理
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);
```

### 2. Vite代理配置

**位置：** `frontend/vite.config.ts`

**配置：**
```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: process.env.VITE_API_TARGET || 'http://localhost:3001',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

**说明：**
- 前端请求`/api/users` → 代理到 `http://localhost:3001/users`
- 通过环境变量`VITE_API_TARGET`控制代理目标
- `rewrite`规则：移除`/api`前缀，直接访问JSON Server资源

### 3. 环境切换

**开发环境（.env.development）：**
```
VITE_API_TARGET=http://localhost:3001  # JSON Server
```

**生产环境（.env.production）：**
```
VITE_API_TARGET=http://localhost:3000  # 真实后端
```

**切换方式：**
- 开发时默认使用JSON Server
- 构建生产版本时自动切换到真实后端
- 也可手动修改`.env.development`临时切换

## API使用示例

### 基础使用

```typescript
import { getUsers, createPost, login } from '@/api';

// 获取用户列表
const users = await getUsers();

// 创建文章
const post = await createPost({
  title: '新文章',
  content: '内容',
  authorId: 1,
  published: true,
});

// 登录
const result = await login({
  username: 'admin',
  password: 'password',
});
```

### 高级查询

```typescript
import { getPosts, getComments } from '@/api';

// 分页查询
const posts = await getPosts({
  _page: 1,
  _limit: 10,
  _sort: 'createdAt',
  _order: 'desc',
});

// 条件过滤
const publishedPosts = await getPosts({ published: true });

// 关系查询
const postsWithComments = await getPosts({ _embed: 'comments' });
```

### 在Vue组件中使用

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUsers, type User } from '@/api';

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref('');

async function fetchUsers() {
  try {
    loading.value = true;
    users.value = await getUsers();
  } catch (err: any) {
    error.value = err.message || '获取用户失败';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchUsers();
});
</script>
```

## 启动服务

### 启动JSON Server

**方式1：在项目根目录启动**
```bash
pnpm mock:server
```

**方式2：在frontend目录启动**
```bash
cd frontend
pnpm mock:server
```

服务器将在`http://localhost:3001`启动。

### 启动前端开发服务器

```bash
# 在项目根目录
cd frontend
pnpm dev
```

前端将在`http://localhost:5173`启动，通过代理访问JSON Server。

### 同时启动两个服务

**方式1：一键启动（推荐）**
```bash
# 在项目根目录
pnpm dev:mock
```
这会同时启动Mock服务器(3001端口)和前端开发服务器(5173端口)。

**方式2：分别启动**
在两个终端窗口分别运行：

**终端1：**
```bash
pnpm mock:server
```

**终端2：**
```bash
cd frontend
pnpm dev
```

## 测试

访问 `http://localhost:5173/api-demo` 查看API使用示例页面，包含：
- 健康检查测试
- 用户CRUD操作
- 文章CRUD操作
- 评论查询
- 登录测试

## JSON Server功能

### 自动生成的REST端点

- `GET /users` - 获取所有用户
- `GET /users/:id` - 获取单个用户
- `POST /users` - 创建用户
- `PUT /users/:id` - 更新用户（全量）
- `PATCH /users/:id` - 更新用户（部分）
- `DELETE /users/:id` - 删除用户

同样适用于posts、comments等资源。

### 自定义端点

在`mock/server.js`中定义：
- `GET /health` - 健康检查
- `POST /auth/login` - 模拟登录
- `GET /users/:id/posts` - 获取用户的文章

### 查询参数支持

- 过滤：`?published=true&authorId=1`
- 分页：`?_page=1&_limit=10`
- 排序：`?_sort=createdAt&_order=desc`
- 全文搜索：`?q=keyword`
- 关系查询：`?_embed=comments` / `?_expand=user`

详见 [frontend/mock/README.md](../frontend/mock/README.md)

## 最佳实践

1. **类型安全**：始终为API函数定义TypeScript类型
2. **错误处理**：使用try-catch捕获API错误，提供用户友好的提示
3. **加载状态**：在组件中管理loading状态，提升用户体验
4. **按需导入**：只导入需要的API函数，减少bundle大小
5. **环境切换**：开发用Mock，测试/生产用真实API
6. **数据验证**：在创建/更新数据前进行客户端验证

## 注意事项

1. Mock数据仅用于开发环境，不要用于生产
2. JSON Server会持久化修改到`db.json`，需要时手动恢复
3. JSON Server端口（3001）需避免与其他服务冲突
4. 真实后端API接口需与Mock API保持一致
5. 敏感信息（如密码）不要存储在Mock数据中

## 迁移到真实后端

当真实后端API准备就绪时：

1. 确保后端API端点与Mock API一致
2. 修改`.env.development`中的`VITE_API_TARGET`
3. 或直接停用Mock Server，启动真实后端
4. 测试所有API调用功能正常
5. 根据实际API响应调整类型定义（如有差异）

## 参考资源

- [JSON Server官方文档](https://github.com/typicode/json-server)
- [axios官方文档](https://axios-http.com/)
- [Vite代理配置](https://vitejs.dev/config/server-options.html#server-proxy)
