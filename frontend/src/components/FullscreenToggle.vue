<template>
  <Button @click="toggle" variant="ghost" size="icon" :aria-label="label">
    <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
      <path d="M16 3h3a2 2 0 0 1 2 2v3"/>
      <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
      <path d="M8 21H5a2 2 0 0 1-2-2v-3"/>
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 9L5 5"/>
      <path d="M5 9V5h4"/>
      <path d="M15 15l4 4"/>
      <path d="M19 15v4h-4"/>
    </svg>
  </Button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Button } from '@/components/ui/button';

const isFullscreen = ref<boolean>(!!document.fullscreenElement);
const label = computed(() => (isFullscreen.value ? '退出全屏' : '全屏'));

function updateFullscreenState() {
  isFullscreen.value = !!document.fullscreenElement;
}

onMounted(() => {
  document.addEventListener('fullscreenchange', updateFullscreenState);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', updateFullscreenState);
});

async function toggle() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (e) {
    // ignore errors
  }
}
</script>
