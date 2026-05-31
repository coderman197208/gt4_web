<template>
  <transition name="alarm-panel">
    <div v-if="open" class="absolute inset-0 z-40 flex justify-end overflow-hidden">
      <button
        type="button"
        class="absolute inset-0 bg-[rgba(32,37,42,0.14)] backdrop-blur-[1px]"
        aria-label="关闭报警中心"
        @click="$emit('close')"
      />

      <aside
        class="alarm-panel relative z-10 h-full w-[880px] max-w-full overflow-hidden border-l border-[#7f7f7f]"
      >
        <div class="flex h-full flex-col gap-3 overflow-hidden p-3">
          <section class="alarm-frame px-4 pb-3 pt-[18px]">
            <div class="alarm-section-title">报警中心</div>

            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6f1616]/80">
                  Alarm Center
                </p>
                <h2 class="mt-1 text-[22px] font-semibold text-slate-900">区域化报警中心</h2>
                <p class="mt-1 text-xs text-slate-600">与主监控页统一的工业 HMI 报警工作台</p>
              </div>

              <Button
                variant="outline"
                class="h-9 border-[#8a8a8a] bg-[#efefef] text-slate-900 shadow-[inset_0_1px_0_#ffffff] hover:bg-[#f8f8f8]"
                @click="$emit('close')"
              >
                关闭
              </Button>
            </div>
          </section>

          <section class="alarm-frame px-3 pb-3 pt-[18px]">
            <div class="alarm-section-title">报警总览</div>

            <div class="grid grid-cols-3 gap-3">
              <article class="alarm-metric alarm-metric-critical">
                <p class="alarm-metric-label">活动报警</p>
                <p class="alarm-metric-value">
                  {{ alarmStore.summary.total_active }}
                </p>
                <p class="alarm-metric-caption">授权区域内当前持续</p>
              </article>

              <article class="alarm-metric alarm-metric-ack">
                <p class="alarm-metric-label">未确认</p>
                <p class="alarm-metric-value">
                  {{ alarmStore.summary.total_unacked }}
                </p>
                <p class="alarm-metric-caption">需操作员优先处理</p>
              </article>

              <article class="alarm-metric alarm-metric-severity">
                <p class="alarm-metric-label">最高等级</p>
                <p class="mt-2 text-lg font-semibold uppercase text-slate-900">
                  {{ alarmStore.summary.highest_severity ?? 'none' }}
                </p>
                <p class="alarm-metric-caption">当前最严重报警等级</p>
              </article>
            </div>
          </section>

          <section class="alarm-frame px-3 pb-3 pt-[18px]">
            <div class="alarm-section-title">筛选与同步</div>

            <div class="space-y-3">
              <div class="flex gap-3">
                <div class="min-w-0 flex-1">
                  <label class="mb-1 block text-xs font-medium text-slate-700"> 区域筛选 </label>
                  <select :value="selectedAreaValue" class="alarm-field" @change="handleAreaChange">
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

                <div class="min-w-0 flex-[1.45]">
                  <label class="mb-1 block text-xs font-medium text-slate-700"> 关键词 </label>
                  <div class="flex gap-2">
                    <input
                      v-model="keywordInput"
                      class="alarm-field min-w-0 flex-1"
                      placeholder="报警码 / 标题 / 文案"
                      @keyup.enter="applyFilters"
                    />
                    <Button
                      variant="outline"
                      class="h-[38px] border-[#5f7996] bg-[#e2eaf2] text-[#213c57] shadow-[inset_0_1px_0_#ffffff] hover:bg-[#edf3f8]"
                      @click="applyFilters"
                    >
                      查询
                    </Button>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  v-for="severity in severityOptions"
                  :key="severity"
                  type="button"
                  class="rounded-[2px] border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition"
                  :class="severityFilterClass(severity)"
                  @click="toggleSeverityFilter(severity)"
                >
                  {{ severity }}
                </button>
              </div>

              <div
                v-if="alarmStore.lastResyncReason"
                class="alarm-subframe flex items-center justify-between gap-3 px-3 py-2 text-sm text-[#6a4206]"
              >
                <span> 检测到报警状态需要重同步：{{ alarmStore.lastResyncReason }} </span>
                <Button
                  variant="outline"
                  size="sm"
                  class="border-[#b37a2c] bg-[#fee6bf] text-[#6a4206] shadow-[inset_0_1px_0_#fff8e7] hover:bg-[#ffefcf]"
                  @click="handleResync"
                >
                  重新同步
                </Button>
              </div>
            </div>
          </section>

          <section class="alarm-frame px-3 pb-2 pt-[18px]">
            <div class="alarm-section-title">视图切换</div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-[2px] border px-4 py-1.5 text-sm font-medium transition"
                :class="tabClass('active')"
                @click="switchTab('active')"
              >
                活动报警
              </button>

              <button
                type="button"
                class="rounded-[2px] border px-4 py-1.5 text-sm font-medium transition"
                :class="tabClass('history')"
                @click="switchTab('history')"
              >
                历史报警
              </button>

              <span class="ml-auto text-xs text-slate-600">
                第 {{ currentPage }} / {{ totalPages }} 页，共 {{ currentTotal }} 条
              </span>
            </div>
          </section>

          <div class="grid min-h-0 flex-1 grid-cols-[360px,minmax(0,1fr)] gap-3 overflow-hidden">
            <section class="alarm-frame min-h-0 px-2 pb-2 pt-[18px]">
              <div class="alarm-section-title">报警列表</div>

              <div class="flex h-full min-h-0 flex-col">
                <div class="flex-1 overflow-y-auto px-1 py-1">
                  <div v-if="currentItems.length === 0" class="alarm-empty-state">
                    当前筛选条件下暂无报警。
                  </div>

                  <button
                    v-for="alarm in currentItems"
                    :key="alarm.id"
                    type="button"
                    class="mb-3 w-full rounded-[2px] border px-4 py-3 text-left transition"
                    :class="[
                      alarmRowClass(alarm.condition_state, alarm.ack_state),
                      selectedAlarmId === alarm.id
                        ? 'ring-1 ring-[#5a728f]/40 shadow-[inset_0_1px_0_#ffffff,0_0_0_1px_rgba(90,114,143,0.28)]'
                        : 'shadow-[inset_0_1px_0_#fafafa]',
                    ]"
                    @click="selectAlarm(alarm.id)"
                  >
                    <div class="mb-2 flex items-center justify-between gap-3">
                      <span
                        class="rounded-full border px-2 py-1 text-[11px] font-semibold uppercase"
                        :class="severityClass(alarm.severity)"
                      >
                        {{ alarm.severity }}
                      </span>
                      <span class="text-[11px] text-slate-600">
                        {{ alarm.area_name }}
                      </span>
                    </div>

                    <p class="line-clamp-1 text-sm font-semibold text-slate-900">
                      {{ alarm.title }}
                    </p>
                    <p class="mt-1 line-clamp-2 text-xs text-slate-600">
                      {{ alarm.message }}
                    </p>

                    <div class="mt-3 flex items-center justify-between text-[11px] text-slate-600">
                      <span>{{ alarm.alarm_code }}</span>
                      <span>{{ formatDate(alarm.last_occurred_at) }}</span>
                    </div>

                    <div class="mt-2 flex items-center gap-2 text-[11px]">
                      <span
                        class="rounded-full border px-2 py-1"
                        :class="statePairClass(alarm.condition_state, alarm.ack_state)"
                      >
                        {{ alarm.condition_state }} / {{ alarm.ack_state }}
                      </span>
                      <span
                        class="rounded-full border px-2 py-1"
                        :class="stateHintClass(alarm.condition_state, alarm.ack_state)"
                      >
                        {{ stateHintText(alarm.condition_state, alarm.ack_state) }}
                      </span>
                    </div>
                  </button>
                </div>

                <div
                  class="mt-2 flex items-center justify-between border-t border-[#9b9b9b] px-2 pt-2 text-xs text-slate-700"
                >
                  <Button
                    variant="outline"
                    class="h-8 border-[#8a8a8a] bg-[#eeeeee] text-slate-800 shadow-[inset_0_1px_0_#ffffff] hover:bg-[#f8f8f8]"
                    :disabled="currentPage <= 1"
                    @click="goPrevPage"
                  >
                    上一页
                  </Button>

                  <span>{{ currentTotal }} 条</span>

                  <Button
                    variant="outline"
                    class="h-8 border-[#8a8a8a] bg-[#eeeeee] text-slate-800 shadow-[inset_0_1px_0_#ffffff] hover:bg-[#f8f8f8]"
                    :disabled="currentPage >= totalPages"
                    @click="goNextPage"
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </section>

            <section class="alarm-frame min-h-0 px-3 pb-3 pt-[18px]">
              <div class="alarm-section-title">报警详情</div>

              <div v-if="alarmStore.selectedAlarmDetail" class="flex h-full min-h-0 flex-col">
                <div class="alarm-subframe px-4 py-3">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <div class="flex items-center gap-2">
                        <span
                          class="rounded-full border px-2 py-1 text-[11px] font-semibold uppercase"
                          :class="severityClass(alarmStore.selectedAlarmDetail.alarm.severity)"
                        >
                          {{ alarmStore.selectedAlarmDetail.alarm.severity }}
                        </span>
                        <span class="text-xs text-slate-600">
                          {{ alarmStore.selectedAlarmDetail.alarm.area_name }}
                        </span>
                        <span
                          class="rounded-full border px-2 py-1 text-[11px]"
                          :class="
                            stateHintClass(
                              alarmStore.selectedAlarmDetail.alarm.condition_state,
                              alarmStore.selectedAlarmDetail.alarm.ack_state,
                            )
                          "
                        >
                          {{
                            stateHintText(
                              alarmStore.selectedAlarmDetail.alarm.condition_state,
                              alarmStore.selectedAlarmDetail.alarm.ack_state,
                            )
                          }}
                        </span>
                      </div>

                      <h3 class="mt-2 text-lg font-semibold text-slate-900">
                        {{ alarmStore.selectedAlarmDetail.alarm.title }}
                      </h3>
                      <p class="mt-1 text-sm text-slate-600">
                        {{ alarmStore.selectedAlarmDetail.alarm.message }}
                      </p>
                    </div>

                    <Button
                      v-if="alarmStore.selectedAlarmDetail.alarm.ack_state === 'unacked'"
                      class="border border-[#a56d20] bg-[linear-gradient(180deg,#ffefce_0%,#f5c878_100%)] text-[#5d3600] shadow-[inset_0_1px_0_#fff8e4] hover:bg-[linear-gradient(180deg,#fff2d8_0%,#f7d18a_100%)]"
                      :disabled="alarmStore.isAckPending(alarmStore.selectedAlarmDetail.alarm.id)"
                      @click="ackSelectedAlarm"
                    >
                      <span v-if="alarmStore.isAckPending(alarmStore.selectedAlarmDetail.alarm.id)">
                        确认中...
                      </span>
                      <span v-else> 确认报警 </span>
                    </Button>
                  </div>
                </div>

                <div class="mt-3 grid min-h-0 flex-1 grid-rows-[auto,1fr] gap-3 overflow-hidden">
                  <div
                    class="alarm-subframe grid grid-cols-2 gap-3 px-4 py-3 text-sm text-slate-700"
                  >
                    <div>
                      <p class="text-xs text-slate-500">报警码</p>
                      <p class="mt-1 font-medium text-slate-900">
                        {{ alarmStore.selectedAlarmDetail.alarm.alarm_code }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500">来源</p>
                      <p class="mt-1 font-medium text-slate-900">
                        {{ alarmStore.selectedAlarmDetail.alarm.source_module }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500">状态</p>
                      <p class="mt-1 font-medium text-slate-900">
                        {{ alarmStore.selectedAlarmDetail.alarm.condition_state }} /
                        {{ alarmStore.selectedAlarmDetail.alarm.ack_state }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500">版本</p>
                      <p class="mt-1 font-medium text-slate-900">
                        {{ alarmStore.selectedAlarmDetail.alarm.version }}
                      </p>
                    </div>
                  </div>

                  <div class="grid min-h-0 grid-cols-[minmax(0,1fr),280px] gap-3 overflow-hidden">
                    <div class="alarm-subframe overflow-y-auto px-4 py-3">
                      <label class="mb-2 block text-xs font-medium text-slate-700">
                        确认备注
                      </label>
                      <textarea
                        v-model="ackNote"
                        rows="3"
                        class="alarm-textarea"
                        placeholder="可选，记录本次人工确认说明"
                      />

                      <div class="mt-4">
                        <p class="mb-2 text-xs font-medium text-slate-700">详情快照</p>
                        <pre class="alarm-code-block p-4 text-xs">{{ formattedDetailJson }}</pre>
                      </div>
                    </div>

                    <div class="alarm-subframe overflow-y-auto px-3 py-3">
                      <p class="mb-3 text-xs font-medium text-slate-700">操作日志</p>

                      <div class="space-y-3">
                        <article
                          v-for="log in alarmStore.selectedAlarmDetail.logs"
                          :key="log.id"
                          class="alarm-log-card p-3"
                        >
                          <div
                            class="flex items-center justify-between gap-2 text-xs text-slate-600"
                          >
                            <span
                              class="rounded-full border px-2 py-1 uppercase"
                              :class="logActionClass(log.action)"
                            >
                              {{ log.action }}
                            </span>
                            <span>{{ formatDate(log.created_at) }}</span>
                          </div>
                          <p class="mt-2 text-sm font-medium text-slate-900">
                            {{ log.operator_name ?? 'system' }}
                          </p>
                          <pre class="mt-2 whitespace-pre-wrap text-[11px] text-slate-600">{{
                            formatJson(log.payload_json)
                          }}</pre>
                        </article>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="alarm-empty-state flex h-full items-center justify-center px-8">
                请选择一条报警查看详情与确认状态。
              </div>
            </section>
          </div>
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
      return 'border-[#973535] bg-[#f6d8d8] text-[#7a1d1d]';
    case 'major':
      return 'border-[#b26b28] bg-[#f9e0c3] text-[#7a4613]';
    case 'minor':
      return 'border-[#b48a28] bg-[#f8ebc2] text-[#71570c]';
    case 'warning':
      return 'border-[#9b8a35] bg-[#efe9c8] text-[#665710]';
    default:
      return 'border-[#4e7596] bg-[#dceaf4] text-[#1e4a67]';
  }
}

function severityFilterClass(severity: AlarmSeverity) {
  return isSeveritySelected(severity)
    ? 'border-[#566f8d] bg-[#e6eef7] text-[#23384f] shadow-[inset_0_1px_0_#ffffff]'
    : 'border-[#8a8a8a] bg-[#ebebeb] text-slate-700 shadow-[inset_0_1px_0_#ffffff] hover:bg-[#f5f5f5]';
}

function tabClass(tab: 'active' | 'history') {
  return activeTab.value === tab
    ? 'border-[#5f1111] bg-[#6f1616] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
    : 'border-[#8a8a8a] bg-[#ededed] text-slate-700 shadow-[inset_0_1px_0_#ffffff] hover:bg-[#f8f8f8]';
}

function alarmRowClass(conditionState: string, ackState: string) {
  if (conditionState === 'active' && ackState === 'unacked') {
    return 'border-[#c18b47] bg-[#fff2e2] hover:bg-[#fff7ee]';
  }

  if (conditionState === 'active') {
    return 'border-[#7a91aa] bg-[#eef3f7] hover:bg-[#f5f8fa]';
  }

  return 'border-[#a8a8a8] bg-[#efefef] hover:bg-[#f7f7f7]';
}

function statePairClass(conditionState: string, ackState: string) {
  if (conditionState === 'active' && ackState === 'unacked') {
    return 'border-[#bc8442] bg-[#ffe7c8] text-[#6f3d08]';
  }

  if (conditionState === 'active') {
    return 'border-[#6a84a2] bg-[#dbe7f2] text-[#20425f]';
  }

  return 'border-[#969696] bg-[#e3e3e3] text-[#4f5963]';
}

function stateHintText(conditionState: string, ackState: string) {
  if (conditionState === 'active' && ackState === 'unacked') {
    return '待处理';
  }

  if (conditionState === 'active' && ackState === 'acked') {
    return '已确认';
  }

  return '已恢复';
}

function stateHintClass(conditionState: string, ackState: string) {
  if (conditionState === 'active' && ackState === 'unacked') {
    return 'border-[#a53030] bg-[#f7d8d8] text-[#7a1d1d]';
  }

  if (conditionState === 'active' && ackState === 'acked') {
    return 'border-[#6a84a2] bg-[#dce7f3] text-[#20425f]';
  }

  return 'border-[#969696] bg-[#e7e7e7] text-[#4f5963]';
}

function logActionClass(action: string) {
  switch (action) {
    case 'raise':
      return 'border-[#973535] bg-[#f6d8d8] text-[#7a1d1d]';
    case 'ack':
      return 'border-[#b26b28] bg-[#f9e0c3] text-[#7a4613]';
    case 'clear':
      return 'border-[#4e7596] bg-[#dceaf4] text-[#1e4a67]';
    default:
      return 'border-[#8f8f8f] bg-[#e7e7e7] text-[#4f5963]';
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
  background: linear-gradient(180deg, rgba(216, 216, 216, 0.98), rgba(204, 204, 204, 0.99));
  box-shadow: -12px 0 30px rgba(15, 23, 42, 0.18);
}

.alarm-frame {
  position: relative;
  border: 1px solid #868686;
  border-radius: 3px;
  background: #d3d3d3;
  box-shadow: inset 0 1px 0 #f7f7f7;
}

.alarm-subframe {
  border: 1px solid #8a8a8a;
  border-radius: 2px;
  background: #d8d8d8;
  box-shadow: inset 0 1px 0 #f4f4f4;
}

.alarm-section-title {
  position: absolute;
  top: -11px;
  left: 12px;
  padding: 0 4px;
  background: #d8d8d8;
  color: #6f1616;
  font-weight: 700;
  line-height: 1.2;
}

.alarm-metric {
  border: 1px solid #8a8a8a;
  border-radius: 2px;
  padding: 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.alarm-metric-critical {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(253, 236, 236, 0.95));
}

.alarm-metric-ack {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 241, 219, 0.95));
}

.alarm-metric-severity {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(226, 236, 245, 0.95));
}

.alarm-metric-label {
  font-size: 11px;
  color: #5f6368;
}

.alarm-metric-value {
  margin-top: 8px;
  font-size: 30px;
  font-weight: 600;
  line-height: 1;
  color: #0f172a;
}

.alarm-metric-caption {
  margin-top: 6px;
  font-size: 11px;
  color: #5f6368;
}

.alarm-field {
  height: 38px;
  width: 100%;
  border: 1px solid #8a8a8a;
  border-radius: 2px;
  background: linear-gradient(180deg, #f7f7f7 0%, #ececec 100%);
  padding: 0 12px;
  font-size: 14px;
  color: #0f172a;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.alarm-field:focus,
.alarm-textarea:focus {
  outline: none;
  border-color: #516b8b;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 0 0 1px rgba(81, 107, 139, 0.18);
}

.alarm-textarea {
  min-height: 88px;
  width: 100%;
  resize: none;
  border: 1px solid #8a8a8a;
  border-radius: 2px;
  background: linear-gradient(180deg, #f7f7f7 0%, #ececec 100%);
  padding: 10px 12px;
  font-size: 14px;
  color: #0f172a;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.alarm-empty-state {
  border: 1px dashed #999999;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.32);
  text-align: center;
  font-size: 14px;
  color: #5f6368;
}

.alarm-code-block {
  overflow: auto;
  border: 1px solid #8a8a8a;
  border-radius: 2px;
  background: linear-gradient(180deg, #f3f6f8 0%, #e4eaef 100%);
  color: #14324a;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.alarm-log-card {
  border: 1px solid #8a8a8a;
  border-radius: 2px;
  background: linear-gradient(180deg, #f7f7f7 0%, #ebebeb 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.alarm-panel-enter-active,
.alarm-panel-leave-active {
  transition: opacity 0.18s ease;
}

.alarm-panel-enter-active .alarm-panel,
.alarm-panel-leave-active .alarm-panel {
  transition: transform 0.18s ease;
}

.alarm-panel-enter-from,
.alarm-panel-leave-to {
  opacity: 0;
}

.alarm-panel-enter-from .alarm-panel,
.alarm-panel-leave-to .alarm-panel {
  transform: translateX(20px);
}
</style>
