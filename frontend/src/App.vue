<template>
  <RouterView />
  <div>
    <Button variant="destructive">Click me</Button>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { Button } from '@/components/ui/button'
</script>
