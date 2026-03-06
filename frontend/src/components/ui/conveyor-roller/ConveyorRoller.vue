<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { ConveyorRollerColor } from '.';
import { computed } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  /** 滚筒运行状态 */
  active?: boolean;
  /** 运行颜色预设 */
  color?: ConveyorRollerColor;
  /** 停止颜色预设 */
  offColor?: ConveyorRollerColor | 'gray';
  /** 尺寸 (宽度, number 按 px 处理, string 直接作为 CSS 值; 高度按 3:5 比例自动计算) */
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
const onFillMap: Record<ConveyorRollerColor, string> = {
  green: 'fill-green-500',
  red: 'fill-red-500',
  amber: 'fill-amber-400',
  blue: 'fill-blue-500',
  orange: 'fill-orange-500',
  cyan: 'fill-cyan-400',
  white: 'fill-white',
};

// -- 灭灯颜色映射 (暗淡/低饱和) --
const offFillMap: Record<ConveyorRollerColor | 'gray', string> = {
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

const widthValue = computed(() => {
  return typeof props.size === 'number' ? `${props.size}px` : props.size;
});

const heightValue = computed(() => {
  if (typeof props.size === 'number') {
    return `${props.size * 0.6}px`;
  }
  return `calc(${props.size} * 0.6)`;
});
</script>

<template>
  <svg
    data-slot="conveyor-roller"
    :data-active="active || undefined"
    :class="cn('inline-block shrink-0', props.class)"
    :width="widthValue"
    :height="heightValue"
    viewBox="0 0 100 60"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M 0 0 L 50 30 L 0 60 Z M 100 0 L 50 30 L 100 60 Z"
      :class="fillClass"
      class="stroke-muted-foreground/30"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>
</template>
