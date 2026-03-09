<template>
  <div ref="layoutViewportRef" class="layout-viewport h-screen w-full overflow-hidden">
    <div
      :class="[
        'app-container flex flex-col overflow-hidden',
        shouldScaleLayout ? 'app-container--scaled' : 'h-screen w-full',
      ]"
      :style="appContainerStyle"
    >
      <!-- 页头 -->
      <AppHeader @toggle-sidebar="toggleSidebar" />

      <!-- 主体区域：侧边栏 + 内容区 -->
      <div class="app-body relative flex flex-1 overflow-hidden">
        <!-- 侧边栏 - 绝对定位覆盖在内容上 -->
        <AppSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

        <!-- 主内容区域 -->
        <main class="relative flex-1 overflow-hidden p-0">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from '../components/AppHeader.vue';
import AppSidebar from '../components/AppSidebar.vue';

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

const isSidebarOpen = ref(false);
const layoutViewportRef = ref<HTMLElement | null>(null);
const route = useRoute();
const viewportSize = reactive({
  width: DESIGN_WIDTH,
  height: DESIGN_HEIGHT,
});

const shouldScaleLayout = computed(() => route.name === 'main-monitor');

const layoutScale = computed(() => {
  const widthScale = viewportSize.width / DESIGN_WIDTH;
  const heightScale = viewportSize.height / DESIGN_HEIGHT;

  return Math.min(widthScale, heightScale);
});

const appContainerStyle = computed(() => {
  if (!shouldScaleLayout.value) {
    return {};
  }

  return {
    width: `${DESIGN_WIDTH}px`,
    height: `${DESIGN_HEIGHT}px`,
    left: `${Math.max((viewportSize.width - DESIGN_WIDTH * layoutScale.value) / 2, 0)}px`,
    top: `${Math.max((viewportSize.height - DESIGN_HEIGHT * layoutScale.value) / 2, 0)}px`,
    transform: `scale(${layoutScale.value})`,
  };
});

let resizeObserver: ResizeObserver | null = null;

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function updateViewportSize(width: number, height: number) {
  viewportSize.width = width;
  viewportSize.height = height;
}

onMounted(() => {
  if (!layoutViewportRef.value) {
    return;
  }

  updateViewportSize(layoutViewportRef.value.clientWidth, layoutViewportRef.value.clientHeight);

  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];

    if (!entry) {
      return;
    }

    updateViewportSize(entry.contentRect.width, entry.contentRect.height);
  });

  resizeObserver.observe(layoutViewportRef.value);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});
</script>

<style scoped>
.layout-viewport {
  position: relative;
}

.app-container {
  background-color: var(--background);
  color: var(--foreground);
}

.app-container--scaled {
  position: absolute;
  transform-origin: top left;
}
</style>
