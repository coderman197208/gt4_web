## ADDED Requirements

### Requirement: NDT成捆编辑页面路由

系统 SHALL 提供 `/bundle-edit-ndt` 路由，用于访问 NDT 成捆编辑功能页面。

#### Scenario: 导航到NDT成捆编辑页面

- **GIVEN** 用户在应用中
- **WHEN** 用户导航到 `/bundle-edit-ndt` 路径
- **THEN** 系统应在主内容区域显示 NDT 成捆编辑视图
- **AND** 侧边栏中的"NDT成捆画面"菜单项应高亮

#### Scenario: 通过菜单导航到NDT成捆编辑页面

- **GIVEN** 用户在侧边栏中查看菜单
- **WHEN** 用户点击"NDT成捆画面"菜单项
- **THEN** 应用应导航到 `/bundle-edit-ndt` 路径
- **AND** NDT 成捆编辑功能应正常可用
