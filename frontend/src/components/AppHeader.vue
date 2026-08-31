<template>
  <header class="app-header flex items-center justify-between px-4 h-14 border-b bg-[#d8d8d8]">
    <!-- 左侧：汉堡菜单按钮 -->
    <Button @click="$emit('toggle-sidebar')" variant="ghost" size="icon" aria-label="切换侧边栏">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </Button>

    <div class="flex min-w-0 flex-1 items-center justify-center gap-4 px-4">
      <h1 class="shrink-0 text-base font-semibold">管体4号线L2过程机系统</h1>
      <AlarmSummary />
    </div>

    <!-- 右侧：班号 + 全屏按钮 + 实时时钟 -->
    <div class="flex items-center gap-2">
      <div
        class="flex h-9 min-w-[92px] items-center justify-center rounded-[2px] border border-[#8a8a8a] bg-[linear-gradient(180deg,#f8f8f8_0%,#e9e9e9_100%)] px-3 text-sm font-semibold text-[#6f1616] shadow-[inset_0_1px_0_#ffffff]"
      >
        <span>班号：</span>
        <span class="ml-1 min-w-[2ch] text-[#1f2937]">{{ shiftName || '--' }}</span>
      </div>
      <FullscreenToggle />
      <LiveClock />
    </div>
  </header>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import LiveClock from './LiveClock.vue';
import FullscreenToggle from './FullscreenToggle.vue';
import AlarmSummary from './AlarmSummary.vue';

withDefaults(
  defineProps<{
    shiftName?: string | null;
  }>(),
  {
    shiftName: null,
  },
);

defineEmits<{
  'toggle-sidebar': [];
}>();
</script>
