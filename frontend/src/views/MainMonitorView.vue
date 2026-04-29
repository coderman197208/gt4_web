<script setup lang="ts">
import { computed, reactive, ref, onMounted, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { ConveyorRoller } from '@/components/ui/conveyor-roller';
import { IndicatorLight } from '@/components/ui/indicator-light';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tube } from '@/components/ui/tube';
import { TubeBasket } from '@/components/ui/tube-basket';
import SvgToggle from '@/components/custom/svgtoggle/SvgToggle.vue';
import { useWebSocket } from '@/services/websocket';
import { useRealtimeDataStore } from '@/stores/realtimeData';
import type {
  SetFeedNumCmd,
  MoveTubeCmd,
  ModifyTubeCmd,
  DeleteTubeCmd,
  AddTubeCmd,
  TubeInfo,
} from '@gt4_web/shared';

interface TubeTrackRow {
  stationKey: string;
  flowNo: string;
  tubeNo: string;
  orderNo: string;
  itemNo: string;
  rollNo: string;
  meltNo: string;
  lotNo: string;
  length: string;
  lengthOk: boolean;
  showLengthOk: boolean;
  weight: string;
  weightOk: boolean;
  showWeightOk: boolean;
  meltNoCoupling: string;
  lotNoCoupling: string;
  hasTubeInfo: boolean;
}

type EditableTrackField =
  | 'flowNo'
  | 'tubeNo'
  | 'orderNo'
  | 'itemNo'
  | 'rollNo'
  | 'meltNo'
  | 'lotNo'
  | 'length'
  | 'weight'
  | 'meltNoCoupling'
  | 'lotNoCoupling';

type ToggleableTrackField = 'lengthOk' | 'weightOk';

interface TubeDetailRow {
  rowKey?: string;
  hasTubeInfo?: boolean;
  flowNo: string;
  tubeNo?: string;
  flowNoOrg?: string;
  orderNo: string;
  itemNo: string;
  rollNo: string;
  meltNo: string;
  lotNo: string;
  length: string;
  weight: string;
  meltNoCoupling?: string;
  lotNoCoupling?: string;
}

type EditableTubeDetailField =
  | 'flowNo'
  | 'tubeNo'
  | 'orderNo'
  | 'itemNo'
  | 'rollNo'
  | 'meltNo'
  | 'lotNo'
  | 'length'
  | 'weight'
  | 'meltNoCoupling'
  | 'lotNoCoupling';

const { isConnected, error, subscribe, sendUserCommand } = useWebSocket();
const realtimeStore = useRealtimeDataStore();

const mainForm = reactive({
  basketBundleCount: '20',
  orderNo: 'A123456789',
  feedCount: '9',
  feedRollNo: 'RL2301',
  feedLotNo: '0123456',
  feedMeltNo: '01234567',
  flowNo: '1234',
  basketOrderNo: 'A123456789',
  basketMeltNo: '01234567',
  basketLotNo: '0123456',
  lastBundleNo: 'B24030801',
  bundleFlowNo: '0021',
});

const sprayString = ref('A123456789A123456789A123456789A123456789A123456789A123456789A123456789');

const productionStats = reactive({
  statOrderNo: '0123456789',
  statMeltNo: '01234567',
  statLotNo: '0123456',
  orderWeight: '9999.9',
  orderLength: '99999',
  orderCount: '9999',
  orderWeightEng: '99999999',
  orderLengthEng: '99999',
  lotWeight: '9999.9',
  lotLength: '99999',
  lotCount: '9999',
  shiftWeight: '9999.9',
  shiftLength: '99999',
  shiftCount: '9999',
});

const processRunning = reactive({
  circle: true,
  spray: true,
  carve: true,
  weight: true,
  length: true,
  waste: true,
});

const stationReady = reactive({
  release: true,
  innerProtect: true,
  beamHome: true,
  length: true,
  weight: true,
  carve: true,
  spray: true,
  circle: true,
  outfeed: true,
});

const processStatus = reactive({
  sprayProcess: true,
  tagPrint: true,
  tubeTrack: true,
  plcComm: true,
  l3Comm: true,
});

function formatRealtimeValue(value: string | number | null | undefined): string {
  return value == null ? '' : String(value);
}

function toTrackRow(stationKey: string, tubeInfo?: TubeInfo | null): TubeTrackRow {
  const hasTubeInfo = tubeInfo != null;

  return {
    stationKey,
    flowNo: formatRealtimeValue(tubeInfo?.flow_no),
    tubeNo: formatRealtimeValue(tubeInfo?.tube_no),
    orderNo: formatRealtimeValue(tubeInfo?.order_no),
    itemNo: formatRealtimeValue(tubeInfo?.item_no),
    rollNo: formatRealtimeValue(tubeInfo?.roll_no),
    meltNo: formatRealtimeValue(tubeInfo?.melt_no),
    lotNo: formatRealtimeValue(tubeInfo?.lot_no),
    length: formatRealtimeValue(tubeInfo?.length),
    lengthOk: tubeInfo?.length_ok ?? false,
    showLengthOk: hasTubeInfo,
    weight: formatRealtimeValue(tubeInfo?.weight),
    weightOk: tubeInfo?.weight_ok ?? false,
    showWeightOk: hasTubeInfo,
    meltNoCoupling: formatRealtimeValue(tubeInfo?.meltno_coupling),
    lotNoCoupling: formatRealtimeValue(tubeInfo?.lotno_coupling),
    hasTubeInfo,
  };
}

const trackRows = computed<TubeTrackRow[]>(() => [
  toTrackRow('align', realtimeStore.alignPosTubeInfo?.[0]),
  toTrackRow('weight', realtimeStore.weightPosTubeInfo?.[0]),
  toTrackRow('carve', realtimeStore.carvePosTubeInfo?.[0]),
  toTrackRow('spray', realtimeStore.sprayPosTubeInfo?.[0]),
  toTrackRow('circle', realtimeStore.circlePosTubeInfo?.[0]),
  toTrackRow('scraptroller', realtimeStore.scraptrollerPosTubeInfo?.[0]),
]);

const trackRowDrafts = reactive<Record<string, TubeTrackRow>>({});
const trackRowDirtyStates = reactive<Record<string, boolean>>({});

const editableTrackRows = computed(() =>
  trackRows.value.map((row) => ({
    row,
    draft: trackRowDrafts[row.stationKey] ?? row,
  })),
);

function cloneTrackRow(row: TubeTrackRow): TubeTrackRow {
  return { ...row };
}

function syncTrackRowDrafts(rows: TubeTrackRow[]): void {
  const activeStationKeys = new Set(rows.map((row) => row.stationKey));

  for (const row of rows) {
    const existingDraft = trackRowDrafts[row.stationKey];

    if (!existingDraft || !trackRowDirtyStates[row.stationKey] || !row.hasTubeInfo) {
      trackRowDrafts[row.stationKey] = cloneTrackRow(row);
      trackRowDirtyStates[row.stationKey] = false;
      continue;
    }

    existingDraft.lengthOk = row.lengthOk;
    existingDraft.showLengthOk = row.showLengthOk;
    existingDraft.weightOk = row.weightOk;
    existingDraft.showWeightOk = row.showWeightOk;
    existingDraft.hasTubeInfo = row.hasTubeInfo;
  }

  for (const stationKey of Object.keys(trackRowDrafts)) {
    if (!activeStationKeys.has(stationKey)) {
      delete trackRowDrafts[stationKey];
      delete trackRowDirtyStates[stationKey];
    }
  }
}

watch(
  trackRows,
  (rows) => {
    syncTrackRowDrafts(rows);
  },
  { immediate: true },
);

function updateTrackRowDraft(
  stationKey: string,
  field: EditableTrackField,
  value: string | number,
): void {
  const draft = trackRowDrafts[stationKey];
  if (!draft || !draft.hasTubeInfo) {
    return;
  }

  draft[field] = String(value);
  trackRowDirtyStates[stationKey] = true;
}

function resetTrackRowDraft(stationKey: string): void {
  const originalRow = trackRows.value.find((row) => row.stationKey === stationKey);
  if (!originalRow) {
    return;
  }

  trackRowDrafts[stationKey] = cloneTrackRow(originalRow);
  trackRowDirtyStates[stationKey] = false;
}

function handleTrackRowFocusOut(stationKey: string, event: FocusEvent): void {
  const currentRowElement = event.currentTarget as HTMLElement | null;
  const nextFocusedElement = event.relatedTarget as Node | null;

  if (currentRowElement?.contains(nextFocusedElement)) {
    return;
  }

  if (trackRowDirtyStates[stationKey]) {
    resetTrackRowDraft(stationKey);
  }
}

function parseTrackRowNumber(value: string): number {
  const normalizedValue = value.trim();
  if (normalizedValue === '') {
    return 0;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function buildModifyTubeCmd(stationKey: string, draft: TubeTrackRow): ModifyTubeCmd {
  return {
    seq_no: 0,
    position_name: stationKey,
    order_no: draft.orderNo.trim(),
    item_no: draft.itemNo.trim(),
    roll_no: draft.rollNo.trim(),
    melt_no: draft.meltNo.trim(),
    lot_no: draft.lotNo.trim(),
    tube_no: parseTrackRowNumber(draft.tubeNo),
    flow_no: parseTrackRowNumber(draft.flowNo),
    length: parseTrackRowNumber(draft.length),
    weight: parseTrackRowNumber(draft.weight),
    length_ok: draft.lengthOk,
    weight_ok: draft.weightOk,
    lotno_coupling: draft.lotNoCoupling.trim(),
    meltno_coupling: draft.meltNoCoupling.trim(),
  };
}

function submitTrackRowEdit(stationKey: string, event?: KeyboardEvent): void {
  const draft = trackRowDrafts[stationKey];
  if (!draft || !draft.hasTubeInfo) {
    return;
  }

  const cmd = buildModifyTubeCmd(stationKey, draft);

  sendUserCommand('ModifyTubeCmd', cmd);
  trackRowDirtyStates[stationKey] = false;
  const currentInput = event?.target;
  if (currentInput instanceof HTMLInputElement) {
    currentInput.blur();
  }
  console.log('[MainMonitorView] 已发送 ModifyTubeCmd:', cmd);
}

function toggleTrackRowIndicator(stationKey: string, field: ToggleableTrackField): void {
  const draft = trackRowDrafts[stationKey];
  if (!draft || !draft.hasTubeInfo) {
    return;
  }

  const nextDraft = {
    ...draft,
    [field]: !draft[field],
  } as TubeTrackRow;

  const cmd = buildModifyTubeCmd(stationKey, nextDraft);
  sendUserCommand('ModifyTubeCmd', cmd);
  console.log(`[MainMonitorView] 已发送 ${field} 切换后的 ModifyTubeCmd:`, cmd);
}

function toTubeDetailRow(positionName: string, tubeInfo: TubeInfo, index: number): TubeDetailRow {
  return {
    rowKey: `${positionName}-${index}`,
    hasTubeInfo: true,
    flowNo: formatRealtimeValue(tubeInfo.flow_no),
    tubeNo: formatRealtimeValue(tubeInfo.tube_no),
    orderNo: formatRealtimeValue(tubeInfo.order_no),
    itemNo: formatRealtimeValue(tubeInfo.item_no),
    rollNo: formatRealtimeValue(tubeInfo.roll_no),
    meltNo: formatRealtimeValue(tubeInfo.melt_no),
    lotNo: formatRealtimeValue(tubeInfo.lot_no),
    length: formatRealtimeValue(tubeInfo.length),
    weight: formatRealtimeValue(tubeInfo.weight),
    meltNoCoupling: formatRealtimeValue(tubeInfo.meltno_coupling),
    lotNoCoupling: formatRealtimeValue(tubeInfo.lotno_coupling),
  };
}

const basketRows = computed<TubeDetailRow[]>(() =>
  (realtimeStore.basketPosTubeInfo ?? []).map((tubeInfo, index) =>
    toTubeDetailRow('basket', tubeInfo, index),
  ),
);

const backbufferRows = computed<TubeDetailRow[]>(() =>
  (realtimeStore.backbufferPosTubeInfo ?? []).map((tubeInfo, index) =>
    toTubeDetailRow('backbuffer', tubeInfo, index),
  ),
);

const scraptRows = computed<TubeDetailRow[]>(() =>
  (realtimeStore.scrapPosTubeInfo ?? []).map((tubeInfo, index) =>
    toTubeDetailRow('scrap', tubeInfo, index),
  ),
);

const scraptSummary = computed(() => {
  const scrapTubeInfos = realtimeStore.scrapPosTubeInfo ?? [];

  const totalWeight = scrapTubeInfos.reduce(
    (sum, tubeInfo) => sum + (Number.isFinite(tubeInfo.weight) ? tubeInfo.weight : 0),
    0,
  );
  const totalLength = scrapTubeInfos.reduce(
    (sum, tubeInfo) => sum + (Number.isFinite(tubeInfo.length) ? tubeInfo.length : 0),
    0,
  );

  return {
    totalWeight: totalWeight.toFixed(2),
    totalLength: totalLength.toFixed(3),
  };
});

function syncTubeDetailRowDrafts(
  rows: TubeDetailRow[],
  rowDrafts: Record<string, TubeDetailRow>,
  rowDirtyStates: Record<string, boolean>,
): void {
  const activeRowKeys = new Set(
    rows.map((row) => row.rowKey).filter((rowKey): rowKey is string => Boolean(rowKey)),
  );

  for (const row of rows) {
    if (!row.rowKey) {
      continue;
    }

    const existingDraft = rowDrafts[row.rowKey];
    if (!existingDraft || !rowDirtyStates[row.rowKey] || !row.hasTubeInfo) {
      rowDrafts[row.rowKey] = cloneTubeDetailRow(row);
      rowDirtyStates[row.rowKey] = false;
    }
  }

  for (const rowKey of Object.keys(rowDrafts)) {
    if (!activeRowKeys.has(rowKey)) {
      delete rowDrafts[rowKey];
      delete rowDirtyStates[rowKey];
    }
  }
}

function updateTubeDetailRowDraft(
  rowDrafts: Record<string, TubeDetailRow>,
  rowDirtyStates: Record<string, boolean>,
  rowKey: string,
  field: EditableTubeDetailField,
  value: string | number,
): void {
  const draft = rowDrafts[rowKey];
  if (!draft || !draft.hasTubeInfo) {
    return;
  }

  draft[field] = String(value);
  rowDirtyStates[rowKey] = true;
}

function resetTubeDetailRowDraft(
  rows: TubeDetailRow[],
  rowDrafts: Record<string, TubeDetailRow>,
  rowDirtyStates: Record<string, boolean>,
  rowKey: string,
): void {
  const originalRow = rows.find((row) => row.rowKey === rowKey);
  if (!originalRow) {
    return;
  }

  rowDrafts[rowKey] = cloneTubeDetailRow(originalRow);
  rowDirtyStates[rowKey] = false;
}

function handleTubeDetailRowFocusOut(
  rows: TubeDetailRow[],
  rowDrafts: Record<string, TubeDetailRow>,
  rowDirtyStates: Record<string, boolean>,
  rowKey: string,
  event: FocusEvent,
): void {
  const currentRowElement = event.currentTarget as HTMLElement | null;
  const nextFocusedElement = event.relatedTarget as Node | null;

  if (currentRowElement?.contains(nextFocusedElement)) {
    return;
  }

  if (rowDirtyStates[rowKey]) {
    resetTubeDetailRowDraft(rows, rowDrafts, rowDirtyStates, rowKey);
  }
}

function buildTubeDetailModifyTubeCmd(
  positionName: string,
  row: TubeDetailRow,
  seqNo = 0,
): ModifyTubeCmd {
  return {
    seq_no: seqNo,
    position_name: positionName,
    order_no: row.orderNo.trim(),
    item_no: row.itemNo.trim(),
    roll_no: row.rollNo.trim(),
    melt_no: row.meltNo.trim(),
    lot_no: row.lotNo.trim(),
    tube_no: parseTrackRowNumber(row.tubeNo ?? ''),
    flow_no: parseTrackRowNumber(row.flowNo),
    length: parseTrackRowNumber(row.length),
    weight: parseTrackRowNumber(row.weight),
    length_ok: true,
    weight_ok: true,
    lotno_coupling: (row.lotNoCoupling ?? '').trim(),
    meltno_coupling: (row.meltNoCoupling ?? '').trim(),
  };
}

function submitTubeDetailRowEdit(
  positionName: string,
  rowDrafts: Record<string, TubeDetailRow>,
  rowDirtyStates: Record<string, boolean>,
  rowKey: string,
  seqNo = 0,
  event?: KeyboardEvent,
): void {
  const draft = rowDrafts[rowKey];
  if (!draft || !draft.hasTubeInfo) {
    return;
  }

  const cmd = buildTubeDetailModifyTubeCmd(positionName, draft, seqNo);
  sendUserCommand('ModifyTubeCmd', cmd);
  rowDirtyStates[rowKey] = false;
  const currentInput = event?.target;
  if (currentInput instanceof HTMLInputElement) {
    currentInput.blur();
  }
  console.log(`[MainMonitorView] 已发送 ${positionName} ModifyTubeCmd:`, cmd);
}

const basketRowDrafts = reactive<Record<string, TubeDetailRow>>({});
const basketRowDirtyStates = reactive<Record<string, boolean>>({});
const selectedBasketRowIndex = ref<number | null>(null);
const canDeleteBasketRow = computed(
  () => basketRows.value.length > 0 && selectedBasketRowIndex.value != null,
);

const editableBasketRows = computed(() =>
  basketRows.value.map((row) => ({
    row,
    draft: row.rowKey ? (basketRowDrafts[row.rowKey] ?? row) : row,
  })),
);

const backbufferRowDrafts = reactive<Record<string, TubeDetailRow>>({});
const backbufferRowDirtyStates = reactive<Record<string, boolean>>({});
const selectedBackbufferRowIndex = ref<number | null>(null);
const canDeleteBackbufferRow = computed(
  () => backbufferRows.value.length > 0 && selectedBackbufferRowIndex.value != null,
);

const editableBackbufferRows = computed(() =>
  backbufferRows.value.map((row) => ({
    row,
    draft: row.rowKey ? (backbufferRowDrafts[row.rowKey] ?? row) : row,
  })),
);

function cloneTubeDetailRow(row: TubeDetailRow): TubeDetailRow {
  return { ...row };
}

watch(
  basketRows,
  (rows) => {
    syncTubeDetailRowDrafts(rows, basketRowDrafts, basketRowDirtyStates);

    if (
      selectedBasketRowIndex.value != null &&
      (selectedBasketRowIndex.value < 0 || selectedBasketRowIndex.value >= rows.length)
    ) {
      selectedBasketRowIndex.value = null;
    }
  },
  { immediate: true },
);

watch(
  backbufferRows,
  (rows) => {
    syncTubeDetailRowDrafts(rows, backbufferRowDrafts, backbufferRowDirtyStates);

    if (
      selectedBackbufferRowIndex.value != null &&
      (selectedBackbufferRowIndex.value < 0 || selectedBackbufferRowIndex.value >= rows.length)
    ) {
      selectedBackbufferRowIndex.value = null;
    }
  },
  { immediate: true },
);

function selectBasketRow(rowIndex: number): void {
  selectedBasketRowIndex.value = rowIndex;
}

function handleDeleteBasketTube(): void {
  if (!canDeleteBasketRow.value) {
    return;
  }

  const sequenceNo = selectedBasketRowIndex.value;
  if (sequenceNo == null) {
    return;
  }

  handleDeleteTube('basket', sequenceNo);
  selectedBasketRowIndex.value = null;
}

function updateBasketRowDraft(
  rowKey: string,
  field: EditableTubeDetailField,
  value: string | number,
): void {
  updateTubeDetailRowDraft(basketRowDrafts, basketRowDirtyStates, rowKey, field, value);
}

function handleBasketRowFocusOut(rowKey: string, event: FocusEvent): void {
  handleTubeDetailRowFocusOut(
    basketRows.value,
    basketRowDrafts,
    basketRowDirtyStates,
    rowKey,
    event,
  );
}

function submitBasketRowEdit(rowKey: string, seqNo = 0, event?: KeyboardEvent): void {
  submitTubeDetailRowEdit('basket', basketRowDrafts, basketRowDirtyStates, rowKey, seqNo, event);
}

function selectBackbufferRow(rowIndex: number): void {
  selectedBackbufferRowIndex.value = rowIndex;
}

function handleDeleteBackbufferTube(): void {
  if (!canDeleteBackbufferRow.value) {
    return;
  }

  const sequenceNo = selectedBackbufferRowIndex.value;
  if (sequenceNo == null) {
    return;
  }

  handleDeleteTube('backbuffer', sequenceNo);
  selectedBackbufferRowIndex.value = null;
}

function updateBackbufferRowDraft(
  rowKey: string,
  field: EditableTubeDetailField,
  value: string | number,
): void {
  updateTubeDetailRowDraft(backbufferRowDrafts, backbufferRowDirtyStates, rowKey, field, value);
}

function handleBackbufferRowFocusOut(rowKey: string, event: FocusEvent): void {
  handleTubeDetailRowFocusOut(
    backbufferRows.value,
    backbufferRowDrafts,
    backbufferRowDirtyStates,
    rowKey,
    event,
  );
}

function submitBackbufferRowEdit(rowKey: string, seqNo = 0, event?: KeyboardEvent): void {
  submitTubeDetailRowEdit(
    'backbuffer',
    backbufferRowDrafts,
    backbufferRowDirtyStates,
    rowKey,
    seqNo,
    event,
  );
}

function handleAddTubeBackbuffer(position: 'head' | 'tail'): void {
  const seqNo = position === 'head' ? 0 : -1;
  sendUserCommand('AddTubeCmd', {
    seq_no: seqNo,
    position_name: 'backbuffer',
  } as AddTubeCmd);
  console.log(`[MainMonitorView] 已发送 AddTubeCmd: position backbuffer, seq_no ${seqNo}`);
}

function handleClearScrap(): void {
  handleDeleteTube('scrapt', -1);
}

const stationIndicators = [
  { key: 'length', label: '测长' },
  { key: 'weight', label: '称重' },
  { key: 'carve', label: '刻印' },
  { key: 'spray', label: '喷印' },
  { key: 'circle', label: '色环' },
  { key: 'outfeed', label: '出料' },
] as const;

const processStatusCards = [
  { key: 'sprayProcess', label: '喷印称重进程' },
  { key: 'tagPrint', label: '标签打印进程' },
  { key: 'tubeTrack', label: '料流跟踪进程' },
  { key: 'plcComm', label: 'PLC 通讯状态' },
  { key: 'l3Comm', label: 'L3 通讯状态' },
] as const;

const trackTableColumns = [
  { label: '流水号', weight: 1 },
  { label: '管号', weight: 1.1 },
  { label: '合同号', weight: 1.5 },
  { label: '项目号', weight: 0.9 },
  { label: '轧批号', weight: 1 },
  { label: '炉号', weight: 1.1 },
  { label: '试批号', weight: 1.1 },
  { label: '长度', weight: 0.9 },
  { label: '长度合格', weight: 0.9 },
  { label: '重量', weight: 0.9 },
  { label: '重量合格', weight: 0.9 },
  { label: '接箍炉号', weight: 1.2 },
  { label: '接箍批号', weight: 1.2 },
] as const;

const trackTableTotalWeight = trackTableColumns.reduce((total, column) => total + column.weight, 0);

function getTrackTableColumnWidth(weight: number) {
  return `${(weight / trackTableTotalWeight) * 100}%`;
}

// 料筐/缓冲区 11 列定义
const tubeTableColumns = [
  { label: '流水号', weight: 1 },
  { label: '管号', weight: 1.1 },
  { label: '合同号', weight: 1.5 },
  { label: '项目号', weight: 0.9 },
  { label: '轧批号', weight: 1 },
  { label: '炉号', weight: 1.1 },
  { label: '试批号', weight: 1.1 },
  { label: '长度', weight: 0.9 },
  { label: '重量', weight: 0.9 },
  { label: '接箍炉号', weight: 1.0 },
  { label: '接箍批号', weight: 1.0 },
] as const;

const tubeTableTotalWeight = tubeTableColumns.reduce((total, column) => total + column.weight, 0);

function getTubeTableColumnWidth(weight: number) {
  return `${(weight / tubeTableTotalWeight) * 100}%`;
}

// 废料筐 8 列定义
const scraptTableColumns = [
  { label: '流水号', weight: 1 },
  { label: '合同号', weight: 1.5 },
  { label: '项目号', weight: 0.9 },
  { label: '轧批号', weight: 1 },
  { label: '炉号', weight: 1.1 },
  { label: '试批号', weight: 1.1 },
  { label: '长度', weight: 0.9 },
  { label: '重量', weight: 0.9 },
] as const;

const scraptTableTotalWeight = scraptTableColumns.reduce(
  (total, column) => total + column.weight,
  0,
);

function getScraptTableColumnWidth(weight: number) {
  return `${(weight / scraptTableTotalWeight) * 100}%`;
}

function handleMoveTube(from: string, to = '') {
  const cmd: MoveTubeCmd = { from, to };
  sendUserCommand('MoveTubeCmd', cmd);
  console.log(`发送 MoveTubeCmd: from ${from} to ${to}`);
}

function handleDeleteTube(stationKey: string, sequenceNo: number = 0) {
  const cmd: DeleteTubeCmd = {
    seq_no: sequenceNo,
    position_name: stationKey,
  };
  sendUserCommand('DeleteTubeCmd', cmd);
  console.log(`发送 DeleteTubeCmd: position ${stationKey}`);
}

// 在组件挂载时订阅tag（subscribe 为全量替换，新页面 mount 时自动覆盖旧订阅，无需 unmount 时清空）
onMounted(() => {
  subscribe([
    'PlanInfo',
    'ALIGN_POS_TUBE_INFO',
    'WEIGHT_POS_TUBE_INFO',
    'CARVE_POS_TUBE_INFO',
    'SPRAY_POS_TUBE_INFO',
    'CIRCLE_POS_TUBE_INFO',
    'SCRAPTROLLER_POS_TUBE_INFO',
    'SCRAPT_POS_TUBE_INFO',
    'BACKBUFFER_POS_TUBE_INFO',
    'BASKET_POS_TUBE_INFO',
    'ALIGN_POS_ON',
    'WEIGHT_POS_ON',
    'CARVE_POS_ON',
    'SPRAY_POS_ON',
    'CIRCLE_POS_ON',
    'SCRAPTROLLER_POS_ON',
    'LEN_MEA_FINISH',
  ]);
});
</script>

<template>
  <div class="main-monitor-view h-full w-full overflow-hidden bg-[#d8d8d8] p-2 text-slate-900">
    <div class="grid h-full grid-rows-[minmax(0,2.5fr)_minmax(0,2.5fr)_auto_minmax(0,3fr)] gap-4">
      <div class="win-group mt-2">
        <div class="win-group__title">主控信息</div>
        <div
          class="grid h-full min-h-0 grid-cols-[0.9fr_0.9fr_0.9fr_0.9fr_0.9fr_0.9fr_0.9fr_0.9fr_1.3fr] gap-2"
        >
          <div class="win-panel flex min-h-0 flex-col">
            <div class="flex items-center justify-between">
              <Label class="win-panel__title">料筐</Label>
            </div>
            <!-- <div class="flex flex-1 items-center justify-center">
              <TubeBasket active color="cyan" :top-width="72" :bottom-width="98" :height="48" />
            </div> -->
            <div class="grid gap-2">
              <div class="flex items-center justify-between mt-4">
                <span class="font-bold">合同号</span>
                <span class="win-value">{{ mainForm.basketOrderNo }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-bold">炉号</span>
                <span class="win-value">{{ mainForm.basketMeltNo }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-bold">试批号</span>
                <span class="win-value">{{ mainForm.basketLotNo }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-bold">料筐支数</span>
                <span class="win-value">{{ mainForm.feedCount }}</span>
              </div>
              <div class="flex items-center justify-between">
                <Label class="shrink-0 text-base font-bold">成捆支数</Label>
                <Input
                  v-model="mainForm.basketBundleCount"
                  class="win-input-edit h-7 text-right w-20"
                />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" class="win-button">打捆</Button>
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('basket', 'backbuffer')"
                  >&gt;</Button
                >
              </div>
            </div>
          </div>

          <div class="win-panel flex min-h-0 flex-col">
            <Label class="win-panel__title">缓冲区</Label>
            <div class="flex items-start justify-center px-2 pt-4">
              <!-- <svg
                viewBox="0 0 271.666 271.666"
                class="h-28 w-full fill-cyan-500/70 stroke-slate-500"
              >
                <path
                  d="M253.022 136.008v-13.366c0-3.313-2.687-6-6-6h-44.689c-3.313 0-6 2.687-6 6v12.445h-21.946l-9.116-3.67 5.297-11.882c.647-1.454.691-3.105.122-4.591s-1.706-2.685-3.159-3.333l-40.674-18.133c-1.453-.648-3.104-.691-4.591-.123-1.486.569-2.685 1.706-3.333 3.16l-6.141 13.775-11.531-4.642a5.98 5.98 0 0 0-2.24-.434H86.522V91.77c0-3.313-2.687-6-6-6H35.833c-3.313 0-6 2.687-6 6v13.446h-4.429C11.396 105.216 0 116.612 0 130.62s11.396 25.404 25.404 25.404h72.455l73.125 29.438a5.98 5.98 0 0 0 2.24.434h73.037c14.008 0 25.404-11.396 25.404-25.404 0-11.666-7.908-21.515-18.643-24.484Zm-6.76 37.888h-71.875l-73.124-29.438a6.026 6.026 0 0 0-2.241-.434H25.404c-7.392 0-13.404-6.013-13.404-13.404s6.013-13.404 13.404-13.404h72.455l73.125 29.438a5.98 5.98 0 0 0 2.24.434h73.037c7.392 0 13.404 6.013 13.404 13.404s-6.012 13.404-13.403 13.404Z"
                />
              </svg> -->
              <svg
                viewBox="0 85 271.666 100"
                class="h-12 fill-cyan-500/70 stroke-slate-500"
                preserveAspectRatio="xMidYMid meet"
              >
                <path
                  d="M253.022 136.008v-13.366c0-3.313-2.687-6-6-6h-44.689c-3.313 0-6 2.687-6 6v12.445h-21.946l-9.116-3.67 5.297-11.882c.647-1.454.691-3.105.122-4.591s-1.706-2.685-3.159-3.333l-40.674-18.133c-1.453-.648-3.104-.691-4.591-.123-1.486.569-2.685 1.706-3.333 3.16l-6.141 13.775-11.531-4.642a5.98 5.98 0 0 0-2.24-.434H86.522V91.77c0-3.313-2.687-6-6-6H35.833c-3.313 0-6 2.687-6 6v13.446h-4.429C11.396 105.216 0 116.612 0 130.62s11.396 25.404 25.404 25.404h72.455l73.125 29.438a5.98 5.98 0 0 0 2.24.434h73.037c14.008 0 25.404-11.396 25.404-25.404 0-11.666-7.908-21.515-18.643-24.484Zm-6.76 37.888h-71.875l-73.124-29.438a6.026 6.026 0 0 0-2.241-.434H25.404c-7.392 0-13.404-6.013-13.404-13.404s6.013-13.404 13.404-13.404h72.455l73.125 29.438a5.98 5.98 0 0 0 2.24.434h73.037c7.392 0 13.404 6.013 13.404 13.404s-6.012 13.404-13.403 13.404Z"
                />
              </svg>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                class="win-button"
                @click="handleMoveTube('backbuffer', 'basket')"
                >&lt;</Button
              >
              <Button
                size="sm"
                variant="outline"
                class="win-button"
                @click="handleMoveTube('backbuffer', 'scraptroller')"
                >&gt;</Button
              >
            </div>
            <div class="grid gap-1 mt-4">
              <div class="flex items-center justify-between">
                <span class="font-bold">缓冲区支数</span>
                <span class="win-value">000</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-bold">最近管捆号</span>
                <span class="win-value">{{ mainForm.lastBundleNo }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-bold">下一流水号</span>
                <span class="win-value">{{ mainForm.bundleFlowNo }}</span>
              </div>
            </div>
          </div>

          <div class="win-panel flex min-h-0 flex-col">
            <Label class="win-panel__title">废料辊道</Label>
            <div class="-translate-y-1 mt-2">
              <div class="flex flex-col items-center justify-center gap-0.5">
                <Tube
                  :active="(realtimeStore.scraptrollerPosTubeInfo?.length ?? 0) > 0"
                  color="darkCyan"
                  :size="60"
                />
                <ConveyorRoller
                  :active="realtimeStore.scraptrollerPosOn"
                  color="green"
                  :size="60"
                />
                <IndicatorLight
                  :active="processRunning.waste"
                  color="red"
                  :size="18"
                  class="mt-2 invisible"
                />
              </div>
              <div class="mt-4 grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('scraptroller', 'backbuffer')"
                  >&lt;</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleDeleteTube('scraptroller', 0)"
                  >&times;</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('scraptroller', 'circle')"
                  >&gt;</Button
                >
              </div>
              <div class="mt-2 grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('scraptroller', 'scrapt')"
                  >入废料筐</Button
                >
                <TubeBasket
                  :active="false"
                  color="amber"
                  :top-width="56"
                  :bottom-width="82"
                  :height="32"
                />
              </div>
            </div>
          </div>

          <div class="win-panel flex min-h-0 flex-col">
            <Label class="win-panel__title">色环</Label>
            <div class="-translate-y-1 mt-2">
              <div class="flex flex-col items-center justify-center gap-0.5">
                <Tube
                  :active="(realtimeStore.circlePosTubeInfo?.length ?? 0) > 0"
                  color="darkCyan"
                  :size="60"
                />
                <ConveyorRoller :active="realtimeStore.circlePosOn" color="green" :size="60" />
                <IndicatorLight
                  :active="processRunning.circle"
                  color="red"
                  :size="18"
                  class="mt-2 invisible"
                />
              </div>
              <div class="mt-4 grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('circle', 'scraptroller')"
                  >&lt;</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleDeleteTube('circle', 0)"
                  >&times;</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('circle', 'spray')"
                  >&gt;</Button
                >
              </div>
              <Button size="sm" variant="outline" class="mt-2 w-full win-button">色环</Button>
            </div>
          </div>

          <div class="win-panel flex min-h-0 flex-col">
            <Label class="win-panel__title">喷印</Label>
            <div class="-translate-y-1 mt-2">
              <div class="flex flex-col items-center justify-center gap-0.5">
                <Tube
                  :active="(realtimeStore.sprayPosTubeInfo?.length ?? 0) > 0"
                  color="darkCyan"
                  :size="60"
                />
                <ConveyorRoller :active="realtimeStore.sprayPosOn" color="green" :size="60" />
                <div class="flex items-center gap-1 mt-2">
                  <Label class="text-sm font-bold">封锁</Label>
                  <IndicatorLight :active="realtimeStore.lenMeaFinish" color="green" :size="18" />
                  <Label class="text-sm font-bold">测长完成</Label>
                  <IndicatorLight :active="realtimeStore.lenMeaFinish" color="green" :size="18" />
                </div>
              </div>
              <div class="mt-4 grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('spray', 'circle')"
                  >&lt;</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleDeleteTube('spray', 0)"
                  >&times;</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('spray', 'carve')"
                  >&gt;</Button
                >
              </div>
              <Button size="sm" variant="outline" class="mt-2 w-full win-button">喷印</Button>
            </div>
          </div>

          <div class="win-panel flex min-h-0 flex-col">
            <Label class="win-panel__title">刻印</Label>
            <div class="-translate-y-1 mt-2">
              <div class="flex flex-col items-center justify-center gap-0.5">
                <Tube
                  :active="(realtimeStore.carvePosTubeInfo?.length ?? 0) > 0"
                  color="darkCyan"
                  :size="60"
                />
                <ConveyorRoller :active="realtimeStore.carvePosOn" color="green" :size="60" />
                <IndicatorLight color="red" :size="18" class="mt-2 invisible" />
              </div>
              <div class="mt-4 grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('carve', 'spray')"
                  >&lt;</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleDeleteTube('carve', 0)"
                  >&times;</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('carve', 'weight')"
                  >&gt;</Button
                >
              </div>
              <Button size="sm" variant="outline" class="mt-2 w-full win-button">刻印</Button>
            </div>
          </div>

          <div class="win-panel flex min-h-0 flex-col">
            <Label class="win-panel__title">称重</Label>
            <div class="-translate-y-1 mt-2">
              <div class="flex flex-col items-center justify-center gap-0.5">
                <Tube
                  :active="(realtimeStore.weightPosTubeInfo?.length ?? 0) > 0"
                  color="darkCyan"
                  :size="60"
                />
                <ConveyorRoller :active="realtimeStore.weightPosOn" color="green" :size="60" />
                <div class="flex items-center gap-2 mt-2">
                  <Label class="text-sm font-bold">工位封锁</Label>
                  <IndicatorLight :active="realtimeStore.weightPosOn" color="red" :size="18" />
                </div>
              </div>
              <div class="mt-4 grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('weight', 'carve')"
                  >&lt;</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleDeleteTube('weight', 0)"
                  >&times;</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('weight', 'align')"
                  >&gt;</Button
                >
              </div>
              <div class="mt-2 grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" class="win-button">称重</Button>
                <Button size="sm" variant="outline" class="win-button">停止称重</Button>
              </div>
            </div>
          </div>

          <div class="win-panel flex min-h-0 flex-col">
            <Label class="win-panel__title">定位</Label>
            <div class="-translate-y-1 mt-2">
              <div class="flex flex-col items-center justify-center gap-0.5">
                <Tube
                  :active="(realtimeStore.alignPosTubeInfo?.length ?? 0) > 0"
                  color="darkCyan"
                  :size="60"
                />
                <ConveyorRoller :active="realtimeStore.alignPosOn" color="green" :size="60" />
                <IndicatorLight color="red" :size="18" class="mt-2 invisible" />
              </div>
              <div class="mt-4 grid grid-cols-4 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('align', 'weight')"
                  >&lt;</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleDeleteTube('align', 0)"
                  >&times;</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('align', 'plan')"
                  >&gt;</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('plan', 'align')"
                  >上料</Button
                >
              </div>
              <Button size="sm" variant="outline" class="mt-2 w-full win-button">测长</Button>
            </div>
          </div>

          <div class="win-panel flex min-h-0 flex-col">
            <Label class="win-panel__title">投料区</Label>
            <div class="mt-2 grid flex-1 gap-2 text-xs">
              <div class="flex items-center gap-2">
                <Label class="text-base w-22 text-right font-bold">合同号</Label>
                <Input
                  :model-value="realtimeStore.planInfo?.order_no || ''"
                  class="win-input-edit h-7 text-center flex-1"
                  readonly
                />
              </div>
              <div class="flex items-center gap-2">
                <Label class="text-base w-22 text-right font-bold">支数</Label>
                <Input
                  :model-value="String(realtimeStore.planInfo?.feed_num ?? '')"
                  class="win-input-edit h-7 text-center flex-1"
                  readonly
                />
              </div>
              <div class="flex items-center gap-2">
                <Label class="text-base w-22 text-right font-bold">轧批号</Label>
                <Input
                  :model-value="realtimeStore.planInfo?.roll_no || ''"
                  class="win-input-edit h-7 text-center flex-1"
                  readonly
                />
              </div>
              <div class="flex items-center gap-2">
                <Label class="text-base w-22 text-right font-bold">试批号</Label>
                <Input
                  :model-value="realtimeStore.planInfo?.lot_no || ''"
                  class="win-input-edit h-7 text-center flex-1"
                  readonly
                />
              </div>
              <div class="flex items-center gap-2">
                <Label class="text-base w-22 text-right font-bold">炉号</Label>
                <Input
                  :model-value="realtimeStore.planInfo?.melt_no || ''"
                  class="win-input-edit h-7 text-center flex-1"
                  readonly
                />
              </div>
              <div class="flex items-center gap-2">
                <Label class="text-base w-22 text-right font-bold">下一流水号</Label>
                <Input v-model="mainForm.flowNo" class="win-input-edit h-7 text-center flex-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid min-h-0 grid-cols-[minmax(0,4fr)_minmax(250px,1fr)] gap-2">
        <div class="win-group">
          <div class="win-group__title">测量点料流详细信息</div>
          <div class="flex min-w-0">
            <div class="grid w-[40px] shrink-0 grid-cols-1 pt-[30px]">
              <div class="flex h-9 items-center text-sm font-bold">定位</div>
              <div class="flex h-9 items-center text-sm font-bold">称重</div>
              <div class="flex h-9 items-center text-sm font-bold">刻印</div>
              <div class="flex h-9 items-center text-sm font-bold">喷印</div>
              <div class="flex h-9 items-center text-sm font-bold">色环</div>
              <div class="flex h-9 items-center text-sm font-bold">出废</div>
            </div>
            <div class="win-table-shell h-full min-h-0 min-w-0 flex-1 overflow-hidden">
              <Table class="table-fixed">
                <colgroup>
                  <col
                    v-for="column in trackTableColumns"
                    :key="`track-body-col-${column.label}`"
                    :style="{ width: getTrackTableColumnWidth(column.weight) }"
                  />
                </colgroup>
                <TableHeader>
                  <TableRow>
                    <TableHead v-for="column in trackTableColumns" :key="column.label">
                      {{ column.label }}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody class="[&_tr]:h-9">
                  <TableRow
                    v-for="editableRow in editableTrackRows"
                    :key="editableRow.row.stationKey"
                    @focusout="handleTrackRowFocusOut(editableRow.row.stationKey, $event)"
                  >
                    <TableCell>
                      <Input
                        v-if="editableRow.row.hasTubeInfo"
                        :model-value="editableRow.draft.flowNo"
                        class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                        @update:model-value="
                          updateTrackRowDraft(editableRow.row.stationKey, 'flowNo', $event)
                        "
                        @keydown.enter.prevent="
                          submitTrackRowEdit(editableRow.row.stationKey, $event)
                        "
                      />
                      <span v-else>{{ editableRow.row.flowNo }}</span>
                    </TableCell>
                    <TableCell>
                      <Input
                        v-if="editableRow.row.hasTubeInfo"
                        :model-value="editableRow.draft.tubeNo"
                        class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                        @update:model-value="
                          updateTrackRowDraft(editableRow.row.stationKey, 'tubeNo', $event)
                        "
                        @keydown.enter.prevent="
                          submitTrackRowEdit(editableRow.row.stationKey, $event)
                        "
                      />
                      <span v-else>{{ editableRow.row.tubeNo }}</span>
                    </TableCell>
                    <TableCell>
                      <Input
                        v-if="editableRow.row.hasTubeInfo"
                        :model-value="editableRow.draft.orderNo"
                        class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                        @update:model-value="
                          updateTrackRowDraft(editableRow.row.stationKey, 'orderNo', $event)
                        "
                        @keydown.enter.prevent="
                          submitTrackRowEdit(editableRow.row.stationKey, $event)
                        "
                      />
                      <span v-else>{{ editableRow.row.orderNo }}</span>
                    </TableCell>
                    <TableCell>
                      <Input
                        v-if="editableRow.row.hasTubeInfo"
                        :model-value="editableRow.draft.itemNo"
                        class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                        @update:model-value="
                          updateTrackRowDraft(editableRow.row.stationKey, 'itemNo', $event)
                        "
                        @keydown.enter.prevent="
                          submitTrackRowEdit(editableRow.row.stationKey, $event)
                        "
                      />
                      <span v-else>{{ editableRow.row.itemNo }}</span>
                    </TableCell>
                    <TableCell>
                      <Input
                        v-if="editableRow.row.hasTubeInfo"
                        :model-value="editableRow.draft.rollNo"
                        class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                        @update:model-value="
                          updateTrackRowDraft(editableRow.row.stationKey, 'rollNo', $event)
                        "
                        @keydown.enter.prevent="
                          submitTrackRowEdit(editableRow.row.stationKey, $event)
                        "
                      />
                      <span v-else>{{ editableRow.row.rollNo }}</span>
                    </TableCell>
                    <TableCell>
                      <Input
                        v-if="editableRow.row.hasTubeInfo"
                        :model-value="editableRow.draft.meltNo"
                        class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                        @update:model-value="
                          updateTrackRowDraft(editableRow.row.stationKey, 'meltNo', $event)
                        "
                        @keydown.enter.prevent="
                          submitTrackRowEdit(editableRow.row.stationKey, $event)
                        "
                      />
                      <span v-else>{{ editableRow.row.meltNo }}</span>
                    </TableCell>
                    <TableCell>
                      <Input
                        v-if="editableRow.row.hasTubeInfo"
                        :model-value="editableRow.draft.lotNo"
                        class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                        @update:model-value="
                          updateTrackRowDraft(editableRow.row.stationKey, 'lotNo', $event)
                        "
                        @keydown.enter.prevent="
                          submitTrackRowEdit(editableRow.row.stationKey, $event)
                        "
                      />
                      <span v-else>{{ editableRow.row.lotNo }}</span>
                    </TableCell>
                    <TableCell>
                      <Input
                        v-if="editableRow.row.hasTubeInfo"
                        :model-value="editableRow.draft.length"
                        class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                        @update:model-value="
                          updateTrackRowDraft(editableRow.row.stationKey, 'length', $event)
                        "
                        @keydown.enter.prevent="
                          submitTrackRowEdit(editableRow.row.stationKey, $event)
                        "
                      />
                      <span v-else>{{ editableRow.row.length }}</span>
                    </TableCell>
                    <TableCell>
                      <IndicatorLight
                        :active="editableRow.draft.lengthOk"
                        color="green"
                        off-color="red"
                        :class="{
                          invisible: !editableRow.draft.showLengthOk,
                          'cursor-pointer': editableRow.row.hasTubeInfo,
                        }"
                        :size="16"
                        @click="toggleTrackRowIndicator(editableRow.row.stationKey, 'lengthOk')"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        v-if="editableRow.row.hasTubeInfo"
                        :model-value="editableRow.draft.weight"
                        class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                        @update:model-value="
                          updateTrackRowDraft(editableRow.row.stationKey, 'weight', $event)
                        "
                        @keydown.enter.prevent="
                          submitTrackRowEdit(editableRow.row.stationKey, $event)
                        "
                      />
                      <span v-else>{{ editableRow.row.weight }}</span>
                    </TableCell>
                    <TableCell>
                      <IndicatorLight
                        :active="editableRow.draft.weightOk"
                        color="green"
                        off-color="red"
                        :class="{
                          invisible: !editableRow.draft.showWeightOk,
                          'cursor-pointer': editableRow.row.hasTubeInfo,
                        }"
                        :size="16"
                        @click="toggleTrackRowIndicator(editableRow.row.stationKey, 'weightOk')"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        v-if="editableRow.row.hasTubeInfo"
                        :model-value="editableRow.draft.meltNoCoupling"
                        class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                        @update:model-value="
                          updateTrackRowDraft(editableRow.row.stationKey, 'meltNoCoupling', $event)
                        "
                        @keydown.enter.prevent="
                          submitTrackRowEdit(editableRow.row.stationKey, $event)
                        "
                      />
                      <span v-else>{{ editableRow.row.meltNoCoupling }}</span>
                    </TableCell>
                    <TableCell>
                      <Input
                        v-if="editableRow.row.hasTubeInfo"
                        :model-value="editableRow.draft.lotNoCoupling"
                        class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                        @update:model-value="
                          updateTrackRowDraft(editableRow.row.stationKey, 'lotNoCoupling', $event)
                        "
                        @keydown.enter.prevent="
                          submitTrackRowEdit(editableRow.row.stationKey, $event)
                        "
                      />
                      <span v-else>{{ editableRow.row.lotNoCoupling }}</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div class="win-group">
          <div class="win-group__title">设备状态</div>
          <div class="flex h-full gap-3">
            <div class="win-panel flex flex-1 items-start justify-left gap-2">
              <div class="grid grid-cols-[120px_1fr] gap-4 items-center mt-2 w-full">
                <SvgToggle :model-value="stationReady.release" :width="120" :height="30" />
                <div class="justify-self-center font-bold">L1信号状态</div>

                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('position-release')"
                  >L2所有工位释放</Button
                >
                <div class="justify-self-center">
                  <IndicatorLight
                    :active="stationReady.release"
                    color="green"
                    :size="20"
                    class="translate-y-[2px]"
                  />
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('position-release')"
                  >内保步进梁释放</Button
                >
                <div class="justify-self-center">
                  <IndicatorLight
                    :active="stationReady.release"
                    color="green"
                    :size="20"
                    class="translate-y-[2px]"
                  />
                </div>

                <div class="justify-self-center">
                  <Label class="text-sm font-bold">步进梁原位指示</Label>
                </div>
                <div class="justify-self-center">
                  <IndicatorLight
                    :active="stationReady.beamHome"
                    color="green"
                    :size="20"
                    class="translate-y-[2px]"
                  />
                </div>
              </div>
            </div>

            <div class="win-panel grid gap-2 text-sm w-[100px]">
              <div
                v-for="item in stationIndicators"
                :key="item.key"
                class="flex items-center justify-evenly gap-2"
              >
                <span class="font-bold">{{ item.label }}</span>
                <IndicatorLight :active="stationReady[item.key]" color="green" :size="18" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="win-group">
        <div class="win-group__title">喷印字符串</div>
        <div class="px-3 py-2 font-mono text-lg font-bold text-slate-800">
          {{ sprayString }}
        </div>
      </div>

      <div class="grid min-h-0 grid-cols-[minmax(0,3.4fr)_minmax(420px,2fr)] gap-2">
        <div class="win-group">
          <div class="win-group__title">管子详细信息</div>
          <Tabs default-value="basket" class="flex h-full min-h-0 flex-row gap-3">
            <TabsList class="win-tabs-list flex flex-col justify-start gap-1 w-20 shrink-0">
              <TabsTrigger value="basket" class="win-tab-trigger w-full">料筐</TabsTrigger>
              <TabsTrigger value="backbuffer" class="win-tab-trigger w-full">缓冲区</TabsTrigger>
              <TabsTrigger value="scrapt" class="win-tab-trigger w-full">废料筐</TabsTrigger>
            </TabsList>

            <TabsContent value="basket" class="flex min-h-0 flex-1 flex-col gap-3 mt-0">
              <div class="win-table-shell min-h-0 flex-1 overflow-y-auto">
                <Table class="table-fixed">
                  <colgroup>
                    <col
                      v-for="column in tubeTableColumns"
                      :key="`basket-col-${column.label}`"
                      :style="{ width: getTubeTableColumnWidth(column.weight) }"
                    />
                  </colgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead v-for="column in tubeTableColumns" :key="column.label">{{
                        column.label
                      }}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow
                      v-for="(editableRow, rowIndex) in editableBasketRows"
                      :key="editableRow.row.rowKey"
                      :class="{
                        'win-table-row--selected': selectedBasketRowIndex === rowIndex,
                      }"
                      @click="selectBasketRow(rowIndex)"
                      @focusout="
                        editableRow.row.rowKey &&
                        handleBasketRowFocusOut(editableRow.row.rowKey, $event)
                      "
                    >
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.flowNo"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBasketRowDraft(editableRow.row.rowKey, 'flowNo', $event)
                          "
                          @keydown.enter.prevent="
                            submitBasketRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.flowNo }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.tubeNo"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBasketRowDraft(editableRow.row.rowKey, 'tubeNo', $event)
                          "
                          @keydown.enter.prevent="
                            submitBasketRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.tubeNo }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.orderNo"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBasketRowDraft(editableRow.row.rowKey, 'orderNo', $event)
                          "
                          @keydown.enter.prevent="
                            submitBasketRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.orderNo }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.itemNo"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBasketRowDraft(editableRow.row.rowKey, 'itemNo', $event)
                          "
                          @keydown.enter.prevent="
                            submitBasketRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.itemNo }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.rollNo"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBasketRowDraft(editableRow.row.rowKey, 'rollNo', $event)
                          "
                          @keydown.enter.prevent="
                            submitBasketRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.rollNo }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.meltNo"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBasketRowDraft(editableRow.row.rowKey, 'meltNo', $event)
                          "
                          @keydown.enter.prevent="
                            submitBasketRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.meltNo }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.lotNo"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBasketRowDraft(editableRow.row.rowKey, 'lotNo', $event)
                          "
                          @keydown.enter.prevent="
                            submitBasketRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.lotNo }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.length"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBasketRowDraft(editableRow.row.rowKey, 'length', $event)
                          "
                          @keydown.enter.prevent="
                            submitBasketRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.length }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.weight"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBasketRowDraft(editableRow.row.rowKey, 'weight', $event)
                          "
                          @keydown.enter.prevent="
                            submitBasketRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.weight }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.meltNoCoupling"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBasketRowDraft(editableRow.row.rowKey, 'meltNoCoupling', $event)
                          "
                          @keydown.enter.prevent="
                            submitBasketRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.meltNoCoupling }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.lotNoCoupling"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBasketRowDraft(editableRow.row.rowKey, 'lotNoCoupling', $event)
                          "
                          @keydown.enter.prevent="
                            submitBasketRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.lotNoCoupling }}</span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div class="win-totals flex items-center justify-end gap-6 text-sm font-semibold">
                <span>总重 28.88</span>
                <span>总长 120.118</span>
              </div>
              <div class="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleAddTubeBackbuffer('head')"
                  >头部新增</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleAddTubeBackbuffer('tail')"
                  >尾部新增</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button win-button--danger"
                  :disabled="!canDeleteBasketRow"
                  @click="handleDeleteBasketTube()"
                  >删除钢管</Button
                >
              </div>
            </TabsContent>

            <TabsContent value="backbuffer" class="flex min-h-0 flex-1 flex-col gap-3 mt-0">
              <div class="win-table-shell min-h-0 flex-1 overflow-y-auto">
                <Table class="table-fixed">
                  <colgroup>
                    <col
                      v-for="column in tubeTableColumns"
                      :key="`buffer-col-${column.label}`"
                      :style="{ width: getTubeTableColumnWidth(column.weight) }"
                    />
                  </colgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead v-for="column in tubeTableColumns" :key="column.label">{{
                        column.label
                      }}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow
                      v-for="(editableRow, rowIndex) in editableBackbufferRows"
                      :key="editableRow.row.rowKey"
                      :class="{
                        'win-table-row--selected': selectedBackbufferRowIndex === rowIndex,
                      }"
                      @click="selectBackbufferRow(rowIndex)"
                      @focusout="
                        editableRow.row.rowKey &&
                        handleBackbufferRowFocusOut(editableRow.row.rowKey, $event)
                      "
                    >
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.flowNo"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBackbufferRowDraft(editableRow.row.rowKey, 'flowNo', $event)
                          "
                          @keydown.enter.prevent="
                            submitBackbufferRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.flowNo }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.tubeNo"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBackbufferRowDraft(editableRow.row.rowKey, 'tubeNo', $event)
                          "
                          @keydown.enter.prevent="
                            submitBackbufferRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.tubeNo }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.orderNo"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBackbufferRowDraft(editableRow.row.rowKey, 'orderNo', $event)
                          "
                          @keydown.enter.prevent="
                            submitBackbufferRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.orderNo }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.itemNo"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBackbufferRowDraft(editableRow.row.rowKey, 'itemNo', $event)
                          "
                          @keydown.enter.prevent="
                            submitBackbufferRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.itemNo }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.rollNo"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBackbufferRowDraft(editableRow.row.rowKey, 'rollNo', $event)
                          "
                          @keydown.enter.prevent="
                            submitBackbufferRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.rollNo }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.meltNo"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBackbufferRowDraft(editableRow.row.rowKey, 'meltNo', $event)
                          "
                          @keydown.enter.prevent="
                            submitBackbufferRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.meltNo }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.lotNo"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBackbufferRowDraft(editableRow.row.rowKey, 'lotNo', $event)
                          "
                          @keydown.enter.prevent="
                            submitBackbufferRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.lotNo }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.length"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBackbufferRowDraft(editableRow.row.rowKey, 'length', $event)
                          "
                          @keydown.enter.prevent="
                            submitBackbufferRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.length }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.weight"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBackbufferRowDraft(editableRow.row.rowKey, 'weight', $event)
                          "
                          @keydown.enter.prevent="
                            submitBackbufferRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.weight }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.meltNoCoupling"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBackbufferRowDraft(
                              editableRow.row.rowKey,
                              'meltNoCoupling',
                              $event,
                            )
                          "
                          @keydown.enter.prevent="
                            submitBackbufferRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.meltNoCoupling }}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          v-if="editableRow.row.hasTubeInfo && editableRow.row.rowKey"
                          :model-value="editableRow.draft.lotNoCoupling"
                          class="h-7 min-w-0 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                          @update:model-value="
                            updateBackbufferRowDraft(
                              editableRow.row.rowKey,
                              'lotNoCoupling',
                              $event,
                            )
                          "
                          @keydown.enter.prevent="
                            submitBackbufferRowEdit(editableRow.row.rowKey, rowIndex, $event)
                          "
                        />
                        <span v-else>{{ editableRow.row.lotNoCoupling }}</span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div class="win-totals flex items-center justify-end gap-6 text-sm font-semibold">
                <span>总重 12.95</span>
                <span>总长 120.118</span>
              </div>
              <div class="flex items-center justify-end gap-2">
                <Button size="sm" variant="outline" class="win-button">插入头部</Button>
                <Button size="sm" variant="outline" class="win-button">插入钢管</Button>
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button win-button--danger"
                  :disabled="!canDeleteBackbufferRow"
                  @click="handleDeleteBackbufferTube()"
                  >删除钢管</Button
                >
              </div>
            </TabsContent>

            <TabsContent value="scrapt" class="flex min-h-0 flex-1 flex-col gap-3 mt-0">
              <div class="win-table-shell min-h-0 flex-1 overflow-y-auto">
                <Table class="table-fixed">
                  <colgroup>
                    <col
                      v-for="column in scraptTableColumns"
                      :key="`scrapt-col-${column.label}`"
                      :style="{ width: getScraptTableColumnWidth(column.weight) }"
                    />
                  </colgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead v-for="column in scraptTableColumns" :key="column.label">{{
                        column.label
                      }}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="row in scraptRows" :key="row.rowKey ?? `scrapt-${row.flowNo}`">
                      <TableCell>{{ row.flowNo }}</TableCell>
                      <TableCell>{{ row.orderNo }}</TableCell>
                      <TableCell>{{ row.itemNo }}</TableCell>
                      <TableCell>{{ row.rollNo }}</TableCell>
                      <TableCell>{{ row.meltNo }}</TableCell>
                      <TableCell>{{ row.lotNo }}</TableCell>
                      <TableCell>{{ row.length }}</TableCell>
                      <TableCell>{{ row.weight }}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div class="win-totals flex items-center justify-end gap-6 text-sm font-semibold">
                <span>总重 {{ scraptSummary.totalWeight }}</span>
                <span>总长 {{ scraptSummary.totalLength }}</span>
              </div>
              <div class="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button win-button--danger"
                  @click="handleClearScrap()"
                  >清空</Button
                >
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div class="grid min-h-0 grid-rows-[minmax(0,1.8fr)_minmax(0,1fr)] gap-4">
          <div class="win-group">
            <div class="win-group__title">生产统计信息</div>
            <div class="flex h-full flex-col gap-2">
              <div class="mb-2 flex items-center gap-4 text-s font-semibold text-[#1d47a4]">
                <span>合同号 {{ productionStats.statOrderNo }}</span>
                <span>炉号 {{ productionStats.statMeltNo }}</span>
                <span>试批号 {{ productionStats.statLotNo }}</span>
              </div>

              <div class="grid grid-cols-[150px_1fr_1fr_1fr] gap-3">
                <Label class="text-sm font-bold">当前合同已完成</Label>
                <div class="flex items-center gap-2">
                  <Input
                    v-model="productionStats.orderWeight"
                    class="win-input-readonly h-7 text-right"
                  />
                  <Label class="shrink-0 whitespace-nowrap text-xs">吨</Label>
                </div>
                <div class="flex items-center gap-2">
                  <Input
                    v-model="productionStats.orderLength"
                    class="win-input-readonly h-7 text-right"
                  />
                  <Label class="shrink-0 whitespace-nowrap text-xs">米</Label>
                </div>
                <div class="flex items-center gap-2">
                  <Input
                    v-model="productionStats.orderCount"
                    readonly
                    class="win-input-readonly h-7 text-right"
                  />
                  <Label class="shrink-0 whitespace-nowrap text-xs">支</Label>
                </div>
              </div>

              <div class="grid grid-cols-[150px_1fr_1fr_1fr] gap-3">
                <Label class="text-sm font-bold"></Label>
                <div class="flex items-center gap-2">
                  <Input
                    v-model="productionStats.orderWeightEng"
                    readonly
                    class="win-input-readonly h-7 text-right"
                  />
                  <Label class="shrink-0 whitespace-nowrap text-xs">磅</Label>
                </div>
                <div class="flex items-center gap-2">
                  <Input
                    v-model="productionStats.orderLengthEng"
                    readonly
                    class="win-input-readonly h-7 text-right"
                  />
                  <Label class="shrink-0 whitespace-nowrap text-xs">英尺</Label>
                </div>
                <Label class="text-xs font-bold"></Label>
              </div>

              <div class="grid grid-cols-[150px_1fr_1fr_1fr] gap-3">
                <Label class="text-sm font-bold">当前炉批已完成</Label>
                <div class="flex items-center gap-2">
                  <Input
                    v-model="productionStats.lotWeight"
                    readonly
                    class="win-input-readonly h-7 text-right"
                  />
                  <Label class="shrink-0 whitespace-nowrap text-xs">吨</Label>
                </div>
                <div class="flex items-center gap-2">
                  <Input
                    v-model="productionStats.lotLength"
                    readonly
                    class="win-input-readonly h-7 text-right"
                  />
                  <Label class="shrink-0 whitespace-nowrap text-xs">米</Label>
                </div>
                <div class="flex items-center gap-2">
                  <Input
                    v-model="productionStats.lotCount"
                    readonly
                    class="win-input-readonly h-7 text-right"
                  />
                  <Label class="shrink-0 whitespace-nowrap text-xs">支</Label>
                </div>
              </div>
              <!-- </div> -->

              <div class="grid grid-cols-[150px_1fr_1fr_1fr] gap-3">
                <Label class="text-sm font-bold">班产量</Label>
                <div class="flex items-center gap-2">
                  <Input
                    v-model="productionStats.shiftWeight"
                    readonly
                    class="win-input-readonly h-7 text-right"
                  />
                  <Label class="shrink-0 whitespace-nowrap text-xs">吨</Label>
                </div>
                <div class="flex items-center gap-2">
                  <Input
                    v-model="productionStats.shiftLength"
                    readonly
                    class="win-input-readonly h-7 text-right"
                  />
                  <Label class="shrink-0 whitespace-nowrap text-xs">米</Label>
                </div>
                <div class="flex items-center gap-2">
                  <Input
                    v-model="productionStats.shiftCount"
                    readonly
                    class="win-input-readonly h-7 text-right"
                  />
                  <Label class="shrink-0 whitespace-nowrap text-xs">支</Label>
                </div>
              </div>
            </div>
          </div>

          <div class="win-group">
            <div class="win-group__title">进程工作状态</div>
            <div class="grid h-full grid-cols-5 gap-2">
              <div
                v-for="item in processStatusCards"
                :key="item.key"
                class="win-process-item flex flex-col items-center justify-between text-center"
              >
                <IndicatorLight
                  :active="processStatus[item.key]"
                  color="green"
                  off-color="red"
                  :size="20"
                />
                <span class="text-xs font-bold leading-4 text-slate-800">{{ item.label }}</span>
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube(item.key)"
                  >启动</Button
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-monitor-view {
  background: #d8d8d8;
  font-family: SimSun, NSimSun, 'Microsoft YaHei', serif;
}

.win-group {
  position: relative;
  min-height: 0;
  border: 1px solid #868686;
  border-radius: 3px;
  background: #d3d3d3;
  padding: 14px 8px 8px;
  box-shadow: inset 0 1px 0 #f7f7f7;
}

.win-group__title {
  position: absolute;
  top: -11px;
  left: 12px;
  padding: 0 6px;
  background: #d8d8d8;
  color: #6f1616;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
}

.win-panel,
.win-stat-block,
.win-status-row,
.win-spray-string {
  border: 1px solid #8a8a8a;
  border-radius: 2px;
  background: #d8d8d8;
  box-shadow: inset 0 1px 0 #f4f4f4;
}

.win-panel {
  padding: 8px;
}

.win-panel__title {
  color: #111827;
  font-size: 15px;
  font-weight: 700;
}

.win-value {
  color: #1d47a4;
  font-weight: 700;
}

.win-input-edit,
.win-input-readonly {
  border-radius: 2px;
  font-size: 16px;
  font-weight: 700;
  box-shadow: none;
}

.win-input-edit {
  border-color: #4a7471;
  background: #20b2aa;
  color: #111827;
}

.win-input-readonly {
  border-color: #8b8b8b;
  background: #c0c0c0;
  color: #1d47a4;
}

.win-button {
  border-color: #8a8a8a;
  border-radius: 2px;
  background: linear-gradient(to bottom, #ffffff, #d9d9d9);
  color: #111827;
  font-size: 12px;
  font-weight: 700;
  box-shadow: none;
}

.win-button:hover {
  background: linear-gradient(to bottom, #ffffff, #cecece);
}

.win-button--danger {
  color: #8b0000;
}

.win-status-row {
  padding: 6px 8px;
}

.win-spray-string {
  background: #c0c0c0;
  color: #3f3f46;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 14px;
  font-weight: 700;
}

.win-table-shell {
  border: 1px solid #8a8a8a;
  background: #c0c0c0;
}

.win-table-head {
  background: #dcdcdc;
}

.win-table-shell :deep(table) {
  width: 100%;
}

.win-table-shell :deep(th) {
  position: sticky;
  top: 0;
  z-index: 1;
  height: 30px;
  border-right: 1px solid #8a8a8a;
  padding: 4px 8px;
  background: #dcdcdc;
  color: #1d47a4;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
}

.win-table-shell :deep(td) {
  border-right: 1px solid #9d9d9d;
  border-bottom: 1px solid #9d9d9d;
  padding: 4px 8px;
  color: #262626;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
}

.win-table-shell :deep(th:last-child),
.win-table-shell :deep(td:last-child) {
  border-right: 0;
}

.win-table-shell :deep(tbody tr:nth-child(odd) td) {
  background: #ececec;
}

.win-table-shell :deep(tbody tr:nth-child(even) td) {
  background: #d7d7d7;
}

.win-table-shell :deep(.win-table-row--selected td) {
  background: #9fc5ff !important;
}

.win-tabs-list {
  gap: 0;
  border-bottom: 1px solid #8a8a8a;
  border-radius: 0;
  background: transparent;
  padding: 0;
}

:deep(.win-tab-trigger) {
  height: 32px !important;
  flex: none !important;
  border: 1px solid #8a8a8a;
  border-bottom: 0;
  border-radius: 2px 2px 0 0;
  background: #d0d0d0;
  color: #333;
  font-size: 12px;
  font-weight: 700;
}

:deep(.win-tab-trigger[data-state='active']) {
  background: #ededed;
  color: #6f1616;
}

.win-totals {
  color: #1d47a4;
}

.win-process-item {
  gap: 6px;
  padding: 4px 0;
}
</style>
