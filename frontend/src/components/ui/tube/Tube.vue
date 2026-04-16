<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { TubeColor } from '.';
import { computed } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  /** 运行状态 */
  active?: boolean;
  /** 运行颜色预设 */
  color?: TubeColor;
  /** 停止颜色预设 */
  offColor?: TubeColor | 'gray';
  /** 尺寸 (按图形高度计算, 宽度按 SVG 实际比例自动换算) */
  size?: number | string;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  color: 'green',
  offColor: 'gray',
  size: 50,
});

// -- 亮灯颜色映射 (明亮/饱和) --
const onFillMap: Record<TubeColor, string> = {
  green: 'fill-green-500',
  red: 'fill-red-500',
  amber: 'fill-amber-400',
  blue: 'fill-blue-500',
  orange: 'fill-orange-500',
  cyan: 'fill-cyan-400',
  white: 'fill-white',
  darkCyan: 'fill-[#20b2aa]',
};

// -- 灭灯颜色映射 (暗淡/低饱和) --
const offFillMap: Record<TubeColor | 'gray', string> = {
  gray: 'fill-gray-300 dark:fill-gray-600',
  green: 'fill-green-900/50 dark:fill-green-800/30',
  red: 'fill-red-900/50 dark:fill-red-800/30',
  amber: 'fill-amber-900/50 dark:fill-amber-800/30',
  blue: 'fill-blue-900/50 dark:fill-blue-800/30',
  orange: 'fill-orange-900/50 dark:fill-orange-800/30',
  cyan: 'fill-cyan-900/50 dark:fill-cyan-800/30',
  white: 'fill-gray-200 dark:fill-gray-500',
  darkCyan: 'fill-[#20b2aa]/50 dark:fill-[#20b2aa]/30',
};

const fillClass = computed(() => {
  return props.active ? onFillMap[props.color] : offFillMap[props.offColor];
});

const tubeAspectRatio = 42 / 67;

const sizeValue = computed(() => {
  return typeof props.size === 'number' ? `${props.size}px` : props.size;
});

const widthValue = computed(() => {
  if (typeof props.size === 'number') {
    return `${props.size * tubeAspectRatio}px`;
  }
  return `calc(${props.size} * ${tubeAspectRatio})`;
});
</script>

<template>
  <svg
    data-slot="tube"
    :data-active="active || undefined"
    :class="cn('inline-block shrink-0', props.class)"
    :width="widthValue"
    :height="sizeValue"
    viewBox="44 15 42 67"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 填充区域：包含整体轮廓，解决 fill 颜色未填充全部的问题 -->
    <path
      d="M 46.6 55.8 L 54.4 28 A 10.6 10.6 0 0 1 75.6 28 L 83.4 55.8 A 19 19 0 1 1 46.6 55.8 Z"
      :class="fillClass"
    />
    <!-- 轮廓线：侧面与远端弧线，实现了两侧直线与近端圆的精确相切 -->
    <path
      d="M 46.6 55.8 L 54.4 28 A 10.6 10.6 0 0 1 75.6 28 L 83.4 55.8"
      fill="none"
      class="stroke-muted-foreground/80"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <!-- 轮廓线：近端圆 -->
    <circle
      cx="65"
      cy="60.5"
      r="19"
      fill="none"
      class="stroke-muted-foreground/80"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>
</template>
