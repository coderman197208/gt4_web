import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type {
  AckAlarmRequest,
  AlarmDetailResponse,
  AlarmListItem,
  AlarmListQueryParams,
  AlarmSeverity,
  AlarmSnapshotPayload,
  AlarmSummary,
  AlarmSummaryPayload,
  AlarmUpsertPayload,
  UserAlarmAreaContext,
} from '@gt4_web/shared';
import { ackAlarm, getAlarmDetail, getAlarms, getAlarmSummary, getMyAlarmAreas } from '@/api/alarm';

function createEmptySummary(): AlarmSummary {
  return {
    server_time: '',
    total_active: 0,
    total_unacked: 0,
    highest_severity: null,
    by_severity: {
      critical: 0,
      major: 0,
      minor: 0,
      warning: 0,
      info: 0,
    },
    by_area: [],
  };
}

function buildAreaIdsParam(areaIds: number[]): string | undefined {
  return areaIds.length > 0 ? areaIds.join(',') : undefined;
}

function compareAlarmSeverity(left: AlarmSeverity, right: AlarmSeverity): number {
  const order: AlarmSeverity[] = ['critical', 'major', 'minor', 'warning', 'info'];
  return order.indexOf(left) - order.indexOf(right);
}

function sortAlarmList(items: AlarmListItem[]) {
  return [...items].sort((left, right) => {
    const severityDiff = compareAlarmSeverity(left.severity, right.severity);
    if (severityDiff !== 0) {
      return severityDiff;
    }

    return new Date(right.last_occurred_at).getTime() - new Date(left.last_occurred_at).getTime();
  });
}

function upsertAlarm(items: AlarmListItem[], nextItem: AlarmListItem) {
  const nextItems = [...items];
  const targetIndex = nextItems.findIndex((item) => item.id === nextItem.id);

  if (targetIndex >= 0) {
    nextItems.splice(targetIndex, 1, nextItem);
  } else {
    nextItems.unshift(nextItem);
  }

  return sortAlarmList(nextItems);
}

function removeAlarm(items: AlarmListItem[], alarmId: number) {
  return items.filter((item) => item.id !== alarmId);
}

export const useAlarmCenterStore = defineStore('alarmCenter', () => {
  const areaContext = ref<UserAlarmAreaContext | null>(null);
  const summary = ref<AlarmSummary>(createEmptySummary());
  const activeList = ref<AlarmListItem[]>([]);
  const historyList = ref<AlarmListItem[]>([]);
  const selectedAlarmId = ref<number | null>(null);
  const selectedAlarmDetail = ref<AlarmDetailResponse | null>(null);
  const selectedAreaIds = ref<number[]>([]);
  const keyword = ref('');
  const severityFilters = ref<AlarmSeverity[]>([]);
  const activePage = ref(1);
  const historyPage = ref(1);
  const pageSize = ref(20);
  const activeTotal = ref(0);
  const historyTotal = ref(0);
  const ackPendingIds = ref<number[]>([]);
  const isInitialized = ref(false);
  const isInitializing = ref(false);
  const isLoadingActive = ref(false);
  const isLoadingHistory = ref(false);
  const isLoadingDetail = ref(false);
  const lastResyncReason = ref<string | null>(null);

  const totalUnacked = computed(() => summary.value.total_unacked);
  const hasMultipleAreas = computed(() => (areaContext.value?.areas.length ?? 0) > 1);

  function buildListQuery(scope: 'active' | 'history'): AlarmListQueryParams {
    return {
      scope,
      area_ids: buildAreaIdsParam(selectedAreaIds.value),
      severity: severityFilters.value.length > 0 ? severityFilters.value.join(',') : undefined,
      keyword: keyword.value.trim() || undefined,
      page: scope === 'active' ? activePage.value : historyPage.value,
      page_size: pageSize.value,
    };
  }

  function ensureSelectedAreaIds() {
    if (!areaContext.value) {
      selectedAreaIds.value = [];
      return;
    }

    const visibleAreaIds = areaContext.value.areas.map((area) => area.area_id);
    selectedAreaIds.value = selectedAreaIds.value.filter((areaId) =>
      visibleAreaIds.includes(areaId),
    );
  }

  async function loadAreaContext() {
    areaContext.value = await getMyAlarmAreas();
    ensureSelectedAreaIds();
  }

  async function loadSummary() {
    summary.value = await getAlarmSummary({
      area_ids: buildAreaIdsParam(selectedAreaIds.value),
    });
  }

  async function loadActiveList() {
    isLoadingActive.value = true;

    try {
      const response = await getAlarms(buildListQuery('active'));
      activeList.value = sortAlarmList(response.items);
      activeTotal.value = response.total;
    } finally {
      isLoadingActive.value = false;
    }
  }

  async function loadHistoryList() {
    isLoadingHistory.value = true;

    try {
      const response = await getAlarms(buildListQuery('history'));
      historyList.value = sortAlarmList(response.items);
      historyTotal.value = response.total;
    } finally {
      isLoadingHistory.value = false;
    }
  }

  async function loadAlarmDetailById(alarmId: number) {
    selectedAlarmId.value = alarmId;
    isLoadingDetail.value = true;

    try {
      selectedAlarmDetail.value = await getAlarmDetail(alarmId);
    } finally {
      isLoadingDetail.value = false;
    }
  }

  async function initialize(force = false) {
    if (isInitializing.value) {
      return;
    }

    if (isInitialized.value && !force) {
      return;
    }

    isInitializing.value = true;

    try {
      await loadAreaContext();
      await Promise.all([loadSummary(), loadActiveList()]);

      if (selectedAlarmId.value) {
        await loadAlarmDetailById(selectedAlarmId.value);
      }

      isInitialized.value = true;
      lastResyncReason.value = null;
    } finally {
      isInitializing.value = false;
    }
  }

  async function refreshHistory() {
    await loadHistoryList();
  }

  async function resync() {
    await Promise.all([loadSummary(), loadActiveList(), loadHistoryList()]);

    if (selectedAlarmId.value) {
      await loadAlarmDetailById(selectedAlarmId.value);
    }

    lastResyncReason.value = null;
  }

  function setAreaFilter(areaIds: number[]) {
    selectedAreaIds.value = areaIds;
    activePage.value = 1;
    historyPage.value = 1;
  }

  function setKeyword(value: string) {
    keyword.value = value;
    activePage.value = 1;
    historyPage.value = 1;
  }

  function setSeverityFilters(value: AlarmSeverity[]) {
    severityFilters.value = value;
    activePage.value = 1;
    historyPage.value = 1;
  }

  function applySnapshot(payload: AlarmSnapshotPayload) {
    summary.value = {
      ...summary.value,
      server_time: payload.server_time,
      total_active: payload.summary.total_active,
      total_unacked: payload.summary.total_unacked,
      highest_severity: payload.summary.highest_severity,
    };
    activeList.value = sortAlarmList(payload.active_items);
    activeTotal.value = payload.active_items.length;
    lastResyncReason.value = null;
  }

  function applySummary(payload: AlarmSummaryPayload) {
    summary.value = payload;
    lastResyncReason.value = null;
  }

  function applyUpsert(payload: AlarmUpsertPayload) {
    const { alarm } = payload;

    if (alarm.condition_state === 'active') {
      activeList.value = upsertAlarm(activeList.value, alarm);
    } else {
      activeList.value = removeAlarm(activeList.value, alarm.id);
    }

    if (alarm.condition_state === 'cleared') {
      historyList.value = upsertAlarm(historyList.value, alarm);
    } else {
      historyList.value = removeAlarm(historyList.value, alarm.id);
    }

    if (selectedAlarmDetail.value && selectedAlarmDetail.value.alarm.id === alarm.id) {
      selectedAlarmDetail.value = {
        ...selectedAlarmDetail.value,
        alarm: {
          ...selectedAlarmDetail.value.alarm,
          ...alarm,
        },
      };
    }
  }

  function markResyncRequired(reason: string) {
    lastResyncReason.value = reason;
  }

  function isAckPending(alarmId: number) {
    return ackPendingIds.value.includes(alarmId);
  }

  async function ackSelectedAlarm(operatorNote?: string) {
    if (!selectedAlarmDetail.value || isAckPending(selectedAlarmDetail.value.alarm.id)) {
      return;
    }

    const alarmId = selectedAlarmDetail.value.alarm.id;
    ackPendingIds.value = [...ackPendingIds.value, alarmId];

    try {
      const payload: AckAlarmRequest = {
        expected_version: selectedAlarmDetail.value.alarm.version,
        operator_note: operatorNote?.trim() || undefined,
      };

      await ackAlarm(alarmId, payload);
      await Promise.all([
        loadSummary(),
        loadActiveList(),
        loadHistoryList(),
        loadAlarmDetailById(alarmId),
      ]);
    } catch (error) {
      const responseStatus =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'status' in error.response
          ? error.response.status
          : undefined;

      if (responseStatus === 409) {
        await Promise.all([
          loadSummary(),
          loadActiveList(),
          loadHistoryList(),
          loadAlarmDetailById(alarmId),
        ]);
      }

      throw error;
    } finally {
      ackPendingIds.value = ackPendingIds.value.filter((id) => id !== alarmId);
    }
  }

  function reset() {
    areaContext.value = null;
    summary.value = createEmptySummary();
    activeList.value = [];
    historyList.value = [];
    selectedAlarmId.value = null;
    selectedAlarmDetail.value = null;
    selectedAreaIds.value = [];
    keyword.value = '';
    severityFilters.value = [];
    activePage.value = 1;
    historyPage.value = 1;
    activeTotal.value = 0;
    historyTotal.value = 0;
    ackPendingIds.value = [];
    isInitialized.value = false;
    lastResyncReason.value = null;
  }

  return {
    areaContext,
    summary,
    activeList,
    historyList,
    selectedAlarmId,
    selectedAlarmDetail,
    selectedAreaIds,
    keyword,
    severityFilters,
    activePage,
    historyPage,
    pageSize,
    activeTotal,
    historyTotal,
    isInitialized,
    isInitializing,
    isLoadingActive,
    isLoadingHistory,
    isLoadingDetail,
    lastResyncReason,
    totalUnacked,
    hasMultipleAreas,
    initialize,
    loadAreaContext,
    loadSummary,
    loadActiveList,
    loadHistoryList,
    refreshHistory,
    loadAlarmDetailById,
    setAreaFilter,
    setKeyword,
    setSeverityFilters,
    applySnapshot,
    applySummary,
    applyUpsert,
    markResyncRequired,
    ackSelectedAlarm,
    isAckPending,
    resync,
    reset,
  };
});
