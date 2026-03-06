组件规格：

名称：Tube.vue，目录 frontend/src/components/ui/tube/
颜色方案：预设模式 — active + color/offColor，与 ConveyorRoller / TubeBasket 一致
着色区域：统一着色，保持 SVG 原始单 path 结构，管口通过镂空（透明）实现
尺寸：单个 size prop，number 按 px，string 直接作为 CSS 值，宽高相等（1:1 比例）
viewBox：0 0 112 112，沿用 tube.svg 原始坐标
文件结构：
frontend/src/components/ui/tube/Tube.vue — 组件
frontend/src/components/ui/tube/index.ts — 导出 + TubeColor 类型

<script setup lang="ts">
import { Tube } from '@/components/ui/tube';
</script>

<template>
  <!-- 默认：50px, 灰色（停止状态） -->
  <Tube />

  <!-- 运行状态，绿色，80px -->
  <Tube :active="true" color="green" :size="80" />

  <!-- 运行状态，红色，string 尺寸 -->
  <Tube :active="true" color="red" size="3rem" />
</template>

Props：
Prop 类型 默认值 说明
active boolean false 开关状态
color SelectSwitchColor 'green' 开启颜色
offColor SelectSwitchColor | 'gray' 'gray' 关闭颜色
size number | string 48 尺寸（高度=宽度，正方形）
class HTMLAttributes['class'] — 自定义 CSS 类
<SelectSwitch :active="true" color="green" :size="64" />
<SelectSwitch :active="false" offColor="gray" :size="48" />
