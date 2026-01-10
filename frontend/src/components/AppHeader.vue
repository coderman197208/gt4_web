<template>
  <header class="app-header flex items-center justify-between px-4 h-14 border-b bg-background">
    <!-- 左侧：汉堡菜单按钮 -->
    <Button
      @click="$emit('toggle-sidebar')"
      variant="ghost"
      size="icon"
      aria-label="切换侧边栏"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </Button>

    <!-- 中间：系统标题 -->
    <h1 class="text-lg font-semibold">管体4号线L2过程机系统</h1>

    <!-- 右侧：实时时钟 -->
    <LiveClock />
  </header>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import LiveClock from './LiveClock.vue';

defineEmits<{
  'toggle-sidebar': [];
}>();
</script>
