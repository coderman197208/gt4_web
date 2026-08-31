<script setup lang="ts">
import { ref } from 'vue';
import { toast } from 'vue-sonner';
import type { AlarmEvent } from '@gt4_web/shared';
import { acknowledgeAlarm, getLatestAlarms } from '@/api';
import { useAlarmRefresh } from '@/composables/useAlarmRefresh';

const alarms = ref<AlarmEvent[]>([]);
const loadFailed = ref(false);
const acknowledgingIds = ref(new Set<string>());

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
    alarms.value = await getLatestAlarms();
    loadFailed.value = false;
  } catch {
    loadFailed.value = true;
  }
}

const { requestRefresh } = useAlarmRefresh(loadAlarms);

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
</script>

<template>
  <section class="alarm-summary" aria-label="最新报警">
    <div v-if="loadFailed && alarms.length === 0" class="alarm-status is-error">
      报警数据更新失败
    </div>
    <div v-else-if="alarms.length === 0" class="alarm-status">暂无报警记录</div>
    <template v-else>
      <button
        v-for="alarm in alarms"
        :key="alarm.id"
        type="button"
        class="alarm-row"
        :class="{ 'is-unacknowledged': !alarm.acknowledgedAt && !acknowledgingIds.has(alarm.id) }"
        :disabled="Boolean(alarm.acknowledgedAt) || acknowledgingIds.has(alarm.id)"
        :title="alarm.message"
        @click="handleAcknowledge(alarm)"
      >
        <span class="alarm-time">{{ formatTime(alarm.occurredAt) }}</span>
        <span class="alarm-message">{{ alarm.message }}</span>
      </button>
      <span v-if="loadFailed" class="alarm-error-badge">更新失败</span>
    </template>
  </section>
</template>

<style scoped>
.alarm-summary {
  position: relative;
  display: grid;
  width: min(620px, 40vw);
  height: 44px;
  grid-template-rows: repeat(2, 22px);
  overflow: hidden;
  border: 1px solid #858585;
  border-radius: 2px;
  background: #ececec;
  box-shadow: inset 0 1px 0 #ffffff;
}

.alarm-error-badge {
  position: absolute;
  top: 1px;
  right: 3px;
  background: #ececec;
  color: #9f1111;
  font-size: 10px;
  line-height: 12px;
}

.alarm-row {
  display: grid;
  min-width: 0;
  grid-template-columns: 158px minmax(0, 1fr);
  align-items: center;
  border: 0;
  background: transparent;
  padding: 0 8px;
  color: #333333;
  text-align: left;
}

.alarm-row + .alarm-row {
  border-top: 1px solid #c1c1c1;
}

.alarm-row.is-unacknowledged {
  cursor: pointer;
  background: #f8d7d7;
  color: #9f1111;
  font-weight: 700;
}

.alarm-row:disabled {
  cursor: default;
}

.alarm-time,
.alarm-message,
.alarm-status {
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0;
}

.alarm-time {
  font-variant-numeric: tabular-nums;
}

.alarm-message {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alarm-status {
  display: flex;
  grid-row: 1 / -1;
  align-items: center;
  justify-content: center;
  color: #555555;
}

.alarm-status.is-error {
  color: #9f1111;
}
</style>
