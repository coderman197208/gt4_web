<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { IndicatorLightColor, IndicatorLightVariants } from '.';
import { computed } from 'vue';
import { cn } from '@/lib/utils';
import { indicatorLightVariants } from '.';

interface Props {
  /** 指示灯亮灭状态 */
  active?: boolean;
  /** 亮灯颜色预设 */
  color?: IndicatorLightColor;
  /** 灭灯颜色预设 */
  offColor?: IndicatorLightColor | 'gray';
  /** 形状: circle | square */
  shape?: IndicatorLightVariants['shape'];
  /** 尺寸 (number 按 px 处理, string 直接作为 CSS 值) */
  size?: number | string;
  /** 发光效果 (仅在 active=true 时生效) */
  glow?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  color: 'green',
  offColor: 'black',
  shape: 'circle',
  size: 16,
  glow: false,
});

// -- 亮灯颜色映射 (明亮/饱和) --
const onColorMap: Record<IndicatorLightColor, string> = {
  // green: 'bg-green-500',
  green: 'bg-[#00ff00]',
  // red: 'bg-red-500',
  red: 'bg-[#ff0000]',
  amber: 'bg-amber-400',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  cyan: 'bg-cyan-400',
  white: 'bg-white',
  black: 'bg-[#000000]',
};

// -- 灭灯颜色映射 (暗淡/低饱和) --
const offColorMap: Record<IndicatorLightColor | 'gray', string> = {
  gray: 'bg-gray-300 dark:bg-gray-600',
  green: 'bg-green-900/50 dark:bg-green-800/30',
  // red: 'bg-red-900/50 dark:bg-red-800/30',
  red: 'bg-[#ff0000]',
  amber: 'bg-amber-900/50 dark:bg-amber-800/30',
  blue: 'bg-blue-900/50 dark:bg-blue-800/30',
  orange: 'bg-orange-900/50 dark:bg-orange-800/30',
  cyan: 'bg-cyan-900/50 dark:bg-cyan-800/30',
  white: 'bg-gray-200 dark:bg-gray-500',
  black: 'bg-black dark:bg-gray-800',
};

// -- 发光效果颜色映射 (对应 on-state 颜色的 50% 透明度) --
const glowColorMap: Record<IndicatorLightColor, string> = {
  green: 'rgba(34, 197, 94, 0.5)',
  red: 'rgba(239, 68, 68, 0.5)',
  amber: 'rgba(251, 191, 36, 0.5)',
  blue: 'rgba(59, 130, 246, 0.5)',
  orange: 'rgba(249, 115, 22, 0.5)',
  cyan: 'rgba(34, 211, 238, 0.5)',
  white: 'rgba(255, 255, 255, 0.5)',
  black: 'rgba(0, 0, 0, 0.5)',
};

const colorClass = computed(() => {
  return props.active ? onColorMap[props.color] : offColorMap[props.offColor];
});

const sizeValue = computed(() => {
  return typeof props.size === 'number' ? `${props.size}px` : props.size;
});

const computedStyle = computed(() => {
  const style: Record<string, string> = {
    width: sizeValue.value,
    height: sizeValue.value,
  };

  if (props.glow && props.active) {
    const glowColor = glowColorMap[props.color];
    style.boxShadow = `0 0 calc(${sizeValue.value} * 0.5) calc(${sizeValue.value} * 0.15) ${glowColor}`;
  }

  return style;
});
</script>

<template>
  <span
    data-slot="indicator-light"
    :data-active="active || undefined"
    :class="cn(indicatorLightVariants({ shape }), colorClass, props.class)"
    :style="computedStyle"
  />
</template>
