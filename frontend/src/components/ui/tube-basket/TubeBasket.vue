<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { TubeBasketColor } from '.';
import { computed } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  /** 运行状态 */
  active?: boolean;
  /** 运行颜色预设 */
  color?: TubeBasketColor;
  /** 停止颜色预设 */
  offColor?: TubeBasketColor | 'gray';
  /** 梯形上边宽度 (px) */
  topWidth?: number;
  /** 梯形下边宽度 (px) */
  bottomWidth?: number;
  /** 梯形高度 (px) */
  height?: number;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  color: 'green',
  offColor: 'gray',
  topWidth: 40,
  bottomWidth: 60,
  height: 40,
});

// -- 亮灯颜色映射 (明亮/饱和) --
const onFillMap: Record<TubeBasketColor, string> = {
  green: 'fill-green-500',
  red: 'fill-red-500',
  amber: 'fill-amber-400',
  blue: 'fill-blue-500',
  orange: 'fill-orange-500',
  cyan: 'fill-cyan-400',
  white: 'fill-white',
};

// -- 灭灯颜色映射 (暗淡/低饱和) --
const offFillMap: Record<TubeBasketColor | 'gray', string> = {
  gray: 'fill-gray-300 dark:fill-gray-600',
  green: 'fill-green-900/50 dark:fill-green-800/30',
  red: 'fill-red-900/50 dark:fill-red-800/30',
  amber: 'fill-amber-900/50 dark:fill-amber-800/30',
  blue: 'fill-blue-900/50 dark:fill-blue-800/30',
  orange: 'fill-orange-900/50 dark:fill-orange-800/30',
  cyan: 'fill-cyan-900/50 dark:fill-cyan-800/30',
  white: 'fill-gray-200 dark:fill-gray-500',
};

const fillClass = computed(() => {
  return props.active ? onFillMap[props.color] : offFillMap[props.offColor];
});

// SVG 尺寸：取上下边宽度的较大值作为 viewBox 宽度
const svgWidth = computed(() => Math.max(props.topWidth, props.bottomWidth));
const svgHeight = computed(() => props.height);

// 梯形四个顶点坐标 (上边居中, 下边居中)
const pathD = computed(() => {
  const w = svgWidth.value;
  const h = svgHeight.value;
  const tw = props.topWidth;
  const bw = props.bottomWidth;

  const topLeft = (w - tw) / 2;
  const topRight = (w + tw) / 2;
  const bottomLeft = (w - bw) / 2;
  const bottomRight = (w + bw) / 2;

  return `M ${topLeft} 0 L ${topRight} 0 L ${bottomRight} ${h} L ${bottomLeft} ${h} Z`;
});
</script>

<template>
  <svg
    data-slot="tube-basket"
    :data-active="active || undefined"
    :class="cn('inline-block shrink-0', props.class)"
    :width="svgWidth"
    :height="svgHeight"
    :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      :d="pathD"
      :class="fillClass"
      class="stroke-muted-foreground/30"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>
</template>
