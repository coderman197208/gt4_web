<template>
  <RouterView />
  <Toaster richColors position="top-center" />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { Toaster } from '@/components/ui/sonner';
</script>
