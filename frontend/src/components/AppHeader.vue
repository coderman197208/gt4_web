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

    <!-- 中间：系统标题 -->
    <h1 class="text-lg font-semibold">管体4号线L2过程机系统</h1>

    <!-- 右侧：全屏按钮 + 实时时钟 -->
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        class="relative h-9 gap-2 border-slate-400 bg-white/80 text-slate-900 hover:bg-white"
        @click="$emit('toggle-alarm-center')"
      >
        <span
          class="inline-flex h-2.5 w-2.5 rounded-full"
          :class="alarmUnackedCount > 0 ? 'bg-red-500' : 'bg-emerald-500'"
        ></span>
        <span>报警</span>
        <span
          v-if="alarmUnackedCount > 0"
          class="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white"
        >
          {{ alarmUnackedCount }}
        </span>
      </Button>
      <FullscreenToggle />
      <LiveClock />
    </div>
  </header>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import LiveClock from './LiveClock.vue';
import FullscreenToggle from './FullscreenToggle.vue';

withDefaults(
  defineProps<{
    alarmUnackedCount?: number;
  }>(),
  {
    alarmUnackedCount: 0,
  },
);

defineEmits<{
  'toggle-sidebar': [];
  'toggle-alarm-center': [];
}>();
</script>
