<template>
  <aside
    :class="[
      'app-sidebar absolute left-0 top-0 bottom-0 z-50 border-r bg-background transition-all duration-300 ease-in-out shadow-lg',
      isOpen ? 'w-60' : 'w-0 border-0',
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
              : 'hover:bg-accent hover:text-accent-foreground',
          ]"
          @click="handleNavClick"
        >
          健康检查
        </router-link>
        <router-link
          to="/api-demo"
          :class="[
            'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
            isActive('/api-demo')
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent hover:text-accent-foreground',
          ]"
          @click="handleNavClick"
        >
          API测试
        </router-link>
        <router-link
          to="/tube-edit-ndt"
          :class="[
            'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
            isActive('/tube-edit-ndt')
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent hover:text-accent-foreground',
          ]"
          @click="handleNavClick"
        >
          NDT管捆编辑
        </router-link>
        <router-link
          to="/bundle-manage"
          :class="[
            'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
            isActive('/bundle-manage')
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent hover:text-accent-foreground',
          ]"
          @click="handleNavClick"
        >
          管捆编辑
        </router-link>
        <router-link
          to="/contract-editing"
          :class="[
            'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
            isActive('/contract-editing')
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent hover:text-accent-foreground',
          ]"
          @click="handleNavClick"
        >
          合同数据编辑
        </router-link>
        <router-link
          to="/main-monitor"
          :class="[
            'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
            isActive('/main-monitor')
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent hover:text-accent-foreground',
          ]"
          @click="handleNavClick"
        >
          主监控
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

const emit = defineEmits<{
  close: [];
}>();

const route = useRoute();

function isActive(path: string): boolean {
  return route.path === path;
}

function handleNavClick() {
  emit('close');
}
</script>
