<template>
  <header
    class="app-header flex h-14 items-center justify-between border-b border-[#8a8a8a] bg-[#d8d8d8] px-4 shadow-[inset_0_1px_0_#f7f7f7]"
  >
    <!-- 左侧：汉堡菜单按钮 -->
    <Button variant="ghost" size="icon" aria-label="切换侧边栏" @click="$emit('toggle-sidebar')">
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
        class="relative h-9 gap-2 rounded-[2px] border-[#8a8a8a] bg-[linear-gradient(180deg,#f8f8f8_0%,#e9e9e9_100%)] px-3 text-slate-900 shadow-[inset_0_1px_0_#ffffff] hover:bg-[linear-gradient(180deg,#ffffff_0%,#f1f1f1_100%)]"
        @click="$emit('toggle-alarm-center')"
      >
        <span
          class="inline-flex h-2.5 w-2.5 rounded-full shadow-[0_0_0_1px_rgba(15,23,42,0.18)]"
          :class="alarmUnackedCount > 0 ? 'bg-red-500' : 'bg-emerald-500'"
        />
        <span class="text-sm font-medium tracking-[0.06em] text-[#6f1616]"> 报警中心 </span>
        <span
          v-if="alarmUnackedCount > 0"
          class="rounded-full border border-[#7f2020] bg-[#b72d2d] px-2 py-0.5 text-[11px] font-semibold leading-none text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
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
