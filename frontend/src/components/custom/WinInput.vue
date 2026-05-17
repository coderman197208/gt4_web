<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { computed, useAttrs } from 'vue';
import { Input as BaseInput } from '@/components/ui/input';
import { cn } from '@/lib/utils';

defineOptions({
  inheritAttrs: false,
});

interface Props {
  variant?: 'edit' | 'readonly' | 'table';
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'edit',
});

const attrs = useAttrs();

const inputClass = computed(() =>
  cn(
    props.variant === 'readonly'
      ? 'win-input-readonly'
      : props.variant === 'table'
        ? 'win-input-table'
        : 'win-input-edit',
    props.class,
  ),
);
</script>

<template>
  <BaseInput v-bind="attrs" :class="inputClass" />
</template>

<style scoped>
.win-input-edit {
  border-radius: 2px;
  border-color: #7a7a7a;
  background-color: #ffffff;
  color: #000000;
  font-size: 16px;
  font-weight: 700;
  cursor: default;
}

.win-input-readonly {
  border-radius: 2px;
  border-color: #7a7a7a;
  background: #f5f5f5;
  color: #222222;
  font-size: 16px;
  font-weight: 700;
  cursor: default;
}

.win-input-table {
  border-radius: 2px;
  border-width: 0;
  border-color: transparent;
  background-color: transparent;
  color: #262626;
  font-size: 14px;
  font-weight: 700;
  box-shadow: none;
}

.win-input-table:focus,
.win-input-table:focus-visible {
  background-color: #ffffff;
  box-shadow: none;
}
</style>
