# Implementation Tasks

## 1. 准备工作
- [x] 将 `frontend/src/components/HealthCheckPanel.vue` 移动到 `frontend/src/views/HealthCheckView.vue`
- [x] 更新 HealthCheckView.vue 中的样式类名（如有必要）

## 2. 创建新组件
- [x] 创建 `frontend/src/components/AppHeader.vue`
  - [x] 添加左侧汉堡菜单按钮（三条横线图标）
  - [x] 添加中间标题"管体4号线L2过程机系统"
  - [x] 添加右侧实时时钟组件
  - [x] 实现响应式布局
- [x] 创建 `frontend/src/components/LiveClock.vue`
  - [x] 实现每秒更新的时钟显示
  - [x] 使用格式 `YYYY-MM-DD HH:mm:ss`
  - [x] 在 onMounted 时启动定时器
  - [x] 在 onUnmounted 时清理定时器
- [x] 创建 `frontend/src/components/AppSidebar.vue`（或复用现有 shadcn-vue Sidebar 组件）
  - [x] 实现导航菜单项列表
  - [x] 添加"健康检查"菜单项
  - [x] 实现路由导航功能
  - [x] 添加展开/收起动画效果

## 3. 重构 HomePage.vue
- [x] 移除现有的简单内容（h1, p, HealthCheckPanel）
- [x] 添加 AppHeader 组件
- [x] 添加 AppSidebar 组件
- [x] 添加 `<router-view>` 用于显示子路由内容
- [x] 实现侧边栏展开/收起状态管理
- [x] 添加容器布局样式（Flexbox）

## 4. 更新路由配置
- [x] 修改 `frontend/src/router/index.ts`
  - [x] 将根路径配置为包含子路由的容器
  - [x] 添加默认重定向到 `/health-check`
  - [x] 添加 `/health-check` 子路由指向 HealthCheckView
  - [x] 保留 `/login` 路由不变
  - [x] 更新 catch-all 重定向

## 5. 样式和UI优化
- [x] 使用 Tailwind CSS 设置页头高度和背景色
- [x] 设置侧边栏宽度和过渡动画
- [x] 确保内容区域正确占据剩余空间
- [x] 添加必要的分隔线和阴影效果
- [x] 确保响应式设计在不同屏幕尺寸下正常工作

## 6. 测试和验证
- [x] 验证汉堡菜单按钮点击能正确展开/收起侧边栏
- [x] 验证时钟每秒更新且格式正确
- [x] 验证点击"健康检查"菜单项能正确导航
- [x] 验证健康检查功能仍然正常工作
- [x] 验证页面在不同浏览器中的兼容性
- [x] 验证响应式布局在移动设备上的表现

## 7. 清理工作
- [x] 移除不再使用的导入和引用
- [x] 确保没有 lint 错误
- [x] 检查控制台是否有警告或错误
- [x] 更新相关文档（如有必要）

## 依赖关系
- 任务 3 依赖任务 2（需要先创建组件）
- 任务 4 依赖任务 1（需要先移动 HealthCheckView）
- 任务 6 依赖所有前置任务完成

## 并行执行机会
- 任务 1 和任务 2 可以并行执行
- 任务 2 中的三个子组件可以并行开发
