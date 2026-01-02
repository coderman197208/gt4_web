<template>
  <div class="health-check">
    <button @click="checkHealth">Check Backend Health</button>
    <p v-if="result" class="health-check__result">Backend: {{ result }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const result = ref('');

async function checkHealth() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }
    const data = await res.json();
    result.value = JSON.stringify(data);
  } catch (error) {
    result.value = 'error';
  }
}
</script>

<style scoped>
.health-check {
  margin-top: 12px;
}

.health-check__result {
  margin-top: 8px;
}
</style>
