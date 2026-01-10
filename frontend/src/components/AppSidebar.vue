<template>
  <aside
    :class="[
      'app-sidebar border-r bg-background transition-all duration-300 ease-in-out',
      isOpen ? 'w-60' : 'w-0 border-0'
    ]"
  >
    <div v-if="isOpen" class="p-4">
      <nav class="space-y-2">
        <router-link
          to="/health-check"
          :class="[
            'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
            isActive('/health-check')
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent hover:text-accent-foreground'
          ]"
        >
          健康检查
        </router-link>
        <router-link
          to="/api-demo"
          :class="[
            'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
            isActive('/api-demo')
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent hover:text-accent-foreground'
          ]"
        >
          API测试
        </router-link>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

defineProps<{
  isOpen: boolean;
}>();

const route = useRoute();

function isActive(path: string): boolean {
  return route.path === path;
}
</script>
