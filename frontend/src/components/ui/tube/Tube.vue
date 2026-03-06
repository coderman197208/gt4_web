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
  /** 尺寸 (宽=高, number 按 px 处理, string 直接作为 CSS 值) */
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
};

const fillClass = computed(() => {
  return props.active ? onFillMap[props.color] : offFillMap[props.offColor];
});

const sizeValue = computed(() => {
  return typeof props.size === 'number' ? `${props.size}px` : props.size;
});
</script>

<template>
  <svg
    data-slot="tube"
    :data-active="active || undefined"
    :class="cn('inline-block shrink-0', props.class)"
    :width="sizeValue"
    :height="sizeValue"
    viewBox="0 0 112 112"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M64.167,26.661 C69.178,26.577 72.010,28.798 73.469,33.142 C76.058,40.855 78.858,48.496 81.454,56.206 C83.920,63.529 81.322,71.649 75.207,76.228 C69.476,80.520 61.754,80.681 55.651,76.637 C48.884,72.153 46.168,64.969 48.134,57.138 C50.286,48.565 53.947,40.511 56.617,32.117 C57.707,28.693 60.559,27.424 64.167,26.661 M58.858,46.900 C49.223,52.545 46.796,62.251 52.862,70.885 C57.005,76.782 64.833,79.064 70.872,76.135 C77.853,72.749 81.880,64.379 79.745,57.689 C76.519,47.579 70.038,44.064 58.858,46.900 M56.192,40.395 C56.142,41.918 54.621,43.501 56.601,45.186 C63.154,42.754 69.745,42.821 76.143,46.719 C74.697,44.616 74.349,42.293 73.580,40.129 C72.751,37.794 71.973,35.433 71.004,33.155 C68.919,28.253 64.934,27.306 60.671,30.466 C57.534,32.792 57.931,36.667 56.192,40.395z"
      :class="fillClass"
      class="stroke-muted-foreground/30"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
import { Tube } from '@/components/ui/tube';
</script>
