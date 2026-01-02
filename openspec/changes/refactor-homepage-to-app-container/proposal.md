# Change: 重构 HomePage 为应用容器页面

## Why
当前 HomePage.vue 仅作为简单的欢迎页面。随着应用功能的扩展，需要一个统一的应用容器页面来承载导航、页头信息和页面路由，提供一致的用户体验。

## What Changes
- 将 HomePage.vue 重构为应用的主容器布局页面
- 添加顶部页头，包含：
  - 左侧：汉堡菜单图标（三条横线），点击展开/收起侧边栏
  - 中间：系统标题显示"管体4号线L2过程机系统"
  - 右侧：实时时钟显示（每秒更新）
- 添加可展开/收起的侧边栏导航菜单
  - 初始菜单项：健康检查
  - 点击菜单项时切换到对应视图
- 将 HealthCheckPanel.vue 从 components 目录移动到 views 目录
- 更新路由配置，使 HomePage 成为包含子路由的容器
- 添加默认子路由指向健康检查页面

## Impact
- **受影响的文件**：
  - `frontend/src/views/HomePage.vue` - 完全重构
  - `frontend/src/components/HealthCheckPanel.vue` → `frontend/src/views/HealthCheckView.vue` - 移动并重命名
  - `frontend/src/router/index.ts` - 路由配置更新
  - 可能需要新增侧边栏和页头组件
- **受影响的规范**：app-layout（新增）、routing（修改）
- **用户体验影响**：提供更专业的应用界面和更好的导航体验
- **兼容性**：现有功能保持不变，但页面结构变化
