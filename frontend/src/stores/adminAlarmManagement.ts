import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type {
  AlarmArea,
  AlarmBatchAckResponse,
  AlarmDetailResponse,
  AlarmListItem,
  AlarmListScope,
  AlarmManagementUserDirectoryItem,
  AlarmSeverity,
  AlarmSummary,
  ManagedUserAlarmAreaContext,
} from '@gt4_web/shared';
import {
  batchAckAlarms,
  getAlarmAreas,
  getAlarmDetail,
  getAlarmManagementUsers,
  getAlarms,
  getAlarmSummary,
  getManagedUserAlarmAreas,
  saveManagedUserAlarmAreas,
} from '@/api/alarm';

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

function compareNumberArrays(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

export const useAdminAlarmManagementStore = defineStore('adminAlarmManagement', () => {
  const mode = ref<'history' | 'user-areas'>('history');
  const visibleAreas = ref<AlarmArea[]>([]);
  const selectedAreaIds = ref<number[]>([]);
  const keyword = ref('');
  const severityFilters = ref<AlarmSeverity[]>([]);
  const listScope = ref<AlarmListScope>('all');
  const page = ref(1);
  const pageSize = ref(20);
  const summary = ref<AlarmSummary>(createEmptySummary());
  const listItems = ref<AlarmListItem[]>([]);
  const total = ref(0);
  const selectedAlarmId = ref<number | null>(null);
  const selectedAlarmDetail = ref<AlarmDetailResponse | null>(null);
  const batchAckNote = ref('');
  const lastBatchAckResult = ref<AlarmBatchAckResponse | null>(null);
  const directoryUsers = ref<AlarmManagementUserDirectoryItem[]>([]);
  const selectedManagedUserId = ref<number | null>(null);
  const managedUserContext = ref<ManagedUserAlarmAreaContext | null>(null);
  const draftAreaIds = ref<number[]>([]);
  const draftDefaultAreaId = ref<number | null>(null);
  const isInitializing = ref(false);
  const isLoadingAreas = ref(false);
  const isLoadingSummary = ref(false);
  const isLoadingList = ref(false);
  const isLoadingDetail = ref(false);
  const isLoadingDirectory = ref(false);
  const isLoadingManagedContext = ref(false);
  const isSubmittingBatchAck = ref(false);
  const isSavingManagedAreas = ref(false);

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));
  const currentBatchAckItems = computed(() =>
    listItems.value
      .filter((item) => item.ack_state === 'unacked')
      .map((item) => ({
        alarm_id: item.id,
        expected_version: item.version,
      })),
  );
  const hasBatchAckTargets = computed(() => currentBatchAckItems.value.length > 0);
  const selectedManagedUser = computed(
    () => directoryUsers.value.find((user) => user.id === selectedManagedUserId.value) ?? null,
  );
  const hasManagedAreaChanges = computed(() => {
    if (!managedUserContext.value) {
      return false;
    }

    const currentAreaIds = managedUserContext.value.areas
      .map((area) => area.area_id)
      .slice()
      .sort((left, right) => left - right);
    const nextAreaIds = draftAreaIds.value.slice().sort((left, right) => left - right);

    return (
      managedUserContext.value.default_area_id !== draftDefaultAreaId.value ||
      !compareNumberArrays(currentAreaIds, nextAreaIds)
    );
  });
  const canSaveManagedAreas = computed(
    () =>
      selectedManagedUserId.value !== null &&
      draftAreaIds.value.length > 0 &&
      draftDefaultAreaId.value !== null &&
      hasManagedAreaChanges.value &&
      !isSavingManagedAreas.value,
  );

  function sortAreaIds(areaIds: number[]) {
    const areaOrder = new Map(visibleAreas.value.map((area, index) => [area.id, index]));
    return [...new Set(areaIds)].sort(
      (left, right) => (areaOrder.get(left) ?? 999) - (areaOrder.get(right) ?? 999),
    );
  }

  function buildListQuery() {
    return {
      scope: listScope.value,
      area_ids: buildAreaIdsParam(selectedAreaIds.value),
      severity: severityFilters.value.length > 0 ? severityFilters.value.join(',') : undefined,
      keyword: keyword.value.trim() || undefined,
      page: page.value,
      page_size: pageSize.value,
    };
  }

  function syncSelectedAlarmWithList(nextItems: AlarmListItem[]) {
    if (nextItems.length === 0) {
      selectedAlarmId.value = null;
      selectedAlarmDetail.value = null;
      return;
    }

    if (selectedAlarmId.value && nextItems.some((item) => item.id === selectedAlarmId.value)) {
      return;
    }

    selectedAlarmId.value = nextItems[0]?.id ?? null;
  }

  function applyManagedContext(context: ManagedUserAlarmAreaContext) {
    managedUserContext.value = context;
    draftAreaIds.value = sortAreaIds(context.areas.map((area) => area.area_id));
    draftDefaultAreaId.value =
      context.default_area_id || draftAreaIds.value[0] || context.areas[0]?.area_id || null;
  }

  async function loadVisibleAreas() {
    isLoadingAreas.value = true;

    try {
      visibleAreas.value = await getAlarmAreas();
      selectedAreaIds.value = selectedAreaIds.value.filter((areaId) =>
        visibleAreas.value.some((area) => area.id === areaId),
      );
      draftAreaIds.value = draftAreaIds.value.filter((areaId) =>
        visibleAreas.value.some((area) => area.id === areaId),
      );
    } finally {
      isLoadingAreas.value = false;
    }
  }

  async function loadSummary() {
    isLoadingSummary.value = true;

    try {
      summary.value = await getAlarmSummary({
        area_ids: buildAreaIdsParam(selectedAreaIds.value),
      });
    } finally {
      isLoadingSummary.value = false;
    }
  }

  async function loadList() {
    isLoadingList.value = true;

    try {
      const response = await getAlarms(buildListQuery());
      const nextTotalPages = Math.max(1, Math.ceil(response.total / pageSize.value));

      if (response.total > 0 && page.value > nextTotalPages) {
        page.value = nextTotalPages;
        await loadList();
        return;
      }

      listItems.value = response.items;
      total.value = response.total;
      syncSelectedAlarmWithList(response.items);
    } finally {
      isLoadingList.value = false;
    }
  }

  async function loadSelectedAlarmDetail() {
    if (!selectedAlarmId.value) {
      selectedAlarmDetail.value = null;
      return;
    }

    isLoadingDetail.value = true;

    try {
      selectedAlarmDetail.value = await getAlarmDetail(selectedAlarmId.value);
    } catch {
      selectedAlarmDetail.value = null;
    } finally {
      isLoadingDetail.value = false;
    }
  }

  async function loadDirectoryUsers() {
    isLoadingDirectory.value = true;

    try {
      directoryUsers.value = await getAlarmManagementUsers();

      if (directoryUsers.value.length === 0) {
        selectedManagedUserId.value = null;
        managedUserContext.value = null;
        draftAreaIds.value = [];
        draftDefaultAreaId.value = null;
        return;
      }

      if (!directoryUsers.value.some((user) => user.id === selectedManagedUserId.value)) {
        selectedManagedUserId.value = directoryUsers.value[0]?.id ?? null;
      }

      if (selectedManagedUserId.value) {
        await loadManagedUserAreaContext(selectedManagedUserId.value);
      }
    } finally {
      isLoadingDirectory.value = false;
    }
  }

  async function loadManagedUserAreaContext(userId = selectedManagedUserId.value) {
    if (!userId) {
      managedUserContext.value = null;
      draftAreaIds.value = [];
      draftDefaultAreaId.value = null;
      return;
    }

    isLoadingManagedContext.value = true;

    try {
      applyManagedContext(await getManagedUserAlarmAreas(userId));
    } finally {
      isLoadingManagedContext.value = false;
    }
  }

  async function initialize(force = false) {
    if (isInitializing.value && !force) {
      return;
    }

    isInitializing.value = true;

    try {
      await Promise.all([loadVisibleAreas(), loadSummary(), loadDirectoryUsers()]);
      await loadList();
      await loadSelectedAlarmDetail();
    } finally {
      isInitializing.value = false;
    }
  }

  async function refreshHistory() {
    await Promise.all([loadSummary(), loadList()]);
    await loadSelectedAlarmDetail();
  }

  function setMode(nextMode: 'history' | 'user-areas') {
    mode.value = nextMode;
  }

  function setScope(nextScope: AlarmListScope) {
    listScope.value = nextScope;
    page.value = 1;
  }

  function setKeyword(nextKeyword: string) {
    keyword.value = nextKeyword;
    page.value = 1;
  }

  function toggleSeverityFilter(severity: AlarmSeverity) {
    severityFilters.value = severityFilters.value.includes(severity)
      ? severityFilters.value.filter((item) => item !== severity)
      : [...severityFilters.value, severity];
    page.value = 1;
  }

  function toggleAreaFilter(areaId: number) {
    selectedAreaIds.value = selectedAreaIds.value.includes(areaId)
      ? selectedAreaIds.value.filter((item) => item !== areaId)
      : sortAreaIds([...selectedAreaIds.value, areaId]);
    page.value = 1;
  }

  function clearAreaFilters() {
    selectedAreaIds.value = [];
    page.value = 1;
  }

  function setPage(nextPage: number) {
    page.value = Math.min(Math.max(1, nextPage), totalPages.value);
  }

  async function selectAlarm(alarmId: number) {
    selectedAlarmId.value = alarmId;
    await loadSelectedAlarmDetail();
  }

  async function submitBatchAck() {
    if (currentBatchAckItems.value.length === 0) {
      return null;
    }

    isSubmittingBatchAck.value = true;

    try {
      const response = await batchAckAlarms({
        operator_note: batchAckNote.value.trim() || undefined,
        items: currentBatchAckItems.value,
      });

      lastBatchAckResult.value = response;
      batchAckNote.value = '';
      await refreshHistory();
      return response;
    } finally {
      isSubmittingBatchAck.value = false;
    }
  }

  async function selectManagedUser(userId: number) {
    if (selectedManagedUserId.value === userId && managedUserContext.value) {
      return;
    }

    selectedManagedUserId.value = userId;
    await loadManagedUserAreaContext(userId);
  }

  function toggleManagedArea(areaId: number) {
    const nextAreaIds = draftAreaIds.value.includes(areaId)
      ? draftAreaIds.value.filter((item) => item !== areaId)
      : [...draftAreaIds.value, areaId];

    draftAreaIds.value = sortAreaIds(nextAreaIds);

    if (!draftAreaIds.value.includes(draftDefaultAreaId.value ?? -1)) {
      draftDefaultAreaId.value = draftAreaIds.value[0] ?? null;
    }
  }

  function setManagedDefaultArea(areaId: number) {
    if (!draftAreaIds.value.includes(areaId)) {
      return;
    }

    draftDefaultAreaId.value = areaId;
  }

  async function saveManagedAreas() {
    if (
      !selectedManagedUserId.value ||
      !draftDefaultAreaId.value ||
      draftAreaIds.value.length === 0
    ) {
      return null;
    }

    isSavingManagedAreas.value = true;

    try {
      await saveManagedUserAlarmAreas(selectedManagedUserId.value, {
        default_area_id: draftDefaultAreaId.value,
        area_ids: draftAreaIds.value,
      });

      await loadManagedUserAreaContext(selectedManagedUserId.value);
      return managedUserContext.value;
    } finally {
      isSavingManagedAreas.value = false;
    }
  }

  return {
    mode,
    visibleAreas,
    selectedAreaIds,
    keyword,
    severityFilters,
    listScope,
    page,
    pageSize,
    summary,
    listItems,
    total,
    totalPages,
    selectedAlarmId,
    selectedAlarmDetail,
    batchAckNote,
    lastBatchAckResult,
    currentBatchAckItems,
    hasBatchAckTargets,
    directoryUsers,
    selectedManagedUserId,
    selectedManagedUser,
    managedUserContext,
    draftAreaIds,
    draftDefaultAreaId,
    hasManagedAreaChanges,
    canSaveManagedAreas,
    isInitializing,
    isLoadingAreas,
    isLoadingSummary,
    isLoadingList,
    isLoadingDetail,
    isLoadingDirectory,
    isLoadingManagedContext,
    isSubmittingBatchAck,
    isSavingManagedAreas,
    initialize,
    refreshHistory,
    setMode,
    setScope,
    setKeyword,
    toggleSeverityFilter,
    toggleAreaFilter,
    clearAreaFilters,
    setPage,
    selectAlarm,
    submitBatchAck,
    selectManagedUser,
    toggleManagedArea,
    setManagedDefaultArea,
    saveManagedAreas,
  };
});
