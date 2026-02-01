# Change: 添加NDT成捆编辑页面

## Why

需要将 C# WinForms 的 NDT 成捆编辑界面（NDT.Designer.cs）迁移到 Web 端，创建独立的 `BundleEditNDT.vue` 页面，实现管捆数据的查询、编辑、保存和打印等功能。该页面与现有的 `TubeEditNDT.vue` 是两个独立的功能页面。

## What Changes

- 新增 `BundleEditNDT.vue` 页面组件，基于 NDT.Designer.cs 转换为 shadcn-vue 组件
- 新增 `/bundle-edit-ndt` 路由，作为 HomePage 的子路由
- 修改 `AppSidebar.vue`，添加"NDT成捆画面"菜单项
- 页面布局采用固定全屏设计，不可滚动，填满屏幕

## Impact

- Affected specs: `routing`, `app-layout`
- Affected code:
  - `frontend/src/views/BundleEditNDT.vue` (新增)
  - `frontend/src/router/index.ts` (修改)
  - `frontend/src/components/AppSidebar.vue` (修改)

## UI 结构分析

基于 NDT.Designer.cs 分析，原界面包含以下主要区域：

### 1. 查询区域 (GroupBox)

- 合同号下拉选择框 (cbxOrderNo1, cbxOrderNo2)
- 管捆号下拉选择框 (cbxBundleNo1, cbxBundleNo2)
- 查询按钮 (btnQuery1, btnQuery2)

### 2. 管捆列表区域

- 数据表格 (dataGridView1)，显示合同号和管捆号两列

### 3. 管捆信息详情区域 (GroupBox)

包含约40个表单字段，按逻辑分组：

- 生产信息：生产日期、生产时间、班次、班别、生产作业点
- 订单信息：合同号、管捆号、库位、去向代码
- 材质规格：材质代码、材质正文、外径、壁厚、高度、工艺
- 管端螺纹：管端形式代码/符号、螺纹形式代码/符号
- 标准钢级：标准钢级代码、标准正文、钢级正文
- 批次信息：原合同号、轧批号、炉号、试批号、投料管捆号
- 汇总数据：管捆类型、根数、重量、长度起/止、总长度

### 4. 单管明细区域 (GroupBox)

- 30个管号输入框及对应的长度、重量输入框

### 5. 操作按钮区域

- 保存、删除、打印标签、编捆、发送增加电报、发送删除电报

## 组件映射规则

| C# WinForms 控件 | Shadcn-vue 组件 |
|-----------------|-----------------|
| Button | `<Button>` |
| TextBox | `<Input>` |
| Label | `<Label>` 或 `<span>` |
| ComboBox | `<Select>` 系列 |
| DataGridView | `<Table>` 系列 |
| GroupBox | `<Card>` 或带标题的 `<div>` |

### 忽略的控件

- BindingNavigator 及其子项
- BindingSource
