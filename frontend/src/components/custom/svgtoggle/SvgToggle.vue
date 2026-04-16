<template>
  <div class="inline-block cursor-pointer" @click="toggle">
    <svg
      :width="width"
      :height="height"
      viewBox="0 0 200 50"
      xmlns="http://www.w3.org/2000/svg"
      class="drop-shadow-sm transition-all duration-300"
    >
      <rect
        x="0"
        y="0"
        width="200"
        height="50"
        rx="5"
        :class="modelValue ? 'fill-green-600' : 'fill-red-600'"
        class="transition-colors duration-300"
      />

      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-size="12"
        fill="white"
        class="select-none pointer-events-none font-bold"
      >
        {{ modelValue ? 'ON' : 'OFF' }}
      </text>

      <circle
        :cx="modelValue ? 175 : 25"
        cy="25"
        r="15"
        fill="white"
        class="transition-all duration-300 ease-in-out"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
/**
 * 组件 Props 定义
 * @param modelValue 开关状态
 * @param width 外部显示宽度
 * @param height 外部显示高度
 */
interface Props {
  modelValue: boolean;
  width?: number | string;
  height?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  width: 200,
  height: 50,
});

// 定义事件，支持 v-model
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'change', value: boolean): void;
}>();

const toggle = () => {
  const newValue = !props.modelValue;
  emit('update:modelValue', newValue);
  emit('change', newValue);
};
</script>

<style scoped>
/* 可以在这里添加一些 SVG 特有的滤镜或样式 */
svg {
  user-select: none;
}
</style>
