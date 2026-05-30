<template>
  <transition name="alarm-panel">
    <div v-if="open" class="absolute inset-0 z-40 flex justify-end overflow-hidden">
      <button
        type="button"
        class="absolute inset-0 bg-black/25"
        aria-label="关闭报警中心"
        @click="$emit('close')"
      ></button>

      <aside
        class="alarm-panel relative z-10 flex h-full w-[760px] max-w-full flex-col border-l border-slate-500/40 shadow-2xl"
      >
        <div class="flex items-center justify-between border-b border-slate-500/40 px-5 py-4">
          <div>
            <p class="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Alarm Center</p>
            <h2 class="mt-1 text-xl font-semibold text-slate-50">区域化报警中心</h2>
          </div>
          <Button variant="ghost" class="text-slate-100 hover:bg-white/10" @click="$emit('close')">
            关闭
          </Button>
        </div>

        <div class="grid grid-cols-3 gap-3 border-b border-slate-500/30 px-5 py-4 text-slate-50">
          <section class="rounded-xl border border-red-400/30 bg-red-500/10 p-3">
            <p class="text-xs text-red-100/80">活动报警</p>
            <p class="mt-2 text-3xl font-semibold">{{ alarmStore.summary.total_active }}</p>
          </section>
          <section class="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3">
            <p class="text-xs text-amber-100/80">未确认</p>
            <p class="mt-2 text-3xl font-semibold">{{ alarmStore.summary.total_unacked }}</p>
          </section>
          <section class="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3">
            <p class="text-xs text-cyan-100/80">最高等级</p>
            <p class="mt-2 text-lg font-semibold uppercase">
              {{ alarmStore.summary.highest_severity ?? 'none' }}
            </p>
          </section>
        </div>

        <div class="space-y-3 border-b border-slate-500/30 px-5 py-4 text-slate-100">
          <div class="flex gap-3">
            <div class="min-w-0 flex-1">
              <label class="mb-1 block text-xs text-slate-300">区域筛选</label>
              <select
                :value="selectedAreaValue"
                class="w-full rounded-md border border-slate-500/60 bg-slate-900/70 px-3 py-2 text-sm"
                @change="handleAreaChange"
              >
                <option value="">全部授权区域</option>
                <option
                  v-for="area in alarmStore.areaContext?.areas ?? []"
                  :key="area.area_id"
                  :value="area.area_id"
                >
                  {{ area.area_name }}
                </option>
              </select>
            </div>
            <div class="min-w-0 flex-[1.4]">
              <label class="mb-1 block text-xs text-slate-300">关键词</label>
              <div class="flex gap-2">
                <input
                  v-model="keywordInput"
                  class="min-w-0 flex-1 rounded-md border border-slate-500/60 bg-slate-900/70 px-3 py-2 text-sm"
                  placeholder="报警码 / 标题 / 文案"
                  @keyup.enter="applyFilters"
                />
                <Button class="bg-cyan-600 text-white hover:bg-cyan-500" @click="applyFilters"
                  >查询</Button
                >
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="severity in severityOptions"
              :key="severity"
              type="button"
              class="rounded-full border px-3 py-1 text-xs uppercase transition"
              :class="
                isSeveritySelected(severity)
                  ? 'border-cyan-300 bg-cyan-400/20 text-cyan-50'
                  : 'border-slate-500/60 bg-slate-900/50 text-slate-300 hover:border-cyan-300/60'
              "
              @click="toggleSeverityFilter(severity)"
            >
              {{ severity }}
            </button>
          </div>

          <div
            v-if="alarmStore.lastResyncReason"
            class="flex items-center justify-between rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-50"
          >
            <span>检测到报警状态需要重同步：{{ alarmStore.lastResyncReason }}</span>
            <Button
              size="sm"
              class="bg-amber-500 text-slate-950 hover:bg-amber-400"
              @click="handleResync"
            >
              重新同步
            </Button>
          </div>
        </div>

        <div
          class="flex items-center gap-2 border-b border-slate-500/30 px-5 py-3 text-sm text-slate-100"
        >
          <button
            type="button"
            class="rounded-full px-3 py-1.5 transition"
            :class="
              activeTab === 'active'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-900/60 text-slate-200'
            "
            @click="switchTab('active')"
          >
            活动报警
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1.5 transition"
            :class="
              activeTab === 'history'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-900/60 text-slate-200'
            "
            @click="switchTab('history')"
          >
            历史报警
          </button>
          <span class="ml-auto text-xs text-slate-400">
            第 {{ currentPage }} / {{ totalPages }} 页，共 {{ currentTotal }} 条
          </span>
        </div>

        <div class="grid min-h-0 flex-1 grid-cols-[360px,minmax(0,1fr)] overflow-hidden">
          <section class="flex min-h-0 flex-col border-r border-slate-500/30 bg-slate-950/70">
            <div class="flex-1 overflow-y-auto px-3 py-3">
              <div
                v-if="currentItems.length === 0"
                class="rounded-xl border border-dashed border-slate-600/70 px-4 py-10 text-center text-sm text-slate-400"
              >
                当前筛选条件下暂无报警。
              </div>

              <button
                v-for="alarm in currentItems"
                :key="alarm.id"
                type="button"
                class="mb-3 w-full rounded-xl border px-4 py-3 text-left transition"
                :class="
                  selectedAlarmId === alarm.id
                    ? 'border-cyan-300 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(125,211,252,0.3)]'
                    : 'border-slate-700/80 bg-slate-900/70 hover:border-cyan-400/40 hover:bg-slate-900'
                "
                @click="selectAlarm(alarm.id)"
              >
                <div class="mb-2 flex items-center justify-between gap-3">
                  <span
                    class="rounded-full px-2 py-1 text-[11px] font-semibold uppercase"
                    :class="severityClass(alarm.severity)"
                  >
                    {{ alarm.severity }}
                  </span>
                  <span class="text-[11px] text-slate-400">{{ alarm.area_name }}</span>
                </div>
                <p class="line-clamp-1 text-sm font-semibold text-slate-50">{{ alarm.title }}</p>
                <p class="mt-1 line-clamp-2 text-xs text-slate-300">{{ alarm.message }}</p>
                <div class="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{{ alarm.alarm_code }}</span>
                  <span>{{ formatDate(alarm.last_occurred_at) }}</span>
                </div>
                <div class="mt-2 flex items-center gap-2 text-[11px]">
                  <span class="rounded-full border border-slate-600 px-2 py-1 text-slate-300">
                    {{ alarm.condition_state }} / {{ alarm.ack_state }}
                  </span>
                  <span
                    v-if="alarm.ack_state === 'unacked'"
                    class="rounded-full bg-amber-400/20 px-2 py-1 text-amber-100"
                  >
                    待确认
                  </span>
                </div>
              </button>
            </div>

            <div
              class="flex items-center justify-between border-t border-slate-500/30 px-4 py-3 text-xs text-slate-300"
            >
              <Button
                variant="outline"
                class="border-slate-500/60 bg-transparent text-slate-100 hover:bg-white/10"
                :disabled="currentPage <= 1"
                @click="goPrevPage"
              >
                上一页
              </Button>
              <span>{{ currentTotal }} 条</span>
              <Button
                variant="outline"
                class="border-slate-500/60 bg-transparent text-slate-100 hover:bg-white/10"
                :disabled="currentPage >= totalPages"
                @click="goNextPage"
              >
                下一页
              </Button>
            </div>
          </section>

          <section class="flex min-h-0 flex-col bg-[#131923] text-slate-100">
            <div v-if="alarmStore.selectedAlarmDetail" class="flex min-h-0 flex-1 flex-col">
              <div class="border-b border-slate-500/30 px-5 py-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <span
                        class="rounded-full px-2 py-1 text-[11px] font-semibold uppercase"
                        :class="severityClass(alarmStore.selectedAlarmDetail.alarm.severity)"
                      >
                        {{ alarmStore.selectedAlarmDetail.alarm.severity }}
                      </span>
                      <span class="text-xs text-slate-400">{{
                        alarmStore.selectedAlarmDetail.alarm.area_name
                      }}</span>
                    </div>
                    <h3 class="mt-2 text-lg font-semibold text-slate-50">
                      {{ alarmStore.selectedAlarmDetail.alarm.title }}
                    </h3>
                    <p class="mt-1 text-sm text-slate-300">
                      {{ alarmStore.selectedAlarmDetail.alarm.message }}
                    </p>
                  </div>
                  <Button
                    v-if="alarmStore.selectedAlarmDetail.alarm.ack_state === 'unacked'"
                    class="bg-amber-500 text-slate-950 hover:bg-amber-400"
                    :disabled="alarmStore.isAckPending(alarmStore.selectedAlarmDetail.alarm.id)"
                    @click="ackSelectedAlarm"
                  >
                    <span v-if="alarmStore.isAckPending(alarmStore.selectedAlarmDetail.alarm.id)"
                      >确认中...</span
                    >
                    <span v-else>确认报警</span>
                  </Button>
                </div>
              </div>

              <div class="grid min-h-0 flex-1 grid-rows-[auto,1fr] overflow-hidden">
                <div
                  class="grid grid-cols-2 gap-3 border-b border-slate-500/30 px-5 py-4 text-sm text-slate-300"
                >
                  <div>
                    <p class="text-xs text-slate-500">报警码</p>
                    <p class="mt-1 font-medium text-slate-100">
                      {{ alarmStore.selectedAlarmDetail.alarm.alarm_code }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500">来源</p>
                    <p class="mt-1 font-medium text-slate-100">
                      {{ alarmStore.selectedAlarmDetail.alarm.source_module }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500">状态</p>
                    <p class="mt-1 font-medium text-slate-100">
                      {{ alarmStore.selectedAlarmDetail.alarm.condition_state }} /
                      {{ alarmStore.selectedAlarmDetail.alarm.ack_state }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500">版本</p>
                    <p class="mt-1 font-medium text-slate-100">
                      {{ alarmStore.selectedAlarmDetail.alarm.version }}
                    </p>
                  </div>
                </div>

                <div class="grid min-h-0 grid-cols-[minmax(0,1fr),260px] overflow-hidden">
                  <div class="overflow-y-auto px-5 py-4">
                    <label class="mb-2 block text-xs text-slate-400">确认备注</label>
                    <textarea
                      v-model="ackNote"
                      rows="3"
                      class="mb-4 w-full rounded-md border border-slate-500/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
                      placeholder="可选，记录本次人工确认说明"
                    ></textarea>

                    <div>
                      <p class="mb-2 text-xs text-slate-400">详情快照</p>
                      <pre
                        class="rounded-xl border border-slate-700/80 bg-slate-950/80 p-4 text-xs text-cyan-100"
                        >{{ formattedDetailJson }}</pre
                      >
                    </div>
                  </div>

                  <div class="border-l border-slate-500/30 px-4 py-4">
                    <p class="mb-3 text-xs text-slate-400">操作日志</p>
                    <div class="max-h-full space-y-3 overflow-y-auto pr-1">
                      <article
                        v-for="log in alarmStore.selectedAlarmDetail.logs"
                        :key="log.id"
                        class="rounded-xl border border-slate-700/80 bg-slate-950/70 p-3"
                      >
                        <div class="flex items-center justify-between gap-2 text-xs text-slate-400">
                          <span class="uppercase text-cyan-200">{{ log.action }}</span>
                          <span>{{ formatDate(log.created_at) }}</span>
                        </div>
                        <p class="mt-2 text-sm text-slate-100">
                          {{ log.operator_name ?? 'system' }}
                        </p>
                        <pre class="mt-2 whitespace-pre-wrap text-[11px] text-slate-300">{{
                          formatJson(log.payload_json)
                        }}</pre>
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else
              class="flex flex-1 items-center justify-center px-8 text-center text-sm text-slate-400"
            >
              请选择一条报警查看详情与确认状态。
            </div>
          </section>
        </div>
      </aside>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { AlarmSeverity } from '@gt4_web/shared';
import { Button } from '@/components/ui/button';
import { useAlarmCenterStore } from '@/stores/alarmCenter';

const props = defineProps<{
  open: boolean;
}>();

defineEmits<{
  close: [];
}>();

const alarmStore = useAlarmCenterStore();
const activeTab = ref<'active' | 'history'>('active');
const keywordInput = ref('');
const ackNote = ref('');
const severityOptions: AlarmSeverity[] = ['critical', 'major', 'minor', 'warning', 'info'];

const currentItems = computed(() =>
  activeTab.value === 'active' ? alarmStore.activeList : alarmStore.historyList,
);
const currentPage = computed(() =>
  activeTab.value === 'active' ? alarmStore.activePage : alarmStore.historyPage,
);
const currentTotal = computed(() =>
  activeTab.value === 'active' ? alarmStore.activeTotal : alarmStore.historyTotal,
);
const totalPages = computed(() => Math.max(1, Math.ceil(currentTotal.value / alarmStore.pageSize)));
const selectedAreaValue = computed(() =>
  alarmStore.selectedAreaIds.length === 1 ? String(alarmStore.selectedAreaIds[0]) : '',
);
const selectedAlarmId = computed(() => alarmStore.selectedAlarmId);
const formattedDetailJson = computed(() =>
  alarmStore.selectedAlarmDetail
    ? JSON.stringify(alarmStore.selectedAlarmDetail.alarm.detail_json, null, 2)
    : '{}',
);

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      return;
    }

    keywordInput.value = alarmStore.keyword;
    await alarmStore.initialize();

    if (activeTab.value === 'history') {
      await alarmStore.refreshHistory();
    }

    if (!alarmStore.selectedAlarmId && alarmStore.activeList.length > 0) {
      await alarmStore.loadAlarmDetailById(alarmStore.activeList[0].id);
    }
  },
  { immediate: true },
);

function formatDate(value: string | null) {
  if (!value) {
    return '--';
  }

  return new Date(value).toLocaleString();
}

function formatJson(value: Record<string, unknown>) {
  return JSON.stringify(value, null, 2);
}

function severityClass(severity: AlarmSeverity) {
  switch (severity) {
    case 'critical':
      return 'bg-red-500/20 text-red-100';
    case 'major':
      return 'bg-orange-500/20 text-orange-100';
    case 'minor':
      return 'bg-amber-500/20 text-amber-100';
    case 'warning':
      return 'bg-yellow-400/20 text-yellow-100';
    default:
      return 'bg-cyan-500/20 text-cyan-100';
  }
}

function isSeveritySelected(severity: AlarmSeverity) {
  return alarmStore.severityFilters.includes(severity);
}

async function applyFilters() {
  alarmStore.setKeyword(keywordInput.value);
  await Promise.all([
    alarmStore.loadSummary(),
    alarmStore.loadActiveList(),
    activeTab.value === 'history' ? alarmStore.refreshHistory() : Promise.resolve(),
  ]);
}

async function handleAreaChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const nextValue = target.value ? [Number.parseInt(target.value, 10)] : [];
  alarmStore.setAreaFilter(nextValue.filter((value) => !Number.isNaN(value)));
  await applyFilters();
}

async function toggleSeverityFilter(severity: AlarmSeverity) {
  const nextValue = isSeveritySelected(severity)
    ? alarmStore.severityFilters.filter((item) => item !== severity)
    : [...alarmStore.severityFilters, severity];
  alarmStore.setSeverityFilters(nextValue);
  await applyFilters();
}

async function switchTab(nextTab: 'active' | 'history') {
  activeTab.value = nextTab;

  if (nextTab === 'history' && alarmStore.historyList.length === 0) {
    await alarmStore.refreshHistory();
  }
}

async function selectAlarm(alarmId: number) {
  await alarmStore.loadAlarmDetailById(alarmId);
}

async function ackSelectedAlarm() {
  await alarmStore.ackSelectedAlarm(ackNote.value);
  ackNote.value = '';
}

async function handleResync() {
  await alarmStore.resync();
}

async function goPrevPage() {
  if (currentPage.value <= 1) {
    return;
  }

  if (activeTab.value === 'active') {
    alarmStore.activePage -= 1;
    await alarmStore.loadActiveList();
    return;
  }

  alarmStore.historyPage -= 1;
  await alarmStore.refreshHistory();
}

async function goNextPage() {
  if (currentPage.value >= totalPages.value) {
    return;
  }

  if (activeTab.value === 'active') {
    alarmStore.activePage += 1;
    await alarmStore.loadActiveList();
    return;
  }

  alarmStore.historyPage += 1;
  await alarmStore.refreshHistory();
}
</script>

<style scoped>
.alarm-panel {
  background:
    linear-gradient(180deg, rgba(19, 25, 35, 0.98), rgba(10, 16, 24, 0.98)),
    radial-gradient(circle at top, rgba(56, 189, 248, 0.16), transparent 42%);
}

.alarm-panel-enter-active,
.alarm-panel-leave-active {
  transition: opacity 0.2s ease;
}

.alarm-panel-enter-active .alarm-panel,
.alarm-panel-leave-active .alarm-panel {
  transition: transform 0.22s ease;
}

.alarm-panel-enter-from,
.alarm-panel-leave-to {
  opacity: 0;
}

.alarm-panel-enter-from .alarm-panel,
.alarm-panel-leave-to .alarm-panel {
  transform: translateX(24px);
}
</style>
