<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import type { AlarmEvent, AlarmQueryDays } from '@gt4_web/shared';
import { acknowledgeAlarm, acknowledgeAlarms, getAlarms } from '@/api';
import { useAlarmRefresh } from '@/composables/useAlarmRefresh';
import WinButton from '@/components/custom/WinButton.vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const selectedDays = ref<`${AlarmQueryDays}`>('1');
const currentPage = ref(1);
const alarms = ref<AlarmEvent[]>([]);
const total = ref(0);
const loadFailed = ref(false);
const acknowledgingIds = ref(new Set<string>());
const pageSize = 20;

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));
const unacknowledgedIds = computed(() =>
  alarms.value
    .filter((alarm) => !alarm.acknowledgedAt && !acknowledgingIds.value.has(alarm.id))
    .map((alarm) => alarm.id),
);

function isAcknowledged(alarm: AlarmEvent): boolean {
  return Boolean(alarm.acknowledgedAt) || acknowledgingIds.value.has(alarm.id);
}

const timeFormatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  hour12: false,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function formatTime(value: string): string {
  return timeFormatter.format(new Date(value)).replace(/\//g, '-');
}

async function loadAlarms(): Promise<void> {
  try {
    const result = await getAlarms(Number(selectedDays.value) as AlarmQueryDays, currentPage.value);
    alarms.value = result.items;
    total.value = result.total;
    loadFailed.value = false;
  } catch {
    loadFailed.value = true;
  }
}

const { requestRefresh } = useAlarmRefresh(loadAlarms);

watch(selectedDays, () => {
  currentPage.value = 1;
  requestRefresh();
});

watch(currentPage, requestRefresh);

async function handleAcknowledge(alarm: AlarmEvent): Promise<void> {
  if (alarm.acknowledgedAt || acknowledgingIds.value.has(alarm.id)) return;
  acknowledgingIds.value = new Set(acknowledgingIds.value).add(alarm.id);
  try {
    const result = await acknowledgeAlarm(alarm.id);
    alarm.acknowledgedAt = result.acknowledgedAt;
    requestRefresh();
  } catch {
    toast.error('报警确认失败');
  } finally {
    const nextIds = new Set(acknowledgingIds.value);
    nextIds.delete(alarm.id);
    acknowledgingIds.value = nextIds;
  }
}

async function handleAcknowledgePage(): Promise<void> {
  const ids = [...unacknowledgedIds.value];
  if (ids.length === 0) return;
  acknowledgingIds.value = new Set([...acknowledgingIds.value, ...ids]);
  try {
    await acknowledgeAlarms(ids);
    const acknowledgedAt = new Date().toISOString();
    alarms.value.forEach((alarm) => {
      if (ids.includes(alarm.id)) alarm.acknowledgedAt = acknowledgedAt;
    });
    requestRefresh();
  } catch {
    toast.error('当前页报警确认失败');
  } finally {
    const nextIds = new Set(acknowledgingIds.value);
    ids.forEach((id) => nextIds.delete(id));
    acknowledgingIds.value = nextIds;
    requestRefresh();
  }
}
</script>

<template>
  <div class="alarm-view h-full overflow-hidden p-4">
    <section class="alarm-panel flex h-full flex-col">
      <header class="alarm-toolbar flex h-14 shrink-0 items-center justify-between px-4">
        <h2 class="text-lg font-bold text-[#333333]">报警查询</h2>
        <div class="flex items-center gap-3">
          <span class="text-sm font-semibold text-[#444444]">查询范围</span>
          <Select v-model="selectedDays">
            <SelectTrigger class="h-8 w-[150px] rounded-[2px] border-[#858585] bg-[#f2f2f2]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">最近 1 天</SelectItem>
              <SelectItem value="3">最近 3 天</SelectItem>
              <SelectItem value="10">最近 10 天</SelectItem>
              <SelectItem value="30">最近 30 天</SelectItem>
            </SelectContent>
          </Select>
          <WinButton :disabled="unacknowledgedIds.length === 0" @click="handleAcknowledgePage">
            确认当前页
          </WinButton>
        </div>
      </header>

      <div v-if="loadFailed" class="alarm-error">报警数据更新失败</div>

      <div class="min-h-0 flex-1 overflow-hidden">
        <Table class="table-fixed">
          <TableHeader class="sticky top-0 bg-[#d0d0d0]">
            <TableRow class="h-10 border-[#8d8d8d] hover:bg-[#d0d0d0]">
              <TableHead class="w-[210px] text-center text-[#222222]">报警时间</TableHead>
              <TableHead class="w-[150px] text-center text-[#222222]">报警区域</TableHead>
              <TableHead class="text-[#222222]">报警信息</TableHead>
              <TableHead class="w-[120px] text-center text-[#222222]">确认状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="alarm in alarms"
              :key="alarm.id"
              class="h-9 border-[#b3b3b3]"
              :class="
                !isAcknowledged(alarm)
                  ? 'cursor-pointer bg-[#f7d8d8] text-[#981313] hover:bg-[#efc5c5]'
                  : 'hover:bg-[#e4e4e4]'
              "
              @click="handleAcknowledge(alarm)"
            >
              <TableCell class="text-center font-mono text-sm">{{
                formatTime(alarm.occurredAt)
              }}</TableCell>
              <TableCell class="text-center font-semibold">{{ alarm.area || '全厂' }}</TableCell>
              <TableCell :title="alarm.message">
                <span class="line-clamp-2 leading-4">{{ alarm.message }}</span>
              </TableCell>
              <TableCell class="text-center font-semibold">{{
                isAcknowledged(alarm) ? '已确认' : '未确认'
              }}</TableCell>
            </TableRow>
            <TableRow v-if="alarms.length === 0 && !loadFailed">
              <TableCell colspan="4" class="h-[620px] text-center text-base text-[#666666]">
                所选时间范围内无报警
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <footer class="alarm-pagination flex h-12 shrink-0 items-center justify-between px-4">
        <span class="text-sm text-[#444444]"
          >共 {{ total }} 条，第 {{ currentPage }} / {{ totalPages }} 页</span
        >
        <div class="flex gap-2">
          <WinButton size="icon" title="上一页" :disabled="currentPage <= 1" @click="currentPage--">
            <ChevronLeft class="h-4 w-4" />
          </WinButton>
          <WinButton
            size="icon"
            title="下一页"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
          >
            <ChevronRight class="h-4 w-4" />
          </WinButton>
        </div>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.alarm-view {
  background: #d8d8d8;
}

.alarm-panel {
  border: 1px solid #858585;
  border-radius: 3px;
  background: #eeeeee;
  box-shadow: inset 0 1px 0 #ffffff;
}

.alarm-toolbar,
.alarm-pagination {
  background: linear-gradient(180deg, #dddddd 0%, #c9c9c9 100%);
}

.alarm-toolbar {
  border-bottom: 1px solid #858585;
}

.alarm-pagination {
  border-top: 1px solid #858585;
}

.alarm-error {
  border-bottom: 1px solid #b26767;
  background: #f5d1d1;
  padding: 6px 16px;
  color: #981313;
  font-size: 13px;
  font-weight: 700;
}
</style>
