<template>
  <div class="app-container flex flex-col h-screen">
    <!-- 页头 -->
    <AppHeader @toggle-sidebar="toggleSidebar" />
    
    <!-- 主体区域：侧边栏 + 内容区 -->
    <div class="app-body relative flex flex-1 overflow-hidden">
      <!-- 侧边栏 - 绝对定位覆盖在内容上 -->
      <AppSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />
      
      <!-- 主内容区域 -->
      <main class="flex-1 overflow-hidden p-4">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import AppSidebar from '../components/AppSidebar.vue';

const isSidebarOpen = ref(false);

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
