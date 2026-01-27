# Tasks

## 1. 创建 TubeEditNDT.vue 页面组件
- [ ] 在 `frontend/src/views/` 目录下创建 `TubeEditNDT.vue` 文件
- [ ] 实现全屏固定布局（h-screen, overflow-hidden）
- [ ] 使用 flexbox/grid 布局替代 WinForms 的绝对定位

## 2. 实现查询区域
- [ ] 添加合同号 Select 组件（cbxOrderNo1 对应）
- [ ] 添加管捆号 Select 组件（cbxBundleNo1 对应）
- [ ] 添加查询 Button 组件

## 3. 实现管捆列表数据表格
- [ ] 使用 shadcn-vue Table 组件
- [ ] 显示合同号和管捆号两列
- [ ] 支持行选择功能

## 4. 实现管捆信息详情表单
- [ ] 将约40个表单字段按逻辑分组显示
- [ ] 使用 grid 布局实现多列表单
- [ ] 特殊背景色字段使用 Tailwind CSS 样式标识（如 LightSeaGreen 可编辑字段）

## 5. 实现单管明细区域
- [ ] 创建30个管号、长度、重量输入框组
- [ ] 使用 grid 布局实现 10列 × 3行 布局
- [ ] 每列包含管号、长度、重量三个输入框

## 6. 实现操作按钮区域
- [ ] 添加保存、删除、打印标签等功能按钮
- [ ] 按钮暂时只做 UI 展示，不绑定实际功能

## 7. 配置路由
- [ ] 在 `frontend/src/router/index.ts` 中添加 `/tube-edit-ndt` 子路由
- [ ] 路由组件指向 `TubeEditNDT.vue`

## 8. 更新侧边栏菜单
- [ ] 在 `frontend/src/components/AppSidebar.vue` 中添加"NDT管捆编辑"菜单项
- [ ] 菜单项链接到 `/tube-edit-ndt` 路由
- [ ] 保持与现有菜单项一致的样式

## 9. 验证与测试
- [ ] 验证页面在浏览器中正确渲染
- [ ] 验证路由导航正常工作
- [ ] 验证页面布局填满屏幕且不可滚动
- [ ] 验证侧边栏菜单高亮正确
