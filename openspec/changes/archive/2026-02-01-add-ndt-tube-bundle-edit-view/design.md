# Design: NDT管捆编辑页面

## 概述

本设计文档描述如何将 C# WinForms NDT 管捆编辑界面转换为基于 Vue 3 + shadcn-vue + Tailwind CSS 的 Web 页面。

## 布局架构

### 整体布局策略

- **全屏固定布局**：页面填满屏幕，禁止滚动
- **容器样式**：`h-full w-full flex flex-col overflow-hidden`
- **内部区域可滚动**：仅表单详情区域和表格区域允许内部滚动

### 页面区域划分

```
┌─────────────────────────────────────────────────────────────────┐
│                      查询区域 (约 80px)                          │
│  [合同号▼] [管捆号▼] [查询]   [合同号▼] [管捆号▼] [查询]           │
├─────────────────────┬───────────────────────────────────────────┤
│                     │                                           │
│   管捆列表表格       │         管捆信息详情区域                    │
│   (约 350px 宽)     │         (flex-1，表单字段)                  │
│                     │                                           │
│   ┌───────┬───────┐ │  ┌────────────────────────────────────┐   │
│   │合同号 │管捆号  │ │  │ 生产日期 │ 生产时间 │ 班次 │ 班别  ...│   │
│   ├───────┼───────┤ │  ├────────────────────────────────────┤   │
│   │ ...   │ ...   │ │  │ 材质代码 │ 材质正文 │ ...           │   │
│   │       │       │ │  ├────────────────────────────────────┤   │
│   │       │       │ │  │        单管明细区域                 │   │
│   │       │       │ │  │  管号1-10, 11-20, 21-30            │   │
│   │       │       │ │  │  (含长度、重量)                     │   │
│   └───────┴───────┘ │  └────────────────────────────────────┘   │
│                     │                                           │
│   操作按钮区域       │                                           │
│   [保存][删除]...    │                                           │
├─────────────────────┴───────────────────────────────────────────┤
```

## 组件结构

### Vue 组件树

```
TubeEditNDT.vue
├── QuerySection (查询区域)
│   ├── Select (合同号)
│   ├── Select (管捆号)
│   └── Button (查询)
├── MainContent (主内容区域 - flex row)
│   ├── LeftPanel (左侧面板)
│   │   ├── BundleListTable (管捆列表)
│   │   └── ActionButtons (操作按钮)
│   └── RightPanel (右侧面板 - flex-1)
│       ├── BundleInfoForm (管捆信息表单)
│       └── TubeDetailGrid (单管明细网格)
```

### 响应式数据结构

```typescript
interface BundleData {
  // 生产信息
  produceDate: string;
  produceTime: string;
  produceClsNo: string;
  produceGrpNo: string;
  produceJobPoint: string;

  // 订单信息
  orderNo: string;
  bundleNo: string;
  roomNo: string;
  directionCode: string;

  // 材质规格
  matNo: string;
  matText: string;
  diameter: string;
  wallThick: string;
  height: string;
  heatTreatStatusCode: string;

  // ... 更多字段

  // 单管明细 (1-30)
  tubes: Array<{
    tubeNo: string;
    length: string;
    weight: string;
  }>;
}
```

## 样式规范

### 颜色映射

- 可编辑字段背景色 (LightSeaGreen)：`bg-teal-200`
- 只读字段背景色：默认 Input 背景

### 间距规范

- 区域间距：`gap-4` (16px)
- 表单字段间距：`gap-2` (8px)
- 内边距：`p-4` (16px)

### 边框样式

- GroupBox 替代：`border rounded-lg p-4`
- 带标题的分组：使用 `<fieldset>` 和 `<legend>` 或自定义样式

## 性能考虑

### 表单字段优化

- 单管明细区域包含 90 个输入框 (30管 × 3字段)
- 使用 `v-for` 循环渲染，避免重复代码
- 考虑使用 `v-memo` 优化不常变化的字段

### 表格虚拟滚动

- 如果管捆列表数据量大，可考虑使用虚拟滚动
- 当前阶段使用标准 Table 组件即可
