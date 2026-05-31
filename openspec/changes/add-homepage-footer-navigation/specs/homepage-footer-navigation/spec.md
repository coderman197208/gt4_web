# homepage-footer-navigation Specification

## Purpose

定义 HomePage 页脚导航带与品牌区的行为要求，确保固定全屏 HMI 壳层具备稳定、可复用且与 MainMonitorView 同源的底部导航体验。

## ADDED Requirements

### Requirement: 系统必须在 HomePage 壳层底部提供固定页脚导航层

系统 SHALL 在 `HomePage` 壳层底部渲染一个固定页脚层，用于承载底部导航和品牌区；该页脚层必须对 `HomePage` 下的业务子路由统一生效，并继续保持固定全屏 HMI 布局，不得引入浏览器级滚动条。

#### Scenario: HomePage 子路由统一显示页脚且不破坏全屏布局
- **GIVEN** 当前页面挂载在 `HomePage` 壳层下
- **WHEN** 操作员进入 `main-monitor`、`contract-editing`、`parameter-setting` 或其他 `HomePage` 子路由
- **THEN** 系统必须在内容区下方显示统一的页脚导航层
- **AND** 新增页脚后页面仍不得出现浏览器级滚动条

### Requirement: 系统必须按 10 等宽槽位基线呈现首批迁移的页脚导航入口

系统 SHALL 在页脚左侧提供一条连续、无间隙的 10 等宽槽位导航带，并按固定顺序承载首批迁移入口：主监控、合同数据编辑、参数设定、格式设定、管捆编辑、报警管理；未纳入本次迁移范围的槽位不得被映射到新的业务页面。

#### Scenario: admin 场景下按固定顺序呈现已迁移入口
- **GIVEN** 当前用户具备 `admin` 权限
- **WHEN** 系统渲染页脚左侧导航带
- **THEN** 前 6 个槽位必须按“主监控、合同数据编辑、参数设定、格式设定、管捆编辑、报警管理”的顺序显示可交互入口
- **AND** 剩余槽位必须保留为非交互占位单元，而不是映射到其他未点名菜单

#### Scenario: 非 admin 场景下保持槽位顺序但不暴露报警管理入口
- **GIVEN** 当前用户不具备 `admin` 权限
- **WHEN** 系统渲染页脚左侧导航带
- **THEN** 报警管理对应槽位不得提供可点击入口
- **AND** 其余已迁移入口的相对顺序必须保持不变

### Requirement: 系统必须让页脚导航与侧边栏保持一致的路由与激活态语义

系统 SHALL 让页脚导航按钮复用与 `AppSidebar` 一致的页面跳转目标、文案和激活态语义，同时在引入页脚后继续保留现有 `AppSidebar`。

#### Scenario: 点击页脚入口后进入与侧边栏一致的目标页面
- **GIVEN** 某个已迁移页面入口同时存在于页脚和 `AppSidebar`
- **WHEN** 操作员点击页脚中的该入口
- **THEN** 系统必须导航到与 `AppSidebar` 对应菜单项相同的目标路由
- **AND** 现有 `AppSidebar` 不得因为引入页脚而被移除

#### Scenario: 当前页面对应的页脚入口显示激活态
- **GIVEN** 操作员当前位于某个已迁移入口对应的页面
- **WHEN** 系统渲染页脚导航
- **THEN** 对应入口必须显示激活态
- **AND** 其他未激活入口必须保持可区分的非激活态

### Requirement: 系统必须在页脚右侧展示与 HMI 工业风格一致的品牌文案区

系统 SHALL 在页脚右侧提供独立的品牌文案区，展示“设备部设控中心”文字，并使用与 `MainMonitorView` 同源的工业 HMI 视觉语言，使品牌区与左侧按钮带并列存在而不相互覆盖。

#### Scenario: 品牌文案区在页脚右侧稳定显示
- **GIVEN** 系统渲染 `HomePage` 页脚
- **WHEN** 操作员查看页脚右侧区域
- **THEN** 系统必须显示“设备部设控中心”文案
- **AND** 该文案区必须位于页脚右侧且与左侧导航带分区明确