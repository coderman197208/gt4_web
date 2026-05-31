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
          v-for="item in visibleSidebarItems"
          :key="item.key"
          :to="item.path"
          :class="[
            'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
            isNavigationItemActive(item, route.path)
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent hover:text-accent-foreground',
          ]"
          @click="handleNavClick"
        >
          {{ item.label }}
        </router-link>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getCurrentUser } from '@/api';
import { useRoute } from 'vue-router';
import { isNavigationItemActive, sidebarNavigationItems } from '@/lib/appNavigation';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const route = useRoute();
const isAdmin = computed(() => getCurrentUser()?.role === 'admin');
const visibleSidebarItems = computed(() =>
  sidebarNavigationItems.filter((item) => !item.requiresAdmin || isAdmin.value),
);

function handleNavClick() {
  emit('close');
}
</script>
