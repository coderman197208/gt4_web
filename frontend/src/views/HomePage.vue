<template>
  <HmiViewport
    :enabled="shouldScaleLayout"
    :design-width="layoutDesignWidth"
    :design-height="layoutDesignHeight"
    class="h-screen w-full"
  >
    <div class="app-container flex h-full w-full flex-col overflow-hidden">
      <AppHeader :shift-name="realtimeDataStore.shiftName" @toggle-sidebar="toggleSidebar" />

      <div class="app-body relative flex min-h-0 flex-1 overflow-hidden">
        <AppSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

        <main class="relative min-h-0 flex-1 overflow-hidden p-0">
          <router-view />
        </main>
      </div>

      <footer class="app-footer h-[72px] shrink-0 px-3 py-2">
        <div class="footer-shell flex h-full gap-3">
          <nav class="footer-nav-band min-w-0 flex-1" aria-label="页脚导航">
            <button
              v-for="slot in footerSlots"
              :key="slot.index"
              type="button"
              class="footer-nav-slot"
              :class="{
                'is-active': slot.isActive,
                'is-clickable': slot.isClickable,
                'is-placeholder': slot.isPlaceholder,
                'is-locked': slot.isLocked,
              }"
              :disabled="!slot.isClickable"
              :aria-current="slot.isActive ? 'page' : undefined"
              @click="slot.item && handleFooterNavigate(slot.item)"
            >
              <span class="footer-nav-label">{{ slot.label }}</span>
              <span v-if="slot.isPlaceholder" class="footer-nav-hint">待扩展</span>
              <span v-else-if="slot.isLocked" class="footer-nav-hint">仅管理员</span>
            </button>
          </nav>

          <section class="w-[340px] shrink-0" aria-label="品牌区">
            <div
              class="mt-[6px] text-center text-[28px] font-bold tracking-[0.14em] text-[#4a4a4a]"
            >
              设备部设控中心
            </div>
          </section>
        </div>
      </footer>
    </div>
  </HmiViewport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getCurrentUser } from '@/api';
import {
  FOOTER_NAV_SLOT_COUNT,
  footerNavigationItems,
  isNavigationItemActive,
  type AppNavigationItem,
} from '@/lib/appNavigation';
import { useRealtimeDataStore } from '@/stores/realtimeData';
import { useWebSocket } from '@/services/websocket';
import { useRoute, useRouter } from 'vue-router';
import HmiViewport from '../components/HmiViewport.vue';
import AppHeader from '../components/AppHeader.vue';
import AppSidebar from '../components/AppSidebar.vue';

const isSidebarOpen = ref(false);
const route = useRoute();
const router = useRouter();
const realtimeDataStore = useRealtimeDataStore();
const { setPersistentSubscriptions } = useWebSocket();
const footerNavigationSlotMap = new Map(
  footerNavigationItems.map((item) => [item.footerSlot ?? -1, item]),
);

interface HmiScaleMeta {
  designWidth?: number;
  designHeight?: number;
}

interface FooterNavSlot {
  index: number;
  label: string;
  item?: AppNavigationItem;
  isClickable: boolean;
  isActive: boolean;
  isPlaceholder: boolean;
  isLocked: boolean;
}

const hmiScaleMeta = computed(() => route.meta.hmiScale as HmiScaleMeta | undefined);
const shouldScaleLayout = computed(() => Boolean(hmiScaleMeta.value));
const layoutDesignWidth = computed(() => hmiScaleMeta.value?.designWidth ?? 1920);
const layoutDesignHeight = computed(() => hmiScaleMeta.value?.designHeight ?? 1080);
const isAdmin = computed(() => getCurrentUser()?.role === 'admin');
const footerSlots = computed<FooterNavSlot[]>(() =>
  Array.from({ length: FOOTER_NAV_SLOT_COUNT }, (_, index) => {
    const item = footerNavigationSlotMap.get(index);

    if (!item) {
      return {
        index,
        label: '预留',
        isClickable: false,
        isActive: false,
        isPlaceholder: true,
        isLocked: false,
      };
    }

    const isClickable = !item.requiresAdmin || isAdmin.value;

    return {
      index,
      label: item.label,
      item,
      isClickable,
      isActive: isClickable && isNavigationItemActive(item, route.path),
      isPlaceholder: false,
      isLocked: !isClickable,
    };
  }),
);

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function handleFooterNavigate(item: AppNavigationItem) {
  if (item.requiresAdmin && !isAdmin.value) {
    return;
  }

  isSidebarOpen.value = false;
  void router.push(item.path);
}

onMounted(() => {
  setPersistentSubscriptions(['SHIFT_NAME']);
});
</script>

<style scoped>
.app-container {
  background-color: #d8d8d8;
  color: var(--foreground);
}

.app-footer {
  border-top: 1px solid #878787;
  background: linear-gradient(180deg, #d7d7d7 0%, #cbcbcb 100%);
  box-shadow: inset 0 1px 0 #f4f4f4;
}

.footer-nav-band {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid #868686;
  border-radius: 3px;
  background: #c8c8c8;
  box-shadow: inset 0 1px 0 #efefef;
}

.footer-nav-slot {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 8px;
  background: linear-gradient(180deg, #d8d8d8 0%, #cbcbcb 100%);
  color: #333333;
  transition:
    background 120ms ease,
    color 120ms ease,
    box-shadow 120ms ease;
}

.footer-nav-slot + .footer-nav-slot {
  border-left: 1px solid #8a8a8a;
}

.footer-nav-slot:disabled {
  cursor: default;
}

.footer-nav-slot.is-clickable {
  cursor: pointer;
}

.footer-nav-slot.is-clickable:hover:not(:disabled) {
  background: linear-gradient(180deg, #ededed 0%, #d9d9d9 100%);
}

.footer-nav-slot.is-clickable:focus-visible {
  outline: 2px solid #6f1616;
  outline-offset: -2px;
}

.footer-nav-slot.is-active {
  background: linear-gradient(180deg, #f0f0f0 0%, #dddddd 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -2px 0 rgba(111, 22, 22, 0.2);
  color: #6f1616;
}

.footer-nav-slot.is-placeholder {
  background: linear-gradient(180deg, #cecece 0%, #c4c4c4 100%);
  color: #8d8d8d;
}

.footer-nav-slot.is-locked {
  background: linear-gradient(180deg, #d1d1d1 0%, #c7c7c7 100%);
  color: #707070;
}

.footer-nav-label {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.04em;
}

.footer-nav-hint {
  font-size: 11px;
  line-height: 1;
  opacity: 0.78;
}
</style>
