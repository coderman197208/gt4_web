<template>
  <div ref="viewportRef" class="hmi-viewport h-full w-full overflow-hidden">
    <div :class="viewportContentClass" :style="viewportContentStyle">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';

interface Props {
  enabled?: boolean;
  designWidth?: number;
  designHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
  enabled: false,
  designWidth: 1920,
  designHeight: 1080,
});

const viewportRef = ref<HTMLElement | null>(null);
const viewportSize = reactive({
  width: props.designWidth,
});

const scale = computed(() => {
  return viewportSize.width / props.designWidth;
});

const viewportContentClass = computed(() => [
  'hmi-viewport__content',
  props.enabled ? 'hmi-viewport__content--scaled' : 'h-full w-full',
]);

const viewportContentStyle = computed(() => {
  if (!props.enabled) {
    return {};
  }

  return {
    width: `${props.designWidth}px`,
    height: `${props.designHeight}px`,
    transform: `scale(${scale.value})`,
  };
});

let resizeObserver: ResizeObserver | null = null;

function updateViewportSize(width: number) {
  viewportSize.width = width;
}

onMounted(() => {
  if (!viewportRef.value) {
    return;
  }

  updateViewportSize(viewportRef.value.clientWidth);

  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];

    if (!entry) {
      return;
    }

    updateViewportSize(entry.contentRect.width);
  });

  resizeObserver.observe(viewportRef.value);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});
</script>

<style scoped>
.hmi-viewport {
  position: relative;
}

.hmi-viewport__content--scaled {
  position: absolute;
  transform-origin: top left;
}
</style>
