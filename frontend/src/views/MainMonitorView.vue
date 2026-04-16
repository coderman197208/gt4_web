<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { Button } from '@/components/ui/button';
import { ConveyorRoller } from '@/components/ui/conveyor-roller';
import { IndicatorLight } from '@/components/ui/indicator-light';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectSwitch } from '@/components/ui/select-switch';
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
import { useWebSocket } from '@/services/websocket';
import { useRealtimeDataStore } from '@/stores/realtimeData';
import type { SetFeedNumCmd, MoveTubeCmd } from '@gt4_web/shared';

interface TrackRow {
  flowNo: string;
  tubeNo: string;
  orderNo: string;
  itemNo: string;
  rollNo: string;
  meltNo: string;
  lotNo: string;
  length: string;
  lengthOk: boolean;
  weight: string;
  weightOk: boolean;
  meltNoCoupling: string;
  lotNoCoupling: string;
}

interface TubeDetailRow {
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

const trackRows = ref<TrackRow[]>([
  {
    flowNo: '00001',
    tubeNo: 'T240001',
    orderNo: 'A123456789',
    itemNo: '001',
    rollNo: 'RL2301',
    meltNo: '01234567',
    lotNo: '0123456',
    length: '12.06',
    lengthOk: true,
    weight: '2222.88',
    weightOk: true,
    meltNoCoupling: 'C1234567',
    lotNoCoupling: 'C123456',
  },
  {
    flowNo: '00002',
    tubeNo: 'T240002',
    orderNo: 'A123456789',
    itemNo: '001',
    rollNo: 'RL2301',
    meltNo: '01234567',
    lotNo: '0123456',
    length: '12.08',
    lengthOk: true,
    weight: '222.91',
    weightOk: false,
    meltNoCoupling: 'C1234567',
    lotNoCoupling: 'C123456',
  },
  {
    flowNo: '00003',
    tubeNo: 'T240002',
    orderNo: 'A123456789',
    itemNo: '001',
    rollNo: 'RL2301',
    meltNo: '01234567',
    lotNo: '0123456',
    length: '12.08',
    lengthOk: true,
    weight: '222.91',
    weightOk: false,
    meltNoCoupling: 'C1234567',
    lotNoCoupling: 'C123456',
  },
  {
    flowNo: '00004',
    tubeNo: 'T240002',
    orderNo: 'A123456789',
    itemNo: '001',
    rollNo: 'RL2301',
    meltNo: '01234567',
    lotNo: '0123456',
    length: '12.08',
    lengthOk: true,
    weight: '222.91',
    weightOk: false,
    meltNoCoupling: 'C1234567',
    lotNoCoupling: 'C123456',
  },
  {
    flowNo: '00005',
    tubeNo: 'T240002',
    orderNo: 'A123456789',
    itemNo: '001',
    rollNo: 'RL2301',
    meltNo: '01234567',
    lotNo: '0123456',
    length: '12.08',
    lengthOk: true,
    weight: '222.91',
    weightOk: false,
    meltNoCoupling: 'C1234567',
    lotNoCoupling: 'C123456',
  },
  {
    flowNo: '00006',
    tubeNo: 'T240002',
    orderNo: 'A123456789',
    itemNo: '001',
    rollNo: 'RL2301',
    meltNo: '01234567',
    lotNo: '0123456',
    length: '12.08',
    lengthOk: true,
    weight: '222.91',
    weightOk: false,
    meltNoCoupling: 'C1234567',
    lotNoCoupling: 'C123456',
  },
]);

const basketRows = ref<TubeDetailRow[]>([
  {
    flowNo: '0001',
    tubeNo: 'T240001',
    orderNo: 'A123456789',
    itemNo: '001',
    rollNo: 'RL2301',
    meltNo: '01234567',
    lotNo: '0123456',
    length: '12.06',
    weight: '2.88',
    meltNoCoupling: 'C1234567',
    lotNoCoupling: 'C123456',
  },
  {
    flowNo: '0002',
    tubeNo: 'T240002',
    orderNo: 'A123456789',
    itemNo: '001',
    rollNo: 'RL2301',
    meltNo: '01234567',
    lotNo: '0123456',
    length: '12.08',
    weight: '2.91',
    meltNoCoupling: 'C1234567',
    lotNoCoupling: 'C123456',
  },
]);

const bufferRows = ref<TubeDetailRow[]>([
  {
    flowNo: '0011',
    tubeNo: 'T240011',
    flowNoOrg: '0008',
    orderNo: 'A123456789',
    itemNo: '001',
    rollNo: 'RL2302',
    meltNo: '01234568',
    lotNo: '0123457',
    length: '12.10',
    weight: '2.95',
    meltNoCoupling: 'C1234568',
    lotNoCoupling: 'C123457',
  },
]);

const scraptRows = ref<TubeDetailRow[]>([
  {
    flowNo: '0901',
    orderNo: 'A123456789',
    itemNo: '001',
    rollNo: 'RL2299',
    meltNo: '01234560',
    lotNo: '0123450',
    length: '2.40',
    weight: '0.52',
  },
]);

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

// 在组件挂载时订阅tag（subscribe 为全量替换，新页面 mount 时自动覆盖旧订阅，无需 unmount 时清空）
onMounted(() => {
  subscribe(['PlanInfo']);
  console.log('[MainMonitorView] 已订阅 PlanInfo');
});
</script>

<template>
  <div class="main-monitor-view h-full w-full overflow-hidden bg-[#c8c8c8] p-2 text-slate-900">
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
                <span>合同号</span>
                <span class="win-value">{{ mainForm.basketOrderNo }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>炉号</span>
                <span class="win-value">{{ mainForm.basketMeltNo }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>试批号</span>
                <span class="win-value">{{ mainForm.basketLotNo }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>料筐支数</span>
                <span class="win-value">{{ mainForm.feedCount }}</span>
              </div>
              <div class="flex items-center justify-between">
                <Label class="shrink-0 text-base">成捆支数</Label>
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
                @click="handleMoveTube('backbuffer', 'scaptroller')"
                >&gt;</Button
              >
            </div>
            <div class="grid gap-1 mt-4">
              <div class="flex items-center justify-between">
                <span>缓冲区支数</span>
                <span class="win-value">000</span>
              </div>
              <div class="flex items-center justify-between">
                <span>最近管捆号</span>
                <span class="win-value">{{ mainForm.lastBundleNo }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>下一流水号</span>
                <span class="win-value">{{ mainForm.bundleFlowNo }}</span>
              </div>
            </div>
          </div>

          <div class="win-panel flex min-h-0 flex-col">
            <Label class="win-panel__title">废料辊道</Label>
            <div class="-translate-y-1 mt-2">
              <div class="flex flex-col items-center justify-center gap-0.5">
                <Tube :active="processRunning.waste" color="red" :size="60" />
                <ConveyorRoller :active="processRunning.waste" color="amber" :size="60" />
                <IndicatorLight :active="processRunning.waste" color="red" :size="18" />
              </div>
              <div class="mt-4 grid grid-cols-2 gap-2">
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
                  @click="handleMoveTube('scraptroller', 'circle')"
                  >&gt;</Button
                >
              </div>
              <div class="mt-4 grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" class="win-button">入废料筐</Button>
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
                <Tube :active="processRunning.circle" color="blue" :size="60" />
                <ConveyorRoller :active="processRunning.circle" color="blue" :size="60" />
                <IndicatorLight :active="processRunning.circle" color="red" :size="18" />
              </div>
              <div class="mt-4 grid grid-cols-2 gap-2">
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
                  @click="handleMoveTube('circle', 'spray')"
                  >&gt;</Button
                >
              </div>
              <Button size="sm" variant="outline" class="mt-4 w-full win-button">色环</Button>
            </div>
          </div>

          <div class="win-panel flex min-h-0 flex-col">
            <Label class="win-panel__title">喷印</Label>
            <div class="-translate-y-1 mt-2">
              <div class="flex flex-col items-center justify-center gap-0.5">
                <Tube :active="processRunning.spray" color="green" :size="60" />
                <ConveyorRoller :active="processRunning.spray" color="green" :size="60" />
                <IndicatorLight :active="processRunning.spray" color="red" :size="18" />
              </div>
              <div class="mt-4 grid grid-cols-2 gap-2">
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
                  @click="handleMoveTube('spray', 'carve')"
                  >&gt;</Button
                >
              </div>
              <Button size="sm" variant="outline" class="mt-4 w-full win-button">喷印</Button>
            </div>
          </div>

          <div class="win-panel flex min-h-0 flex-col">
            <Label class="win-panel__title">刻印</Label>
            <div class="-translate-y-1 mt-2">
              <div class="flex flex-col items-center justify-center gap-0.5">
                <Tube :active="processRunning.carve" color="green" :size="60" />
                <ConveyorRoller :active="processRunning.carve" color="green" :size="60" />
                <IndicatorLight :active="processRunning.carve" color="red" :size="18" />
              </div>
              <div class="mt-4 grid grid-cols-2 gap-2">
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
                  @click="handleMoveTube('carve', 'weight')"
                  >&gt;</Button
                >
              </div>
              <Button size="sm" variant="outline" class="mt-4 w-full win-button">刻印</Button>
            </div>
          </div>

          <div class="win-panel flex min-h-0 flex-col">
            <Label class="win-panel__title">称重</Label>
            <div class="-translate-y-1 mt-2">
              <div class="flex flex-col items-center justify-center gap-0.5">
                <Tube :active="processRunning.weight" color="green" :size="60" />
                <ConveyorRoller :active="processRunning.weight" color="green" :size="60" />
                <IndicatorLight :active="processRunning.weight" color="red" :size="18" />
              </div>
              <div class="mt-4 grid grid-cols-2 gap-2">
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
                  @click="handleMoveTube('weight', 'align')"
                  >&gt;</Button
                >
              </div>
              <div class="mt-4 grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" class="win-button">称重</Button>
                <Button size="sm" variant="outline" class="win-button">停止称重</Button>
              </div>
            </div>
          </div>

          <div class="win-panel flex min-h-0 flex-col">
            <Label class="win-panel__title">定位</Label>
            <div class="-translate-y-1 mt-2">
              <div class="flex flex-col items-center justify-center gap-0.5">
                <Tube :active="processRunning.length" color="cyan" :size="60" />
                <ConveyorRoller :active="processRunning.length" color="cyan" :size="60" />
                <div class="flex items-center gap-2">
                  <IndicatorLight :active="processRunning.length" color="red" :size="18" />
                  <IndicatorLight :active="true" color="red" :size="18" />
                </div>
              </div>
              <div class="mt-4 grid grid-cols-3 gap-2">
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
              <Button size="sm" variant="outline" class="mt-4 w-full win-button">测长</Button>
            </div>
          </div>

          <div class="win-panel flex min-h-0 flex-col">
            <Label class="win-panel__title">投料区</Label>
            <div class="mt-2 grid flex-1 gap-2 text-xs">
              <div class="flex items-center gap-2">
                <Label class="text-base w-20 text-right">合同号</Label>
                <Input
                  :model-value="realtimeStore.planInfo?.order_no || ''"
                  class="win-input-edit h-7 text-center flex-1"
                  readonly
                />
              </div>
              <div class="flex items-center gap-2">
                <Label class="text-base w-20 text-right">支数</Label>
                <Input
                  :model-value="String(realtimeStore.planInfo?.feed_num ?? '')"
                  class="win-input-edit h-7 text-center flex-1"
                  readonly
                />
              </div>
              <div class="flex items-center gap-2">
                <Label class="text-base w-20 text-right">轧批号</Label>
                <Input
                  :model-value="realtimeStore.planInfo?.roll_no || ''"
                  class="win-input-edit h-7 text-center flex-1"
                  readonly
                />
              </div>
              <div class="flex items-center gap-2">
                <Label class="text-base w-20 text-right">试批号</Label>
                <Input
                  :model-value="realtimeStore.planInfo?.lot_no || ''"
                  class="win-input-edit h-7 text-center flex-1"
                  readonly
                />
              </div>
              <div class="flex items-center gap-2">
                <Label class="text-base w-20 text-right">炉号</Label>
                <Input
                  :model-value="realtimeStore.planInfo?.melt_no || ''"
                  class="win-input-edit h-7 text-center flex-1"
                  readonly
                />
              </div>
              <div class="flex items-center gap-2">
                <Label class="text-base w-20 text-right">下一流水号</Label>
                <Input v-model="mainForm.flowNo" class="win-input-edit h-7 text-center flex-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid min-h-0 grid-cols-[minmax(0,4fr)_minmax(250px,1fr)] gap-2">
        <div class="win-group">
          <div class="win-group__title">测量点料流详细信息</div>
          <div class="win-table-shell h-full min-h-0 overflow-hidden">
            <!-- <div class="win-table-head border-b border-[#8b8b8b]">
              <Table class="table-fixed">
                <colgroup>
                  <col
                    v-for="column in trackTableColumns"
                    :key="`track-head-col-${column.label}`"
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
              </Table>
            </div> -->
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
                <TableRow v-for="row in trackRows" :key="row.flowNo">
                  <TableCell>{{ row.flowNo }}</TableCell>
                  <TableCell>{{ row.tubeNo }}</TableCell>
                  <TableCell>{{ row.orderNo }}</TableCell>
                  <TableCell>{{ row.itemNo }}</TableCell>
                  <TableCell>{{ row.rollNo }}</TableCell>
                  <TableCell>{{ row.meltNo }}</TableCell>
                  <TableCell>{{ row.lotNo }}</TableCell>
                  <TableCell>{{ row.length }}</TableCell>
                  <TableCell>
                    <IndicatorLight
                      :active="row.lengthOk"
                      color="green"
                      off-color="red"
                      :size="16"
                    />
                  </TableCell>
                  <TableCell>{{ row.weight }}</TableCell>
                  <TableCell>
                    <IndicatorLight
                      :active="row.weightOk"
                      color="green"
                      off-color="red"
                      :size="16"
                    />
                  </TableCell>
                  <TableCell>{{ row.meltNoCoupling }}</TableCell>
                  <TableCell>{{ row.lotNoCoupling }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div class="win-group">
          <div class="win-group__title">设备状态</div>
          <div class="flex h-full flex-col gap-3">
            <div class="win-panel flex items-start justify-left gap-2">
              <SelectSwitch :active="stationReady.release" color="green" :size="128" />
              <div class="win-panel flex flex-1 h-full flex-col">
                <div class="grid grid-cols-[120px_1fr] gap-2 items-center justify-items-stretch">
                  <Button
                    size="sm"
                    variant="outline"
                    class="win-button"
                    @click="handleMoveTube('position-release')"
                    >步进梁释放</Button
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

                  <div class="justify-self-center">步进梁原位</div>
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
            </div>

            <div class="win-panel grid grid-cols-2 gap-2 text-sm">
              <div
                v-for="item in stationIndicators"
                :key="item.key"
                class="flex items-center justify-evenly gap-2"
              >
                <span>{{ item.label }}</span>
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
              <TabsTrigger value="buffer" class="win-tab-trigger w-full">缓冲区</TabsTrigger>
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
                    <TableRow v-for="row in basketRows" :key="`basket-${row.flowNo}`">
                      <TableCell>{{ row.flowNo }}</TableCell>
                      <TableCell>{{ row.tubeNo }}</TableCell>
                      <TableCell>{{ row.orderNo }}</TableCell>
                      <TableCell>{{ row.itemNo }}</TableCell>
                      <TableCell>{{ row.rollNo }}</TableCell>
                      <TableCell>{{ row.meltNo }}</TableCell>
                      <TableCell>{{ row.lotNo }}</TableCell>
                      <TableCell>{{ row.length }}</TableCell>
                      <TableCell>{{ row.weight }}</TableCell>
                      <TableCell>{{ row.meltNoCoupling }}</TableCell>
                      <TableCell>{{ row.lotNoCoupling }}</TableCell>
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
                  @click="handleMoveTube('basket-refresh')"
                  >刷新</Button
                >
              </div>
            </TabsContent>

            <TabsContent value="buffer" class="flex min-h-0 flex-1 flex-col gap-3 mt-0">
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
                    <TableRow v-for="row in bufferRows" :key="`buffer-${row.flowNo}`">
                      <TableCell>{{ row.flowNo }}</TableCell>
                      <TableCell>{{ row.tubeNo }}</TableCell>
                      <TableCell>{{ row.orderNo }}</TableCell>
                      <TableCell>{{ row.itemNo }}</TableCell>
                      <TableCell>{{ row.rollNo }}</TableCell>
                      <TableCell>{{ row.meltNo }}</TableCell>
                      <TableCell>{{ row.lotNo }}</TableCell>
                      <TableCell>{{ row.length }}</TableCell>
                      <TableCell>{{ row.weight }}</TableCell>
                      <TableCell>{{ row.meltNoCoupling }}</TableCell>
                      <TableCell>{{ row.lotNoCoupling }}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div class="win-totals flex items-center justify-end gap-6 text-sm font-semibold">
                <span>总重 12.95</span>
                <span>总长 120.118</span>
              </div>
              <div class="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('insert-tube-head')"
                  >插入头部</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('insert-tube')"
                  >插入钢管</Button
                >
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button win-button--danger"
                  @click="handleMoveTube('delete-tube')"
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
                    <TableRow v-for="row in scraptRows" :key="`scrapt-${row.flowNo}`">
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
                <span>总重 0.52</span>
                <span>总长 120.118</span>
              </div>
              <div class="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  class="win-button"
                  @click="handleMoveTube('manual-waste')"
                  >手动入筐</Button
                >
                <Button size="sm" class="win-button" @click="handleMoveTube('bundle-waste')"
                  >废料成筐</Button
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
  background: #c8c8c8;
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
  background: #c8c8c8;
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
