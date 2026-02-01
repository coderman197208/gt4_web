# routing Specification

## Purpose

TBD - created by archiving change refactor-homepage-to-app-container. Update Purpose after archive.
## Requirements
### Requirement: 根路径路由配置

系统 SHALL 将根路径 `/` 配置为应用容器组件，并支持嵌套子路由以实现多页面应用结构。

#### Scenario: 访问根路径时重定向到默认页面

- **GIVEN** 用户访问应用
- **WHEN** 用户导航到根路径 `/`
- **THEN** 应用应自动重定向到默认子路由 `/health-check`
- **AND** 应用容器布局应正确显示

#### Scenario: 嵌套路由正确渲染

- **GIVEN** 用户在应用容器页面
- **WHEN** 用户导航到子路径（如 `/health-check`）
- **THEN** 容器布局保持不变（页头、侧边栏）
- **AND** 主内容区域应显示对应的子路由组件

### Requirement: 健康检查页面路由

系统 SHALL 提供 `/health-check` 路由，用于访问健康检查功能页面。

#### Scenario: 导航到健康检查页面

- **GIVEN** 用户在应用中
- **WHEN** 用户导航到 `/health-check` 路径
- **THEN** 系统应在主内容区域显示健康检查视图
- **AND** 侧边栏中的"健康检查"菜单项应高亮

#### Scenario: 通过菜单导航到健康检查页面

- **GIVEN** 用户在侧边栏中查看菜单
- **WHEN** 用户点击"健康检查"菜单项
- **THEN** 应用应导航到 `/health-check` 路径
- **AND** 健康检查功能应正常可用

### Requirement: NDT管捆编辑页面路由

系统 SHALL 提供 `/tube-edit-ndt` 路由，用于访问 NDT 管捆编辑功能页面。

#### Scenario: 导航到NDT管捆编辑页面

- **GIVEN** 用户在应用中
- **WHEN** 用户导航到 `/tube-edit-ndt` 路径
- **THEN** 系统应在主内容区域显示 NDT 管捆编辑视图
- **AND** 侧边栏中的"NDT管捆编辑"菜单项应高亮

#### Scenario: 通过菜单导航到NDT管捆编辑页面

- **GIVEN** 用户在侧边栏中查看菜单
- **WHEN** 用户点击"NDT管捆编辑"菜单项
- **THEN** 应用应导航到 `/tube-edit-ndt` 路径
- **AND** NDT 管捆编辑功能应正常可用

