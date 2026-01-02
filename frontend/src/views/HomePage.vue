<template>
  <div class="app-container flex flex-col h-screen">
    <!-- 页头 -->
    <AppHeader @toggle-sidebar="toggleSidebar" />
    
    <!-- 主体区域：侧边栏 + 内容区 -->
    <div class="app-body flex flex-1 overflow-hidden">
      <!-- 侧边栏 -->
      <AppSidebar :is-open="isSidebarOpen" />
      
      <!-- 主内容区域 -->
      <main class="flex-1 overflow-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import AppSidebar from '../components/AppSidebar.vue';

const isSidebarOpen = ref(true);

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
