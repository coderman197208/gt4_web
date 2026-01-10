# Shadcn-Vue UI组件使用规范

## 概述

本项目使用 [shadcn-vue](https://www.shadcn-vue.com/) 作为UI组件库，基于以下技术栈：
- **Vue 3** - Composition API
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式系统
- **Reka UI** - 无头组件库（底层实现）

所有组件位于 `frontend/src/components/ui/` 目录。

## 已安装组件清单

### ✅ 已使用的组件

| 组件 | 状态 | 使用场景 | 文档 |
|------|------|----------|------|
| Button | 🟢 活跃 | 所有交互按钮 | [查看](#button-按钮) |
| Card | 🟢 活跃 | 登录表单容器 | [查看](#card-卡片) |
| Input | 🟢 活跃 | 表单输入 | [查看](#input-输入框) |
| Label | 🟢 活跃 | 表单标签 | [查看](#label-标签) |
| Sheet | 🟢 活跃 | Sidebar弹出层 | [查看](#sheet-弹出层) |
| Separator | 🟢 使用 | 内容分隔 | [查看](#separator-分隔线) |
| Tooltip | 🟢 使用 | 提示信息 | [查看](#tooltip-提示) |
| Skeleton | 🟢 使用 | 加载骨架 | [查看](#skeleton-骨架屏) |

### 🟡 已安装未使用的组件

| 组件 | 推荐场景 | 优先级 |
|------|----------|--------|
| Table | 数据列表展示 | 高 |
| Menubar | 应用菜单栏 | 中 |
| NavigationMenu | 顶部导航 | 中 |

### 🔧 Sidebar复合组件

Sidebar是一个完整的侧边栏系统，包含25个子组件，提供丰富的导航功能。

---

## 组件使用规范

### 通用规则

#### 1. 导入规范

```typescript
// ✅ 推荐：从统一入口导入
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

// ❌ 避免：直接导入组件文件
import Button from '@/components/ui/button/Button.vue';
```

#### 2. TypeScript类型

所有组件都提供完整的TypeScript类型支持：

```typescript
import type { ButtonVariants } from '@/components/ui/button';

// 使用变体类型
const variant: ButtonVariants['variant'] = 'default';
```

#### 3. 样式定制

使用 `class` 属性添加自定义样式：

```vue
<Button class="w-full mt-4">
  提交
</Button>
```

#### 4. 无障碍访问

始终提供适当的ARIA属性：

```vue
<Button aria-label="关闭对话框" variant="ghost" size="icon">
  <X class="h-4 w-4" />
</Button>
```

---

## 组件详细指南

### Button (按钮)

#### 基本用法

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button';
</script>

<template>
  <Button @click="handleClick">
    点击我
  </Button>
</template>
```

#### 变体 (Variants)

```vue
<!-- 默认样式 -->
<Button variant="default">Default</Button>

<!-- 次要样式 -->
<Button variant="secondary">Secondary</Button>

<!-- 轮廓样式 -->
<Button variant="outline">Outline</Button>

<!-- 幽灵样式（透明背景） -->
<Button variant="ghost">Ghost</Button>

<!-- 链接样式 -->
<Button variant="link">Link</Button>

<!-- 危险操作 -->
<Button variant="destructive">Delete</Button>
```

#### 尺寸 (Sizes)

```vue
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">
  <Icon />
</Button>
```

#### 状态

```vue
<!-- 禁用状态 -->
<Button :disabled="isLoading">
  {{ isLoading ? '加载中...' : '提交' }}
</Button>

<!-- 加载状态 -->
<Button :disabled="isLoading">
  <Loader v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
  {{ isLoading ? '处理中...' : '提交' }}
</Button>
```

#### 作为其他元素

```vue
<!-- 作为链接 -->
<Button as-child>
  <a href="/home">返回首页</a>
</Button>

<!-- 作为RouterLink -->
<Button as-child>
  <RouterLink to="/dashboard">Dashboard</RouterLink>
</Button>
```

#### 实际案例

参考文件：
- [ApiDemoView.vue](../frontend/src/views/ApiDemoView.vue) - 各种变体使用
- [LoginView.vue](../frontend/src/views/LoginView.vue) - 表单提交按钮
- [AppHeader.vue](../frontend/src/components/AppHeader.vue) - 图标按钮

---

### Card (卡片)

#### 基本结构

```vue
<script setup lang="ts">
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>卡片标题</CardTitle>
      <CardDescription>卡片描述文字</CardDescription>
    </CardHeader>
    <CardContent>
      <!-- 主要内容 -->
      <p>这里是卡片的主要内容区域</p>
    </CardContent>
    <CardFooter>
      <!-- 底部操作区 -->
      <Button>操作按钮</Button>
    </CardFooter>
  </Card>
</template>
```

#### 登录表单卡片

```vue
<Card class="w-full max-w-md">
  <CardHeader class="space-y-1">
    <CardTitle class="text-2xl font-bold text-center">登录</CardTitle>
    <CardDescription class="text-center">
      输入您的账号信息以登录系统
    </CardDescription>
  </CardHeader>
  <CardContent>
    <form @submit.prevent="handleSubmit">
      <!-- 表单内容 -->
    </form>
  </CardContent>
</Card>
```

#### 实际案例

参考文件：[LoginView.vue](../frontend/src/views/LoginView.vue)

---

### Input (输入框)

#### 基本用法

```vue
<script setup lang="ts">
import { Input } from '@/components/ui/input';
import { ref } from 'vue';

const email = ref('');
</script>

<template>
  <Input
    v-model="email"
    type="email"
    placeholder="请输入邮箱"
  />
</template>
```

#### 配合Label使用

```vue
<script setup lang="ts">
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
</script>

<template>
  <div class="space-y-2">
    <Label for="email">邮箱</Label>
    <Input
      id="email"
      v-model="formData.email"
      type="email"
      placeholder="请输入邮箱"
      required
      autocomplete="email"
    />
  </div>
</template>
```

#### 不同类型

```vue
<!-- 文本输入 -->
<Input type="text" placeholder="用户名" />

<!-- 密码输入 -->
<Input type="password" placeholder="密码" />

<!-- 邮箱输入 -->
<Input type="email" placeholder="邮箱" />

<!-- 数字输入 -->
<Input type="number" placeholder="年龄" />

<!-- 搜索输入 -->
<Input type="search" placeholder="搜索..." />
```

#### 禁用状态

```vue
<Input disabled placeholder="禁用状态" />
```

#### 实际案例

参考文件：[LoginView.vue](../frontend/src/views/LoginView.vue)

---

### Label (标签)

#### 基本用法

```vue
<script setup lang="ts">
import { Label } from '@/components/ui/label';
</script>

<template>
  <Label for="username">用户名</Label>
</template>
```

#### 配合表单控件

```vue
<div class="space-y-2">
  <Label for="password">密码</Label>
  <Input
    id="password"
    type="password"
    v-model="password"
  />
</div>
```

---

### Sheet (弹出层)

#### 基本用法

```vue
<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
</script>

<template>
  <Sheet>
    <SheetTrigger as-child>
      <Button variant="outline">打开</Button>
    </SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>标题</SheetTitle>
        <SheetDescription>描述文字</SheetDescription>
      </SheetHeader>
      <div class="py-4">
        <!-- 内容区域 -->
      </div>
    </SheetContent>
  </Sheet>
</template>
```

#### 不同方向

```vue
<!-- 从右侧弹出（默认） -->
<SheetContent side="right">...</SheetContent>

<!-- 从左侧弹出 -->
<SheetContent side="left">...</SheetContent>

<!-- 从顶部弹出 -->
<SheetContent side="top">...</SheetContent>

<!-- 从底部弹出 -->
<SheetContent side="bottom">...</SheetContent>
```

---

### Separator (分隔线)

#### 基本用法

```vue
<script setup lang="ts">
import { Separator } from '@/components/ui/separator';
</script>

<template>
  <div>
    <div class="space-y-1">
      <h4 class="text-sm font-medium">Section 1</h4>
      <p class="text-sm text-muted-foreground">Content here</p>
    </div>
    <Separator class="my-4" />
    <div class="space-y-1">
      <h4 class="text-sm font-medium">Section 2</h4>
      <p class="text-sm text-muted-foreground">Content here</p>
    </div>
  </div>
</template>
```

#### 垂直分隔线

```vue
<div class="flex h-5 items-center space-x-4">
  <div>Item 1</div>
  <Separator orientation="vertical" />
  <div>Item 2</div>
  <Separator orientation="vertical" />
  <div>Item 3</div>
</div>
```

---

### Tooltip (提示)

#### 基本用法

```vue
<script setup lang="ts">
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>这是提示内容</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
```

#### 不同位置

```vue
<TooltipContent side="top">顶部</TooltipContent>
<TooltipContent side="right">右侧</TooltipContent>
<TooltipContent side="bottom">底部</TooltipContent>
<TooltipContent side="left">左侧</TooltipContent>
```

---

### Skeleton (骨架屏)

#### 基本用法

```vue
<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';
</script>

<template>
  <div class="space-y-2">
    <Skeleton class="h-4 w-[250px]" />
    <Skeleton class="h-4 w-[200px]" />
    <Skeleton class="h-4 w-[150px]" />
  </div>
</template>
```

#### 卡片骨架

```vue
<div class="flex items-center space-x-4">
  <Skeleton class="h-12 w-12 rounded-full" />
  <div class="space-y-2">
    <Skeleton class="h-4 w-[250px]" />
    <Skeleton class="h-4 w-[200px]" />
  </div>
</div>
```

#### 加载状态

```vue
<template>
  <div v-if="isLoading">
    <Skeleton class="h-8 w-full mb-4" />
    <Skeleton class="h-4 w-3/4 mb-2" />
    <Skeleton class="h-4 w-1/2" />
  </div>
  <div v-else>
    <!-- 实际内容 -->
  </div>
</template>
```

---

## Table组件使用指南

### 基本表格

```vue
<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const users = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'admin' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: 'user' },
]);
</script>

<template>
  <Table>
    <TableCaption>用户列表</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>ID</TableHead>
        <TableHead>姓名</TableHead>
        <TableHead>邮箱</TableHead>
        <TableHead>角色</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="user in users" :key="user.id">
        <TableCell>{{ user.id }}</TableCell>
        <TableCell>{{ user.name }}</TableCell>
        <TableCell>{{ user.email }}</TableCell>
        <TableCell>{{ user.role }}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
```

### 空状态表格

```vue
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>列1</TableHead>
      <TableHead>列2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableEmpty v-if="data.length === 0" :cols="2">
      暂无数据
    </TableEmpty>
    <TableRow v-else v-for="item in data" :key="item.id">
      <!-- 数据行 -->
    </TableRow>
  </TableBody>
</Table>
```

---

## 最佳实践

### 1. 组件组合

将shadcn组件与业务逻辑分离：

```vue
<!-- UserCard.vue - 业务组件 -->
<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

defineProps<{
  user: User;
}>();

const emit = defineEmits<{
  edit: [id: number];
  delete: [id: number];
}>();
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ user.name }}</CardTitle>
    </CardHeader>
    <CardContent>
      <p>{{ user.email }}</p>
      <div class="mt-4 space-x-2">
        <Button @click="emit('edit', user.id)" variant="outline" size="sm">
          编辑
        </Button>
        <Button @click="emit('delete', user.id)" variant="destructive" size="sm">
          删除
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
```

### 2. 表单验证

结合组件实现表单验证：

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const email = ref('');
const emailError = ref('');

const isValidEmail = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
});

function validateEmail() {
  if (!email.value) {
    emailError.value = '邮箱不能为空';
  } else if (!isValidEmail.value) {
    emailError.value = '邮箱格式不正确';
  } else {
    emailError.value = '';
  }
}
</script>

<template>
  <div class="space-y-2">
    <Label for="email">邮箱</Label>
    <Input
      id="email"
      v-model="email"
      type="email"
      @blur="validateEmail"
      :class="{ 'border-red-500': emailError }"
    />
    <p v-if="emailError" class="text-sm text-red-500">
      {{ emailError }}
    </p>
  </div>
</template>
```

### 3. 响应式设计

使用Tailwind的响应式类：

```vue
<Card class="w-full md:w-1/2 lg:w-1/3">
  <CardContent class="p-4 md:p-6">
    <!-- 移动端小内边距，桌面端大内边距 -->
  </CardContent>
</Card>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- 移动端1列，平板2列，桌面3列 -->
  <Card v-for="item in items" :key="item.id">
    <!-- 卡片内容 -->
  </Card>
</div>
```

### 4. 加载状态

优雅地处理加载状态：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const isLoading = ref(true);
const data = ref(null);

onMounted(async () => {
  isLoading.value = true;
  data.value = await fetchData();
  isLoading.value = false;
});
</script>

<template>
  <Card v-if="isLoading">
    <CardContent class="p-6">
      <Skeleton class="h-8 w-full mb-4" />
      <Skeleton class="h-4 w-3/4 mb-2" />
      <Skeleton class="h-4 w-1/2" />
    </CardContent>
  </Card>
  <Card v-else>
    <CardContent>
      <!-- 实际内容 -->
    </CardContent>
  </Card>
</template>
```

---

## 常见模式

### 对话框表单

```vue
<Sheet v-model:open="isOpen">
  <SheetTrigger as-child>
    <Button>新增用户</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>新增用户</SheetTitle>
      <SheetDescription>填写用户信息</SheetDescription>
    </SheetHeader>
    <form @submit.prevent="handleSubmit" class="space-y-4 py-4">
      <div class="space-y-2">
        <Label for="name">姓名</Label>
        <Input id="name" v-model="formData.name" />
      </div>
      <div class="space-y-2">
        <Label for="email">邮箱</Label>
        <Input id="email" v-model="formData.email" type="email" />
      </div>
      <Button type="submit" class="w-full">保存</Button>
    </form>
  </SheetContent>
</Sheet>
```

### 确认操作

```vue
<Button
  variant="destructive"
  @click="handleDelete"
  :disabled="isDeleting"
>
  <Trash v-if="!isDeleting" class="mr-2 h-4 w-4" />
  <Loader v-else class="mr-2 h-4 w-4 animate-spin" />
  {{ isDeleting ? '删除中...' : '删除' }}
</Button>
```

### 列表卡片

```vue
<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <Card v-for="item in items" :key="item.id">
    <CardHeader>
      <CardTitle>{{ item.title }}</CardTitle>
      <CardDescription>{{ item.description }}</CardDescription>
    </CardHeader>
    <CardContent>
      <p>{{ item.content }}</p>
    </CardContent>
    <CardFooter class="flex justify-between">
      <Button variant="outline" size="sm">查看</Button>
      <Button variant="ghost" size="sm">编辑</Button>
    </CardFooter>
  </Card>
</div>
```

---

## 注意事项

### 1. 避免样式冲突

```vue
<!-- ❌ 避免直接修改组件内部样式 -->
<Button class="!bg-red-500">Bad</Button>

<!-- ✅ 使用variant或创建自定义组件 -->
<Button variant="destructive">Good</Button>
```

### 2. 保持类型安全

```typescript
// ✅ 使用类型导入
import type { ButtonVariants } from '@/components/ui/button';

// ✅ 为props定义类型
defineProps<{
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
}>();
```

### 3. 可访问性

```vue
<!-- ✅ 提供aria-label -->
<Button variant="ghost" size="icon" aria-label="关闭">
  <X class="h-4 w-4" />
</Button>

<!-- ✅ Label与Input关联 -->
<Label for="username">用户名</Label>
<Input id="username" v-model="username" />
```

### 4. 性能优化

```vue
<!-- ✅ 使用v-show代替v-if用于频繁切换 -->
<Skeleton v-show="isLoading" class="h-8 w-full" />
<div v-show="!isLoading">{{ content }}</div>

<!-- ✅ 大列表使用虚拟滚动 -->
<!-- 考虑使用vue-virtual-scroller等库 -->
```

---

## 扩展组件

如需创建自定义组件，建议：

1. **继承shadcn组件**
2. **保持一致的API设计**
3. **提供TypeScript类型**
4. **遵循无障碍标准**

```vue
<!-- MyCustomButton.vue -->
<script setup lang="ts">
import { Button } from '@/components/ui/button';
import type { ButtonVariants } from '@/components/ui/button';

interface Props {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  loading?: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <Button :variant="variant" :size="size" :disabled="loading">
    <Loader v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
    <slot />
  </Button>
</template>
```

---

## 参考资源

- [Shadcn-Vue 官方文档](https://www.shadcn-vue.com/)
- [Reka UI 文档](https://reka-ui.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Vue 3 文档](https://vuejs.org/)

## 项目实际案例

查看以下文件了解组件的实际应用：

- [ApiDemoView.vue](../frontend/src/views/ApiDemoView.vue) - Button组件各种用法
- [LoginView.vue](../frontend/src/views/LoginView.vue) - Card、Input、Label表单组合
- [AppHeader.vue](../frontend/src/components/AppHeader.vue) - 图标按钮
- [AppSidebar.vue](../frontend/src/components/AppSidebar.vue) - 导航链接

---

*最后更新：2026年1月10日*
