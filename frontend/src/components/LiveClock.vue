<template>
  <time :datetime="currentTime" class="text-sm font-mono">
    {{ formattedTime }}
  </time>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const currentTime = ref(new Date());
const formattedTime = ref('');
let intervalId: number | null = null;

function updateTime() {
  const now = new Date();
  currentTime.value = now;
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  formattedTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

onMounted(() => {
  updateTime();
  intervalId = window.setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
});
</script>
