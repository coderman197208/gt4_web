# Design: 应用容器布局架构

## Architecture Overview

采用经典的应用容器布局模式，将 HomePage 作为主容器组件，承载全局 UI 元素（页头、侧边栏）和子路由视图。

## Component Structure

```
HomePage (容器)
├── AppHeader (页头组件)
│   ├── MenuToggleButton (左侧汉堡菜单)
│   ├── SystemTitle (中间标题)
│   └── LiveClock (右侧实时时钟)
├── AppSidebar (侧边栏组件)
│   └── NavigationMenu (导航菜单)
└── RouterView (子路由内容区)
    └── HealthCheckView (健康检查页面)
```

## Technical Decisions

### 1. 组件复用策略
- **使用现有 shadcn-vue 组件**：
  - Sidebar 系列组件用于侧边栏
  - Sheet 组件作为移动端抽屉式菜单的备选方案
  - Separator 用于分隔
- **自定义组件**：
  - AppHeader: 顶部页头（新建）
  - LiveClock: 实时时钟组件（新建）

### 2. 状态管理
- **侧边栏状态**：使用 Vue ref 在 HomePage 本地管理，无需引入 Pinia
- **当前路由高亮**：通过 Vue Router 的 `useRoute()` 和动态 class 实现

### 3. 路由设计
采用嵌套路由模式：
```typescript
{
  path: '/',
  component: HomePage,
  children: [
    {
      path: '',
      redirect: '/health-check'
    },
    {
      path: 'health-check',
      name: 'health-check',
      component: HealthCheckView
    }
    // 未来可添加更多子路由
  ]
}
```

### 4. 布局方案
- 使用 CSS Flexbox 进行主布局
- 页头固定高度（如 60px）
- 侧边栏固定宽度（如 240px），可折叠
- 内容区域自适应剩余空间

### 5. 实时时钟实现
- 使用 `setInterval` 每秒更新时间
- 在组件 `onMounted` 时启动定时器
- 在组件 `onUnmounted` 时清理定时器，防止内存泄漏
- 格式：`YYYY-MM-DD HH:mm:ss`

### 6. 响应式设计考虑
- 在移动设备上，侧边栏默认折叠
- 可考虑使用 Sheet 组件替代 Sidebar 以提供更好的移动体验
- 页头布局需要适配小屏幕（标题可适当缩短或隐藏）

## File Movement Rationale

将 `HealthCheckPanel.vue` 从 `components/` 移至 `views/`：
- **理由**：该组件现在作为独立页面存在，而非可复用的 UI 组件
- **命名变更**：`HealthCheckPanel.vue` → `HealthCheckView.vue`，符合 views 目录下的命名约定
- **导入路径**：所有引用需更新

## Integration Points

- **与 Vue Router 集成**：通过 `<router-view>` 渲染子路由
- **与现有样式系统集成**：使用 Tailwind CSS 类进行样式设置
- **与未来功能集成**：容器设计支持轻松添加新的导航项和子路由

## Performance Considerations

- 实时时钟仅更新一个响应式变量，性能影响可忽略
- 侧边栏切换使用 CSS transition，性能良好
- 子路由懒加载可在未来需要时实现

## Accessibility

- 汉堡菜单按钮需要适当的 aria-label
- 侧边栏应支持键盘导航
- 时钟显示应有适当的语义化标签

## Future Enhancements

- 用户设置（可折叠侧边栏状态的持久化）
- 多语言支持（标题和菜单项）
- 主题切换器集成到页头
- 面包屑导航
- 搜索功能
