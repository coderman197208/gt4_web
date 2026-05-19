<script setup lang="ts">
import { computed, getCurrentInstance, useAttrs } from 'vue';
import type { HTMLAttributes } from 'vue';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

defineOptions({
  inheritAttrs: false,
});

interface WinRadioOption {
  label: string;
  value: string;
  disabled?: boolean;
  id?: string;
}

interface Props {
  modelValue?: string;
  options: readonly WinRadioOption[];
  class?: HTMLAttributes['class'];
  optionClass?: HTMLAttributes['class'];
  itemClass?: HTMLAttributes['class'];
  labelClass?: HTMLAttributes['class'];
  itemIdPrefix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  class: undefined,
  optionClass: undefined,
  itemClass: undefined,
  labelClass: undefined,
  itemIdPrefix: 'win-radio-group',
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const attrs = useAttrs();
const instance = getCurrentInstance();

const model = computed({
  get: () => props.modelValue,
  set: (value: string) => emits('update:modelValue', value),
});

const groupClassName = computed(() => cn('win-radio-group', props.class));
const optionClassName = computed(() => cn('win-radio-option', props.optionClass));
const itemClassName = computed(() => cn('win-radio-item', props.itemClass));
const labelClassName = computed(() => cn('win-radio-label', props.labelClass));

function getOptionId(option: WinRadioOption, index: number) {
  return option.id ?? `${props.itemIdPrefix}-${instance?.uid ?? '0'}-${index}`;
}
</script>

<template>
  <RadioGroup v-bind="attrs" v-model="model" :class="groupClassName">
    <div v-for="(option, index) in options" :key="option.value" :class="optionClassName">
      <RadioGroupItem
        :id="getOptionId(option, index)"
        :value="option.value"
        :disabled="option.disabled"
        :class="itemClassName"
      />
      <Label :for="getOptionId(option, index)" :class="labelClassName">{{ option.label }}</Label>
    </div>
  </RadioGroup>
</template>

<style scoped>
.win-radio-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.win-radio-option {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.win-radio-item {
  border-color: #7a7a7a;
  background: #f7f7f7;
  box-shadow: inset 0 1px 0 #ffffff;
}

.win-radio-item:focus-visible {
  border-color: #1d47a4;
  box-shadow: none;
}

.win-radio-item :deep(svg) {
  fill: #6f1616;
}

.win-radio-label {
  color: #111827;
  font-size: 15px;
  font-weight: 700;
}
</style>
