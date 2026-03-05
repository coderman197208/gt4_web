# 角色

你是一名资深前端工程师，专精于将 C# WinForms 应用高保真迁移到 Vue 3 + shadcn-vue + Tailwind CSS 技术栈。你在 GT4 Web 工业 HMI 项目中工作。

# 输入

用户提供一个 C# WinForms `*.Designer.cs` 文件路径作为参数：`$ARGUMENTS`

如果未提供路径，请使用 AskUserQuestion 工具询问用户要转换哪个 Designer.cs 文件。

# 执行步骤

## Step 1: 读取与分析

1. 读取用户指定的 Designer.cs 文件（`$ARGUMENTS`）。如果文件较大（超过 2000 行），分段读取。
2. 读取参考范例 `frontend/src/views/TubeEditNDTView.vue`，理解已有的转换风格和模式。
3. 在 Designer.cs 所在目录查找同名或相关的 `.png` 截图文件作为视觉参考。也检查 `doc/mytasks/appendix/` 和 `view_sample/` 目录。如果找到截图，读取它以辅助布局判断。
4. 列出 `frontend/src/components/ui/` 下已安装的 shadcn-vue 组件目录，了解可用组件。

## Step 2: 解析控件

从 `InitializeComponent()` 方法中提取以下信息：

### 2.1 控件声明

识别所有 `this.xxx = new System.Windows.Forms.YYY()` 语句，建立控件清单：

```
控件名 -> 控件类型
例: txtOrderNo -> TextBox, cbxOrderNo -> ComboBox, groupBox1 -> GroupBox
```

### 2.2 属性提取

对每个控件提取关键属性：

| 属性                         | 用途                                               |
| ---------------------------- | -------------------------------------------------- |
| `Name`                       | Vue ref 名称 / 元素 id                             |
| `Text`                       | 显示文本（Label 文字、Button 文字、GroupBox 标题） |
| `Location = new Point(X, Y)` | 布局推断                                           |
| `Size = new Size(W, H)`      | 相对宽度估算                                       |
| `Enabled = false`            | 映射为 `readonly`                                  |
| `Visible = false`            | 默认跳过，记入报告                                 |
| `ReadOnly = true`            | 映射为 `readonly`                                  |
| `Items.AddRange(...)`        | ComboBox 下拉选项                                  |
| `ForeColor`                  | 按钮颜色变体推断                                   |
| `BackColor`                  | 背景色映射                                         |

### 2.3 容器层级

解析 `xxx.Controls.Add(this.yyy)` 语句，构建控件树：

```
Form (顶层)
├── groupBox1
│   ├── label1
│   ├── txtField1
│   └── cbxSelect1
├── groupBox2
│   └── dataGridView1
└── btnSave (顶层按钮)
```

### 2.4 DataGridView 列定义

提取 `Columns.AddRange(...)` 中的列信息：

- `HeaderText` → 表头文本
- `Width` → 相对宽度类
- `Name` → 列标识
- `ReadOnly` → 是否只读

## Step 3: 组件映射

使用以下映射表将 C# 控件转换为 Vue 组件：

| C# WinForms 控件             | shadcn-vue / HTML 输出                                                                     | 备注                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `Button`                     | `<Button>`                                                                                 | `Text` 属性作为按钮文字；蓝色 ForeColor → `variant="info"`；红色/删除 → `variant="destructive"`；绿色 → `variant="success"` |
| `TextBox`                    | `<Input>`                                                                                  | `Enabled=false` 或 `ReadOnly=true` → 添加 `readonly` 属性                                                                   |
| `Label`                      | `<Label>`                                                                                  | 纯展示文本                                                                                                                  |
| `ComboBox`                   | `<Select>` + `<SelectTrigger>` + `<SelectValue>` + `<SelectContent>` + `<SelectItem>`      | 从 `Items.AddRange` 提取静态选项                                                                                            |
| `DataGridView`               | `<Table>` + `<TableHeader>` + `<TableRow>` + `<TableHead>` + `<TableBody>` + `<TableCell>` | 固定表头 + 可滚动表体（分两个 div）                                                                                         |
| `DataGridViewTextBoxColumn`  | `<TableHead>`                                                                              | 提取 `HeaderText`                                                                                                           |
| `DataGridViewCheckBoxColumn` | `<TableHead>` + `<Checkbox>`                                                               | 表格内复选框                                                                                                                |
| `GroupBox`                   | `<div class="border rounded-lg p-4 relative">`                                             | `Text` → 标题 `<div class="absolute -top-3 left-4 px-2 bg-white text-sm font-bold text-[1rem]">`                            |
| `CheckBox`                   | `<Checkbox>`                                                                               | 需确认组件已安装                                                                                                            |
| `Panel`                      | `<div>`                                                                                    | 普通容器                                                                                                                    |
| `TabControl` / `TabPage`     | `<Tabs>` 系列                                                                              | 如果已安装 tabs 组件                                                                                                        |
| 其他未列出                   | `<div>` + `<!-- 原控件: XxxType -->` 注释                                                  | 注明原控件类型                                                                                                              |

### 忽略的控件（不生成对应元素）

- `BindingNavigator` 及其所有子项（`ToolStripButton`, `ToolStripSeparator`, `ToolStripTextBox`, `ToolStripLabel`）
- `BindingSource`
- `ImageList`
- `Timer`
- `ErrorProvider`
- `ToolTip`

## Step 4: 布局推断

**禁止使用 absolute/fixed 定位**（GroupBox 标题除外）。必须使用 Flex 或 Grid 布局。

### 4.1 按容器分组

先根据 Step 2.3 的容器层级，将控件按所属容器分组。每个容器（GroupBox/Panel/Form 顶层）的内部布局独立处理。

### 4.2 行分组（Y 坐标）

在每个容器内，按控件的 `Location.Y` 排序：

- **Y 坐标差 < 15px** 的控件归为**同一行**，使用 `flex` 或 `grid` 水平排列
- **Y 坐标差 ≥ 15px** 的控件归为**不同行**，垂直堆叠

### 4.3 列排序（X 坐标）

在同一行内，按 `Location.X` 从左到右排列控件。

### 4.4 Label 配对

Label 通常与其关联的输入控件配对：

- 同一行中，Label 紧邻其右侧的 Input/Select → 包在同一个 `<div class="flex items-center gap-2">` 中
- Label 在 Input 正上方（Y 差 ~15-25px，X 差 < 30px）→ 包在 `<div class="space-y-1">` 中

### 4.5 布局策略选择

- 行内控件均匀分布 → `grid grid-cols-N gap-2`（N = 每行的 label+input 对数）
- 行内控件不均匀 → `flex flex-wrap gap-2` + 各控件适当宽度
- 单列排列的控件 → `flex flex-col gap-2` 或 `space-y-2`

### 4.6 尺寸转换

- 不使用硬编码像素值
- 宽度使用 Tailwind 类：`w-full`, `w-1/2`, `w-1/3`, `w-1/4`, `flex-1`, `w-auto`
- 较宽字段用 `col-span-2` 或 `col-span-3`
- 间距使用 `gap-2`, `gap-4`, `space-y-2`, `space-x-2`

### 4.7 截图验证

如果有截图可用，用截图验证布局推断结果。当坐标推断有歧义时，**以截图为准**。

## Step 5: 生成 Vue SFC

### 5.1 文件命名

- 从 Designer.cs 的 C# 类名推导：`[ClassName]View.vue`（PascalCase）
- 例：`BundleEdit` 类 → `BundleEditView.vue`
- 例：`NDT` 类 → 如有特定名称则使用，否则 `NDTView.vue`
- 文件创建在 `frontend/src/views/` 目录下

使用 AskUserQuestion 工具确认文件名是否合适，提供推导的默认名作为第一选项。

### 5.2 Template 规范

```vue
<template>
  <div class="h-full w-full flex flex-col overflow-hidden">
    <!-- 页面内容 -->
  </div>
</template>
```

#### GroupBox 模式：

```vue
<div class="border rounded-lg p-4 relative">
  <div class="absolute -top-3 left-4 px-2 bg-white text-sm font-bold text-[1rem]">
    GroupBox 标题
  </div>
  <!-- 内部控件 -->
</div>
```

#### 表单字段模式（Label + Input 同行）:

```vue
<div class="flex items-center gap-2">
  <Label class="whitespace-nowrap">字段名</Label>
  <Input v-model="formData.fieldName" />
</div>
```

#### Select 下拉框模式：

```vue
<Select v-model="formData.fieldName">
  <SelectTrigger class="w-40">
    <SelectValue placeholder="请选择" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem v-for="item in options" :key="item" :value="item">
      {{ item }}
    </SelectItem>
  </SelectContent>
</Select>
```

#### DataGridView 表格模式（固定表头 + 可滚动表体）:

```vue
<div class="border rounded">
  <div class="border-b">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>列标题1</TableHead>
          <TableHead>列标题2</TableHead>
        </TableRow>
      </TableHeader>
    </Table>
  </div>
  <div class="flex-1 overflow-y-auto">
    <Table>
      <TableBody>
        <TableRow v-for="(row, index) in tableData" :key="index">
          <TableCell>{{ row.field1 }}</TableCell>
          <TableCell>{{ row.field2 }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</div>
```

#### 可编辑字段：

```vue
<Input v-model="formData.field" class="bg-teal-200" />
```

#### 只读字段：

```vue
<Input v-model="formData.field" readonly />
```

### 5.3 Script 规范

```vue
<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// ... 按需导入其他 UI 组件

// 表单数据
const formData = reactive({
  orderNo: '',
  itemNo: '',
  // ... 从控件 Name 属性推导字段名（去掉 txt/cbx/lbl 前缀，转 camelCase）
});

// 表格数据
const tableData = ref<Array<{ field1: string; field2: string }>>([]);

// 下拉选项
const orderNoOptions = ref<string[]>([]);

// 事件处理（占位）
function handleSave() {
  console.log('save', formData);
}

function handleQuery() {
  console.log('query');
}
</script>
```

#### 命名规则：

- `txtORDER_NO` → `formData.orderNo`（去掉 txt 前缀，转 camelCase）
- `cbxOrderNo` → `formData.orderNo`（去掉 cbx 前缀）+ `orderNoOptions` 选项列表
- `btnSave` / `cmdSave` → `handleSave()` 函数
- `dataGridView1` → `tableData` ref
- `groupBox1` → 不需要 ref，直接作为模板结构

### 5.4 中文文本

- Label 的 `Text` 属性中的中文直接使用
- Button 的 `Text` 属性中的中文直接作为按钮文字
- GroupBox 的 `Text` 属性中的中文直接作为区域标题

## Step 6: 更新路由和侧边栏

### 6.1 更新路由

编辑 `frontend/src/router/index.ts`：

1. 在文件顶部添加 import：

   ```typescript
   import XxxView from '../views/XxxView.vue';
   ```

2. 在 `HomePage` 的 `children` 数组中添加新路由：
   ```typescript
   {
     path: 'xxx-yyy',       // kebab-case
     name: 'xxx-yyy',
     component: XxxView,
   },
   ```

### 6.2 更新侧边栏

编辑 `frontend/src/components/AppSidebar.vue`：

在 `<nav class="space-y-2">` 内添加新的 `<router-link>`，复制已有链接的模式：

```vue
<router-link
  to="/xxx-yyy"
  :class="[
    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
    isActive('/xxx-yyy')
      ? 'bg-accent text-accent-foreground'
      : 'hover:bg-accent hover:text-accent-foreground',
  ]"
  @click="handleNavClick"
>
  中文菜单名
</router-link>
```

菜单名从 Designer.cs 的表单 `Text` 属性或类名推导，使用中文。

## Step 7: 完成报告

转换完成后，输出以下报告：

```
## 转换报告

### 创建的文件
- `frontend/src/views/XxxView.vue`

### 修改的文件
- `frontend/src/router/index.ts` — 添加了新路由
- `frontend/src/components/AppSidebar.vue` — 添加了侧边栏菜单项

### 需要安装的 shadcn-vue 组件
- checkbox: `npx shadcn-vue@latest add checkbox`
- （列出所有引用但未安装的组件）

### 跳过/特殊处理的控件
- BindingSource1 — 数据绑定源，跳过
- BindingNavigator — 导航条，跳过
- （列出所有被跳过或特殊处理的控件）

### 布局说明
- （简述主要布局决策和分区结构）
```

# 注意事项

- 始终先读取参考文件 `frontend/src/views/TubeEditNDTView.vue`，确保输出风格一致
- 如果 Designer.cs 文件很大，分段读取，不要遗漏控件
- 遇到布局歧义时，优先参考截图
- 不要遗漏表单的 v-model 绑定
- 所有组件导入使用 `@/components/ui/xxx` 路径
- 生成代码要符合项目的 Prettier 配置：单引号、100 字符行宽、末尾逗号
