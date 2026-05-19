<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { HTMLAttributes } from 'vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

defineOptions({
  inheritAttrs: false,
});

interface WinSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

type WinSelectOptionInput = string | WinSelectOption;

interface Props {
  modelValue?: string;
  options: readonly WinSelectOptionInput[];
  placeholder?: string;
  triggerClass?: HTMLAttributes['class'];
  contentClass?: HTMLAttributes['class'];
  itemClass?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请选择',
  triggerClass: undefined,
  contentClass: undefined,
  itemClass: undefined,
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const attrs = useAttrs();

const model = computed({
  get: () => props.modelValue,
  set: (value: string) => emits('update:modelValue', value),
});

const normalizedOptions = computed<WinSelectOption[]>(() =>
  props.options.map((option) =>
    typeof option === 'string' ? { label: option, value: option } : option,
  ),
);

const triggerClassName = computed(() => cn('win-select-trigger', props.triggerClass));
const contentClassName = computed(() => cn('win-select-content', props.contentClass));
const itemClassName = computed(() => cn('win-select-item', props.itemClass));
</script>

<template>
  <Select v-bind="attrs" v-model="model">
    <SelectTrigger :class="triggerClassName">
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent :class="contentClassName">
      <SelectItem
        v-for="option in normalizedOptions"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
        :class="itemClassName"
      >
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>

<style scoped>
.win-select-trigger {
  height: 32px;
  width: 100%;
  border-color: #7a7a7a;
  border-radius: 2px;
  background: linear-gradient(to bottom, #ffffff, #ececec);
  color: #111827;
  font-size: 14px;
  font-weight: 700;
  box-shadow: none;
}

.win-select-trigger:focus-visible {
  border-color: #1d47a4;
  box-shadow: none;
}

.win-select-content {
  border-color: #8a8a8a;
  border-radius: 2px;
  background: #e6e6e6;
  color: #111827;
}

.win-select-item {
  border-radius: 2px;
  font-size: 14px;
  font-weight: 700;
}

.win-select-item[data-highlighted] {
  background: #d0d0d0;
  color: #6f1616;
}
</style>
