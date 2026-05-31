## 1. Visual Baseline And Local Style Contract

- [x] 1.1 盘点 `MainMonitorView.vue`、`AppHeader.vue` 和当前报警中心的颜色、边框、阴影与标题层级，整理报警中心需要对齐的浅色工业 HMI 视觉基线。
- [x] 1.2 为报警中心定义局部可复用的样式约定，覆盖外壳、分区框体、状态徽标、强调按钮和遮罩层，避免继续依赖现有暗黑主题写法。

## 2. AlarmCenterPanel Layout And Surface Refactor

- [x] 2.1 重构 `AlarmCenterPanel.vue` 的外层面板、标题区、摘要区和筛选区，使其改为与 MainMonitorView 同源的浅灰工业面板层次。
- [x] 2.2 重构报警列表、选中态、分页区、详情区、确认区和日志区的框体结构，保证双栏信息层级清晰且保持高密度操作体验。
- [x] 2.3 调整 `active/unacked`、`active/acked`、`cleared` 及不同 `severity` 的视觉表达，确保未确认和高等级报警在浅色主题下依然具备最高优先级。

## 3. Entry And Interaction Polish

- [x] 3.1 对齐 `AppHeader.vue` 中报警入口按钮、状态点和数量角标的视觉风格，使入口与报警中心面板属于同一套 HMI 子系统。
- [x] 3.2 保持现有确认按钮、筛选、分页、重同步提示和关闭行为不变，并补齐新样式下的选中、悬停、禁用和空态表现。
- [x] 3.3 必要时微调 `HomePage.vue` 中报警中心承载层的遮罩强度、定位和过渡效果，避免打开面板后形成割裂的暗黑环境。

## 4. Validation

- [x] 4.1 运行受影响前端范围的类型检查、构建或等效静态校验，确认样式重构未引入模板、类型或导入错误。
- [x] 4.2 在 1920 x 1080 HMI 视图下手动验证报警中心与 MainMonitorView 的风格一致性，确认无浏览器级滚动、状态可辨且整体观感保持高级而克制。
