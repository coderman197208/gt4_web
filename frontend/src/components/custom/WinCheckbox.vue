<script setup lang="ts">
import type { CheckboxRootProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { computed, useAttrs } from 'vue';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

defineOptions({
  inheritAttrs: false,
});

type WinCheckboxValue = CheckboxRootProps['modelValue'];

interface Props {
  modelValue?: WinCheckboxValue;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  class: undefined,
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: WinCheckboxValue): void;
}>();

const attrs = useAttrs();

const model = computed({
  get: () => props.modelValue,
  set: (value: WinCheckboxValue) => emits('update:modelValue', value),
});

const checkboxClassName = computed(() => cn('win-checkbox', props.class));
</script>

<template>
  <Checkbox v-bind="attrs" v-model="model" :class="checkboxClassName" />
</template>

<style scoped>
.win-checkbox {
  border-color: #7a7a7a;
  background: #f7f7f7;
  box-shadow: inset 0 1px 0 #ffffff;
}

.win-checkbox[data-state='checked'] {
  border-color: #6f1616;
  background: #ededed;
  color: #6f1616;
}

.win-checkbox:focus-visible {
  border-color: #1d47a4;
  box-shadow: none;
}
</style>
