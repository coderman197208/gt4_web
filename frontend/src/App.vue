<template>
  <section style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px">
    <h1>gt4_web</h1>
    <p>Vue + Node.js + TypeScript skeleton is running.</p>
    <div style="margin-top: 12px">
      <button @click="checkHealth">Check Backend Health</button>
      <p v-if="result" style="margin-top: 8px">Backend: {{ result }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const result = ref('');
async function checkHealth() {
  try {
    const res = await fetch('http://localhost:3000/health');
    const data = await res.json();
    result.value = JSON.stringify(data);
  } catch (e) {
    result.value = 'error';
  }
}
</script>
