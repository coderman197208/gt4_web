# routing Specification Delta

## ADDED Requirements

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
