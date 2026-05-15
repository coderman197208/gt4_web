<template>
  <div class="flex h-full w-full flex-col overflow-hidden">
    <div class="flex-shrink-0 space-y-2 p-3">
      <div class="relative rounded-lg border p-4">
        <div class="flex items-center gap-4">
          <Label class="whitespace-nowrap">查询日期</Label>
          <Input v-model="queryState.queryDate" type="date" class="w-40" />
          <Label class="whitespace-nowrap">管捆号</Label>
          <Input v-model="queryState.bundleNo" type="text" class="w-40" />
          <Button variant="outline" :disabled="isLoadingQuery" @click="handleQuery">
            {{ isLoadingQuery ? '查询中...' : '执行查询' }}
          </Button>
          <Label class="whitespace-nowrap">合同号</Label>
          <Input v-model="queryState.orderNo" type="text" class="w-40" />
          <Label class="whitespace-nowrap">项目号</Label>
          <Input v-model="queryState.itemNo" type="text" class="w-20" />
          <Button variant="outline" @click="handleCreateDraft"> 新增 </Button>
          <Button variant="outline" @click="handleDeleteBundle"> 删除 </Button>
          <Button variant="outline" :disabled="isSaving" @click="handleSave">
            {{ isSaving ? '保存中...' : '保存' }}
          </Button>
          <Button variant="outline" @click="handlePrintTag"> 标签打印 </Button>
        </div>
      </div>
      <div v-if="statusMessage" class="px-1 text-sm text-muted-foreground">
        {{ statusMessage }}
      </div>
    </div>

    <div class="flex flex-1 gap-3 overflow-hidden p-3 pt-0">
      <div class="flex w-[560px] flex-shrink-0 flex-col pt-4">
        <div class="relative flex flex-1 flex-col rounded-lg border p-4">
          <div class="absolute -top-3 left-4 bg-white px-2 text-sm font-bold text-[1rem]">
            管捆列表
          </div>
          <div class="border-b">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[120px]"> 合同号 </TableHead>
                  <TableHead class="w-[60px]"> 项目号 </TableHead>
                  <TableHead class="w-[80px]"> 管捆号 </TableHead>
                  <TableHead class="w-[80px]"> 轧批号 </TableHead>
                  <TableHead class="w-[80px]"> 炉号 </TableHead>
                  <TableHead class="w-[80px]"> 试批号 </TableHead>
                  <TableHead class="w-[50px]"> 发送标记 </TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>
          <div class="flex-1 overflow-y-auto">
            <Table>
              <TableBody>
                <TableRow
                  v-for="(row, index) in bundleResults"
                  :key="`${row.order_no}-${row.item_no}-${row.bundle_no}`"
                  :class="{ 'bg-accent': selectedBundleIndex === index }"
                  class="cursor-pointer"
                  @click="selectBundle(row, index)"
                >
                  <TableCell class="w-[120px]">
                    {{ row.order_no }}
                  </TableCell>
                  <TableCell class="w-[60px]">
                    {{ row.item_no }}
                  </TableCell>
                  <TableCell class="w-[80px]">
                    {{ row.bundle_no }}
                  </TableCell>
                  <TableCell class="w-[80px]">
                    {{ row.roll_no }}
                  </TableCell>
                  <TableCell class="w-[80px]">
                    {{ row.melt_no }}
                  </TableCell>
                  <TableCell class="w-[80px]">
                    {{ row.lot_no }}
                  </TableCell>
                  <TableCell class="w-[50px]">
                    {{ row.send_flag }}
                  </TableCell>
                </TableRow>
                <TableRow v-if="bundleResults.length === 0">
                  <TableCell colspan="7" class="h-20 text-center text-sm text-muted-foreground">
                    暂无查询结果
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div class="flex flex-1 flex-col pt-4">
        <div class="relative flex flex-1 flex-col rounded-lg border p-4">
          <div class="absolute -top-3 left-4 bg-white px-2 text-sm font-bold text-[1rem]">
            管捆信息
          </div>

          <template v-if="draftBundle">
            <div class="my-3 grid grid-cols-6 gap-3">
              <div class="space-y-1">
                <Label class="text-xs">合同号</Label>
                <Input :model-value="draftBundle.order_no" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">项目号</Label>
                <Input :model-value="draftBundle.item_no" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">管捆号</Label>
                <Input
                  v-model="draftBundle.bundle_no"
                  data-bundle-no-input="true"
                  :class="duplicateMessage ? 'border-destructive' : ''"
                />
                <p v-if="duplicateMessage" class="text-xs text-destructive">
                  {{ duplicateMessage }}
                </p>
              </div>
              <div class="space-y-1">
                <Label class="text-xs">轧批号</Label>
                <Input :model-value="draftBundle.roll_no ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">炉号</Label>
                <Input v-model="draftBundle.melt_no" />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">试批号</Label>
                <Input v-model="draftBundle.lot_no" />
              </div>
            </div>

            <div class="mb-3 grid grid-cols-6 gap-3">
              <div class="space-y-1">
                <Label class="text-xs">外径</Label>
                <Input :model-value="draftBundle.diameter ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">壁厚</Label>
                <Input :model-value="draftBundle.wall_thickness ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">最短</Label>
                <Input :model-value="draftBundle.length_from ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">最长</Label>
                <Input :model-value="draftBundle.length_to ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">根数</Label>
                <Input :model-value="draftBundle.tube ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">最后流水号</Label>
                <Input :model-value="draftBundle.last_flow_no ?? ''" readonly />
              </div>
            </div>

            <div class="mb-3 grid grid-cols-6 gap-3">
              <div class="space-y-1">
                <Label class="text-xs">生产日期</Label>
                <Input v-model="draftUi.produceDate" type="date" />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">生产时间</Label>
                <Input v-model="draftUi.produceClock" type="time" step="1" />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">管捆状态</Label>
                <Input v-model="draftBundle.bundle_type" class="bg-teal-200" />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">班组</Label>
                <Select v-model="draftBundle.ban_ci">
                  <SelectTrigger class="w-full bg-teal-200">
                    <SelectValue placeholder="选择班组" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="item in shiftOptions" :key="item.value" :value="item.value">
                      {{ item.value }}-{{ item.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1">
                <Label class="text-xs">作业点代码</Label>
                <Input v-model="draftBundle.product_job_point" class="bg-teal-200" />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">去向代码</Label>
                <Input v-model="draftBundle.direction_code" class="bg-teal-200" />
              </div>
            </div>

            <div class="mb-3 grid grid-cols-6 gap-3">
              <div class="space-y-1">
                <Label class="text-xs">理论重量</Label>
                <Input :model-value="draftBundle.theory_weight ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">理论长度</Label>
                <Input :model-value="draftBundle.theory_total_length ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">米制重量</Label>
                <Input :model-value="draftBundle.weight ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">英制重量</Label>
                <Input :model-value="draftBundle.weight_eng ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">米制长度</Label>
                <Input :model-value="draftBundle.total_length ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">英制长度</Label>
                <Input :model-value="draftBundle.length_eng ?? ''" readonly />
              </div>
            </div>

            <div class="mb-3 grid grid-cols-3 gap-3">
              <div class="space-y-1">
                <Label class="text-xs">材质正文</Label>
                <Input :model-value="draftBundle.mat_text ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">标准正文</Label>
                <Input :model-value="draftBundle.std_text ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">钢级正文</Label>
                <Input :model-value="draftBundle.sg_text ?? ''" readonly />
              </div>
            </div>

            <div class="mb-3 grid grid-cols-6 gap-3">
              <div class="space-y-1">
                <Label class="text-xs">管端类型符号</Label>
                <Input :model-value="draftBundle.end_type_sign ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">管端型式</Label>
                <Input :model-value="draftBundle.end_type ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">螺纹类型符号</Label>
                <Input :model-value="draftBundle.thread_type_sign ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">螺纹类型</Label>
                <Input :model-value="draftBundle.thread_type ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">接箍炉号</Label>
                <Input :model-value="draftBundle.pono_id_coupling ?? ''" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">接箍批号</Label>
                <Input :model-value="draftBundle.lot_no_thread ?? ''" readonly />
              </div>
            </div>
          </template>

          <div v-else class="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            请先执行查询或点击新增创建管捆草稿
          </div>
        </div>
      </div>

      <div class="flex w-[520px] flex-shrink-0 flex-col pt-4">
        <div class="relative flex flex-1 flex-col rounded-lg border p-4">
          <div class="absolute -top-3 left-4 bg-white px-2 text-sm font-bold text-[1rem]">
            管子信息
          </div>

          <div class="flex min-h-0 flex-1 flex-col rounded border">
            <div class="border-b">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-[100px]"> 流水号 </TableHead>
                    <TableHead class="w-[100px]"> 管号 </TableHead>
                    <TableHead class="w-[120px]"> 长度（米） </TableHead>
                    <TableHead class="w-[120px]"> 重量（千克） </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>
            <div class="flex-1 overflow-y-auto">
              <Table>
                <TableBody>
                  <TableRow
                    v-for="(row, index) in draftTubes"
                    :key="index"
                    :class="{ 'bg-accent': selectedTubeIndex === index }"
                    class="cursor-pointer"
                    @click="selectedTubeIndex = index"
                  >
                    <TableCell class="w-[100px] p-1">
                      <Input
                        :model-value="row.flow_no"
                        type="number"
                        class="h-8 border-0 px-1 shadow-none"
                        @update:model-value="updateTubeField(index, 'flow_no', $event)"
                      />
                    </TableCell>
                    <TableCell class="w-[100px] p-1">
                      <Input
                        :model-value="row.tube_no ?? 0"
                        type="number"
                        class="h-8 border-0 px-1 shadow-none"
                        @update:model-value="updateTubeField(index, 'tube_no', $event)"
                      />
                    </TableCell>
                    <TableCell class="w-[120px] p-1">
                      <Input
                        :model-value="row.length ?? 0"
                        type="number"
                        step="0.001"
                        class="h-8 border-0 px-1 shadow-none"
                        @update:model-value="updateTubeField(index, 'length', $event)"
                      />
                    </TableCell>
                    <TableCell class="w-[120px] p-1">
                      <Input
                        :model-value="row.weight ?? 0"
                        type="number"
                        step="0.001"
                        class="h-8 border-0 px-1 shadow-none"
                        @update:model-value="updateTubeField(index, 'weight', $event)"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="draftTubes.length === 0">
                    <TableCell colspan="4" class="h-20 text-center text-sm text-muted-foreground">
                      当前没有管子草稿数据
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          <div class="mt-3 flex items-center gap-3">
            <Button variant="outline" class="mt-3 w-32" @click="handleAddTube"> 管子新增 </Button>
            <Button variant="outline" class="mt-3 w-32" @click="handleDeleteTube">
              管子删除
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue';
import type { BundleRecord, BundleRecordKey, OrderData, TubeRecord } from '@gt4_web/shared';
import {
  checkBundleDuplicate,
  getBundleDetail,
  getBundleDraftBootstrap,
  getBundles,
  saveBundleDraft,
} from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const shiftOptions = [
  { value: '11', label: '夜甲' },
  { value: '12', label: '夜乙' },
  { value: '13', label: '夜丙' },
  { value: '14', label: '夜丁' },
  { value: '21', label: '早甲' },
  { value: '22', label: '早乙' },
  { value: '23', label: '早丙' },
  { value: '24', label: '早丁' },
];

const requiredBundleFields: Array<[keyof BundleRecord, string]> = [
  ['order_no', '合同号'],
  ['item_no', '项目号'],
  ['bundle_no', '管捆号'],
  ['roll_no', '轧批号'],
  ['melt_no', '炉号'],
  ['lot_no', '试批号'],
  ['diameter', '外径'],
  ['wall_thickness', '壁厚'],
  ['length_from', '最短'],
  ['length_to', '最长'],
  ['tube', '根数'],
  ['last_flow_no', '最后流水号'],
  ['produce_time', '生产时间'],
  ['bundle_type', '管捆状态'],
  ['ban_ci', '班组'],
  ['product_job_point', '作业点代码'],
  ['direction_code', '去向代码'],
  ['theory_weight', '理论重量'],
  ['theory_total_length', '理论长度'],
  ['weight', '米制重量'],
  ['weight_eng', '英制重量'],
  ['total_length', '米制长度'],
  ['length_eng', '英制长度'],
  ['mat_text', '材质正文'],
  ['std_text', '标准正文'],
  ['sg_text', '钢级正文'],
  ['end_type_sign', '管端类型符号'],
  ['end_type', '管端型式'],
  ['thread_type_sign', '螺纹类型符号'],
  ['thread_type', '螺纹类型'],
];

const queryState = reactive({
  queryDate: getTodayString(),
  bundleNo: '',
  orderNo: '',
  itemNo: '',
});

const bundleResults = ref<BundleRecord[]>([]);
const selectedBundleIndex = ref<number | null>(null);
const draftBundle = ref<BundleRecord | null>(null);
const draftTubes = ref<TubeRecord[]>([]);
const selectedTubeIndex = ref<number | null>(null);
const originalBundleKey = ref<BundleRecordKey | null>(null);
const draftUi = reactive({
  produceDate: '',
  produceClock: '',
});
const statusMessage = ref('');
const duplicateMessage = ref('');
const isLoadingQuery = ref(false);
const isSaving = ref(false);

let duplicateTimer: number | null = null;
let duplicateRequestId = 0;

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function splitProduceTime(value: string | null) {
  if (!value) {
    return { date: '', time: '' };
  }

  if (/^\d{14}$/.test(value)) {
    return {
      date: `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`,
      time: `${value.slice(8, 10)}:${value.slice(10, 12)}:${value.slice(12, 14)}`,
    };
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    const [date, time] = value.split(' ');
    return { date, time };
  }

  return { date: '', time: '' };
}

function normalizeClock(value: string) {
  if (!value) {
    return '';
  }

  if (/^\d{2}:\d{2}$/.test(value)) {
    return `${value}:00`;
  }

  return value;
}

function mergeProduceTime(date: string, time: string) {
  if (!date || !time) {
    return '';
  }

  return `${date} ${normalizeClock(time)}`;
}

function normalizeEditableBundle(bundle: BundleRecord): BundleRecord {
  return {
    ...bundle,
    bundle_no: bundle.bundle_no ?? '',
    melt_no: bundle.melt_no ?? '',
    lot_no: bundle.lot_no ?? '',
    bundle_type: bundle.bundle_type ?? '',
    ban_ci: bundle.ban_ci ?? '',
    product_job_point: bundle.product_job_point ?? '',
    direction_code: bundle.direction_code ?? '',
    produce_time: bundle.produce_time ?? '',
  };
}

function mapPersistedBundleToDraftModel(bundle: BundleRecord): BundleRecord {
  return normalizeEditableBundle({ ...bundle });
}

function mapContractBundleToDraftModel(bundle: BundleRecord, sourceOrder: OrderData): BundleRecord {
  return normalizeEditableBundle({
    ...bundle,
    prod_code: bundle.prod_code ?? sourceOrder.prod_code,
    prod_cname: bundle.prod_cname ?? sourceOrder.prod_cname,
    mat_no: bundle.mat_no ?? sourceOrder.mat_no,
    mat_text: bundle.mat_text ?? sourceOrder.mat_text,
    std_sg_code: bundle.std_sg_code ?? sourceOrder.std_sg_code,
    std_text: bundle.std_text ?? sourceOrder.std_text,
    sg_text: bundle.sg_text ?? sourceOrder.sg_text,
    end_type_code: bundle.end_type_code ?? sourceOrder.end_type_code,
    end_type_sign: bundle.end_type_sign ?? sourceOrder.end_type_sign,
    end_type: bundle.end_type ?? sourceOrder.end_type,
    thread_type_code: bundle.thread_type_code ?? sourceOrder.thread_type_code,
    thread_type_sign: bundle.thread_type_sign ?? sourceOrder.thread_type_sign,
    thread_type: bundle.thread_type ?? sourceOrder.thread_type,
    coupling_type_code: bundle.coupling_type_code ?? sourceOrder.coupling_type_code,
    coupling_type_sign: bundle.coupling_type_sign ?? sourceOrder.coupling_type_sign,
    order_no_old: bundle.order_no_old ?? sourceOrder.order_no_old,
    weight_per_meter: bundle.weight_per_meter ?? sourceOrder.weight_per_meter,
    weight_ew: bundle.weight_ew ?? sourceOrder.weight_ew,
    bundle_no: '',
    melt_no: '',
    lot_no: '',
    produce_time: '',
    bundle_type: '',
    ban_ci: '',
    product_job_point: '',
    direction_code: '',
    length_from: null,
    length_to: null,
    tube: null,
    last_flow_no: null,
    theory_weight: null,
    theory_total_length: null,
    weight: null,
    weight_eng: null,
    total_length: null,
    length_eng: null,
  });
}

function mapTubeToDraftModel(tube: TubeRecord): TubeRecord {
  return { ...tube };
}

function resetDraftState() {
  draftBundle.value = null;
  draftTubes.value = [];
  selectedTubeIndex.value = null;
  originalBundleKey.value = null;
  draftUi.produceDate = '';
  draftUi.produceClock = '';
  clearDuplicateState();
}

function clearDuplicateState() {
  duplicateMessage.value = '';
}

function setDraftState(
  bundle: BundleRecord,
  tubes: TubeRecord[],
  originalKey: BundleRecordKey | null,
) {
  draftBundle.value = bundle;
  draftTubes.value = tubes;
  selectedTubeIndex.value = tubes.length > 0 ? 0 : null;
  originalBundleKey.value = originalKey;
  const produce = splitProduceTime(bundle.produce_time);
  draftUi.produceDate = produce.date;
  draftUi.produceClock = produce.time;
  clearDuplicateState();
}

function focusBundleNumberInput() {
  const input = document.querySelector<HTMLInputElement>('[data-bundle-no-input="true"]');
  input?.focus();
  input?.select();
}

function roundTo(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function parseNumberInput(value: string | number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function syncDraftBundleNumberToTubes(bundleNo: string) {
  const normalizedBundleNo = bundleNo.trim();
  draftTubes.value = draftTubes.value.map((tube) => ({
    ...tube,
    order_no: draftBundle.value?.order_no ?? tube.order_no,
    item_no: draftBundle.value?.item_no ?? tube.item_no,
    bundle_no: normalizedBundleNo,
  }));
}

function recalculateBundleDraft() {
  if (!draftBundle.value) {
    return;
  }

  if (draftTubes.value.length === 0) {
    draftBundle.value.length_from = null;
    draftBundle.value.length_to = null;
    draftBundle.value.tube = null;
    draftBundle.value.last_flow_no = null;
    draftBundle.value.theory_weight = null;
    draftBundle.value.theory_total_length = null;
    draftBundle.value.weight = null;
    draftBundle.value.weight_eng = null;
    draftBundle.value.total_length = null;
    draftBundle.value.length_eng = null;
    return;
  }

  const lengths = draftTubes.value.map((tube) => tube.length ?? 0);
  const weights = draftTubes.value.map((tube) => tube.weight ?? 0);
  const totalLength = roundTo(
    lengths.reduce((sum, current) => sum + current, 0),
    3,
  );
  const totalWeightRaw = weights.reduce((sum, current) => sum + current, 0);
  const metricWeight = Math.round(totalWeightRaw);
  const weightPerMeter = draftBundle.value.weight_per_meter ?? 0;

  draftBundle.value.length_from = roundTo(Math.min(...lengths), 3);
  draftBundle.value.length_to = roundTo(Math.max(...lengths), 3);
  draftBundle.value.tube = draftTubes.value.length;
  draftBundle.value.last_flow_no = Math.max(...draftTubes.value.map((tube) => tube.flow_no));
  draftBundle.value.weight = metricWeight;
  draftBundle.value.weight_eng = Math.round(metricWeight * 2.204622);
  draftBundle.value.total_length = totalLength;
  draftBundle.value.length_eng = roundTo(totalLength * 3.280839, 3);
  draftBundle.value.theory_weight =
    weightPerMeter > 0 ? Math.round(totalLength * weightPerMeter) : null;
  draftBundle.value.theory_total_length =
    weightPerMeter > 0 ? roundTo(totalWeightRaw / weightPerMeter, 3) : null;
}

async function validateBundleNumber(bundleNo: string) {
  if (!draftBundle.value) {
    return;
  }

  const normalizedBundleNo = bundleNo.trim();
  if (!normalizedBundleNo) {
    clearDuplicateState();
    return;
  }

  const currentRequestId = ++duplicateRequestId;

  try {
    const result = await checkBundleDuplicate({
      order_no: draftBundle.value.order_no,
      item_no: draftBundle.value.item_no,
      bundle_no: normalizedBundleNo,
      original_bundle_no: originalBundleKey.value?.bundle_no ?? null,
    });

    if (currentRequestId !== duplicateRequestId) {
      return;
    }

    duplicateMessage.value = result.duplicate ? result.message : '';
    if (result.duplicate) {
      window.alert(result.message);
    }
  } catch (error) {
    if (currentRequestId !== duplicateRequestId) {
      return;
    }

    duplicateMessage.value = getErrorMessage(error, '重号校验失败，请稍后重试');
    console.error(error);
  }
}

async function selectBundle(row: BundleRecord, index: number) {
  try {
    const detail = await getBundleDetail({
      order_no: row.order_no,
      item_no: row.item_no,
      bundle_no: row.bundle_no,
    });

    selectedBundleIndex.value = index;
    setDraftState(
      mapPersistedBundleToDraftModel(detail.bundle),
      detail.tubes.map(mapTubeToDraftModel),
      {
        order_no: detail.bundle.order_no,
        item_no: detail.bundle.item_no,
        bundle_no: detail.bundle.bundle_no,
      },
    );
    statusMessage.value = `已加载管捆 ${detail.bundle.bundle_no} 的明细和管子数据`;
  } catch (error) {
    console.error(error);
    window.alert(getErrorMessage(error, '加载管捆明细失败'));
  }
}

async function handleQuery() {
  if (!queryState.bundleNo.trim() && !queryState.queryDate) {
    window.alert('请输入查询日期或管捆号');
    return;
  }

  isLoadingQuery.value = true;
  try {
    const rows = await getBundles({
      query_date: queryState.bundleNo.trim() ? undefined : queryState.queryDate,
      bundle_no: queryState.bundleNo.trim() || undefined,
    });

    bundleResults.value = rows;
    selectedBundleIndex.value = null;

    if (rows.length === 0) {
      resetDraftState();
      statusMessage.value = '未查询到记录，已清空管捆信息和管子信息';
      window.alert('未查询到记录');
      return;
    }

    statusMessage.value = `查询到 ${rows.length} 条管捆记录，已默认选中第一条`;
    await selectBundle(rows[0], 0);
  } catch (error) {
    console.error(error);
    window.alert(getErrorMessage(error, '查询管捆失败'));
  } finally {
    isLoadingQuery.value = false;
  }
}

async function handleCreateDraft() {
  const orderNo = queryState.orderNo.trim();
  const itemNo = queryState.itemNo.trim();
  if (!orderNo || !itemNo) {
    window.alert('请输入合同号和项目号');
    return;
  }

  try {
    const response = await getBundleDraftBootstrap({
      order_no: orderNo,
      item_no: itemNo,
    });

    selectedBundleIndex.value = null;
    setDraftState(mapContractBundleToDraftModel(response.bundle, response.source_order), [], null);
    statusMessage.value = '已根据合同数据创建新的管捆草稿';
    await nextTick();
    focusBundleNumberInput();
  } catch (error) {
    console.error(error);
    window.alert(getErrorMessage(error, '创建管捆草稿失败'));
  }
}

function handleAddTube() {
  if (!draftBundle.value) {
    window.alert('请先选择或新增管捆草稿');
    return;
  }

  draftTubes.value = [
    ...draftTubes.value,
    {
      order_no: draftBundle.value.order_no,
      item_no: draftBundle.value.item_no,
      bundle_no: draftBundle.value.bundle_no.trim(),
      flow_no: 0,
      tube_no: 0,
      length: 0,
      weight: 0,
    },
  ];
  selectedTubeIndex.value = draftTubes.value.length - 1;
  recalculateBundleDraft();
}

function handleDeleteTube() {
  if (selectedTubeIndex.value == null) {
    window.alert('请先选择要删除的管子记录');
    return;
  }

  draftTubes.value = draftTubes.value.filter((_, index) => index !== selectedTubeIndex.value);
  selectedTubeIndex.value =
    draftTubes.value.length > 0
      ? Math.min(selectedTubeIndex.value, draftTubes.value.length - 1)
      : null;
  recalculateBundleDraft();
}

function updateTubeField(index: number, field: keyof TubeRecord, value: string | number) {
  draftTubes.value = draftTubes.value.map((tube, rowIndex) => {
    if (rowIndex !== index) {
      return tube;
    }

    const numericValue = parseNumberInput(value);
    if (field === 'flow_no') {
      return { ...tube, flow_no: Math.trunc(numericValue) };
    }

    if (field === 'tube_no') {
      return { ...tube, tube_no: Math.trunc(numericValue) };
    }

    if (field === 'length') {
      return { ...tube, length: roundTo(numericValue, 3) };
    }

    if (field === 'weight') {
      return { ...tube, weight: roundTo(numericValue, 3) };
    }

    return tube;
  });

  recalculateBundleDraft();
}

function buildSaveBundle() {
  if (!draftBundle.value) {
    return null;
  }

  return {
    ...draftBundle.value,
    bundle_no: draftBundle.value.bundle_no.trim(),
    melt_no: draftBundle.value.melt_no?.trim() ?? '',
    lot_no: draftBundle.value.lot_no?.trim() ?? '',
    bundle_type: draftBundle.value.bundle_type?.trim() ?? '',
    ban_ci: draftBundle.value.ban_ci?.trim() ?? '',
    product_job_point: draftBundle.value.product_job_point?.trim() ?? '',
    direction_code: draftBundle.value.direction_code?.trim() ?? '',
    produce_time: mergeProduceTime(draftUi.produceDate, draftUi.produceClock),
  } satisfies BundleRecord;
}

function validateBeforeSave(bundle: BundleRecord, tubes: TubeRecord[]) {
  for (const [field, label] of requiredBundleFields) {
    const value = bundle[field];
    if (typeof value === 'string' && value.trim().length === 0) {
      return `${label}不能为空`;
    }

    if (value == null) {
      return `${label}不能为空`;
    }
  }

  if (tubes.length === 0) {
    return '至少需要一条管子记录';
  }

  const hasInvalidTube = tubes.some(
    (tube) =>
      tube.flow_no <= 0 ||
      (tube.tube_no ?? 0) <= 0 ||
      (tube.length ?? 0) <= 0 ||
      (tube.weight ?? 0) <= 0,
  );
  if (hasInvalidTube) {
    return '管子流水号、管号、长度、重量必须大于0';
  }

  return null;
}

async function handleSave() {
  if (!draftBundle.value) {
    window.alert('请先选择或新增管捆草稿');
    return;
  }

  if (duplicateMessage.value) {
    window.alert(duplicateMessage.value);
    return;
  }

  const bundle = buildSaveBundle();
  if (!bundle) {
    window.alert('当前没有可保存的管捆数据');
    return;
  }

  const tubes = draftTubes.value.map((tube) => ({
    ...tube,
    order_no: bundle.order_no,
    item_no: bundle.item_no,
    bundle_no: bundle.bundle_no,
  }));

  const validationError = validateBeforeSave(bundle, tubes);
  if (validationError) {
    window.alert(validationError);
    return;
  }

  isSaving.value = true;
  try {
    const result = await saveBundleDraft({
      bundle,
      tubes,
      original_key: originalBundleKey.value,
    });

    window.alert(result.message);
    statusMessage.value = result.message;
    queryState.bundleNo = bundle.bundle_no;
    await handleQuery();
  } catch (error) {
    console.error(error);
    window.alert(getErrorMessage(error, '保存管捆失败'));
  } finally {
    isSaving.value = false;
  }
}

function handleDeleteBundle() {
  window.alert('当前变更未包含独立删除功能');
}

function handlePrintTag() {
  window.alert('当前变更未包含标签打印功能改造');
}

watch(
  () => draftBundle.value?.bundle_no ?? '',
  (bundleNo) => {
    if (!draftBundle.value) {
      return;
    }

    syncDraftBundleNumberToTubes(bundleNo);

    if (duplicateTimer != null) {
      window.clearTimeout(duplicateTimer);
      duplicateTimer = null;
    }

    const normalizedBundleNo = bundleNo.trim();
    if (!normalizedBundleNo) {
      clearDuplicateState();
      return;
    }

    if (originalBundleKey.value?.bundle_no === normalizedBundleNo) {
      clearDuplicateState();
      return;
    }

    duplicateTimer = window.setTimeout(() => {
      void validateBundleNumber(normalizedBundleNo);
    }, 300);
  },
);

watch(
  () => [draftTubes.value.length, draftBundle.value?.weight_per_meter],
  () => {
    if (draftBundle.value && draftTubes.value.length > 0) {
      recalculateBundleDraft();
    }
  },
);

onBeforeUnmount(() => {
  if (duplicateTimer != null) {
    window.clearTimeout(duplicateTimer);
  }
});
</script>
