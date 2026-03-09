<template>
  <HmiViewport
    :enabled="shouldScaleLayout"
    :design-width="layoutDesignWidth"
    :design-height="layoutDesignHeight"
    class="h-screen w-full"
  >
    <div class="app-container flex h-full w-full flex-col overflow-hidden">
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
  </HmiViewport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import HmiViewport from '../components/HmiViewport.vue';
import AppHeader from '../components/AppHeader.vue';
import AppSidebar from '../components/AppSidebar.vue';

const isSidebarOpen = ref(false);
const route = useRoute();

interface HmiScaleMeta {
  designWidth?: number;
  designHeight?: number;
}

const hmiScaleMeta = computed(() => route.meta.hmiScale as HmiScaleMeta | undefined);
const shouldScaleLayout = computed(() => Boolean(hmiScaleMeta.value));
const layoutDesignWidth = computed(() => hmiScaleMeta.value?.designWidth ?? 1920);
const layoutDesignHeight = computed(() => hmiScaleMeta.value?.designHeight ?? 1080);

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}
</script>

<style scoped>
.app-container {
  background-color: var(--background);
  color: var(--foreground);
}
</style>
