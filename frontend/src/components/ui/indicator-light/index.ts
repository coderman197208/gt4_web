import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as IndicatorLight } from './IndicatorLight.vue';

export const indicatorLightVariants = cva(
  'inline-block shrink-0 border-2 border-muted-foreground/30',
  {
    variants: {
      shape: {
        circle: 'rounded-full',
        square: 'rounded-sm',
      },
    },
    defaultVariants: {
      shape: 'circle',
    },
  },
);

export type IndicatorLightVariants = VariantProps<typeof indicatorLightVariants>;

/** 指示灯颜色预设名称 */
export type IndicatorLightColor = 'green' | 'red' | 'amber' | 'blue' | 'orange' | 'cyan' | 'white';
