# app-layout Specification Delta

## MODIFIED Requirements

### Requirement: 侧边栏导航
系统 SHALL 提供可展开和收起的侧边栏，包含导航菜单项，用于在不同功能页面间切换。

#### Scenario: 侧边栏显示导航菜单（更新）
- **GIVEN** 侧边栏处于展开状态
- **WHEN** 用户查看侧边栏内容
- **THEN** 应显示可用的导航菜单项列表，包括：
  - 健康检查
  - API测试
  - NDT管捆编辑
- **AND** 当前所在页面的菜单项应有高亮显示

## ADDED Requirements

### Requirement: NDT管捆编辑页面布局
系统 SHALL 提供 NDT 管捆编辑页面，实现管捆数据的查询、显示和编辑功能，页面采用固定全屏布局。

#### Scenario: NDT管捆编辑页面显示查询区域
- **GIVEN** 用户导航到 NDT 管捆编辑页面
- **WHEN** 页面加载完成
- **THEN** 页面顶部应显示查询区域
- **AND** 查询区域应包含合同号和管捆号下拉选择框
- **AND** 查询区域应包含查询按钮

#### Scenario: NDT管捆编辑页面显示管捆列表
- **GIVEN** 用户导航到 NDT 管捆编辑页面
- **WHEN** 页面加载完成
- **THEN** 页面左侧应显示管捆列表表格
- **AND** 表格应包含合同号和管捆号两列

#### Scenario: NDT管捆编辑页面显示管捆详情表单
- **GIVEN** 用户导航到 NDT 管捆编辑页面
- **WHEN** 页面加载完成
- **THEN** 页面右侧应显示管捆信息详情表单
- **AND** 表单应包含生产信息、订单信息、材质规格等字段分组

#### Scenario: NDT管捆编辑页面显示单管明细
- **GIVEN** 用户导航到 NDT 管捆编辑页面
- **WHEN** 页面加载完成
- **THEN** 页面应显示单管明细区域
- **AND** 单管明细应包含30个管号及对应的长度、重量输入框

#### Scenario: NDT管捆编辑页面固定布局不滚动
- **GIVEN** 用户导航到 NDT 管捆编辑页面
- **WHEN** 页面加载完成
- **THEN** 页面应填满屏幕可用空间
- **AND** 页面整体不可滚动
- **AND** 仅表单区域内部可以有滚动条（如内容超出）
