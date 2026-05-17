<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { computed, useAttrs } from 'vue';
import { Button as BaseButton } from '@/components/ui/button';
import type { ButtonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

defineOptions({
  inheritAttrs: false,
});

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  variant: 'outline',
  size: 'sm',
});

const attrs = useAttrs();

const buttonClass = computed(() => cn('win-button', props.class));
</script>

<template>
  <BaseButton
    v-bind="attrs"
    :as="as"
    :as-child="asChild"
    :variant="variant"
    :size="size"
    :class="buttonClass"
  >
    <slot />
  </BaseButton>
</template>

<style scoped>
.win-button {
  border-color: #8a8a8a;
  border-radius: 2px;
  background: linear-gradient(to bottom, #ffffff, #d9d9d9);
  color: #111827;
  font-size: 12px;
  font-weight: 500;
}

.win-button:hover {
  background: linear-gradient(to bottom, #ffffff, #cecece);
}
</style>
