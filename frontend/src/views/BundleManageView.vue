<template>
  <div class="flex h-full w-full flex-col bg-[#d8d8d8] [font-family:sans-serif] overflow-hidden">
    <div class="flex-shrink-0 space-y-2 p-3 pb-2">
      <div
        class="relative rounded-[3px] border border-[#868686] bg-[#d8d8d8] px-3 pt-[14px] pb-3 shadow-[inset_0_1px_0_#f7f7f7]"
      >
        <div
          class="absolute -top-[11px] left-3 bg-[#d8d8d8] px-1 text-sm font-bold leading-[1.2] text-[#6f1616]"
        >
          管捆查询
        </div>
        <div class="flex flex-nowrap items-center gap-2 whitespace-nowrap pt-1">
          <Label class="whitespace-nowrap">查询日期</Label>
          <Input v-model="queryState.queryDate" type="date" class="h-8 w-40 shadow-none" />
          <Label class="whitespace-nowrap">班次</Label>
          <WinSelect
            v-model="queryState.shift"
            :options="queryShiftOptions"
            trigger-class="h-8 !w-32 shrink-0 shadow-none"
          />
          <Label class="whitespace-nowrap">管捆号</Label>
          <Input v-model="queryState.bundleNo" type="text" class="h-8 w-40 shadow-none" />
          <Button :disabled="isLoadingQuery" @click="handleQuery">
            {{ isLoadingQuery ? '查询中...' : '执行查询' }}
          </Button>
          <Label class="whitespace-nowrap">合同号</Label>
          <Input v-model="queryState.orderNo" type="text" class="h-8 w-40 shadow-none" />
          <Label class="whitespace-nowrap">项目号</Label>
          <Input v-model="queryState.itemNo" type="text" class="h-8 w-20 shadow-none" />
          <Button @click="handleCreateDraft"> 新增 </Button>
          <Button :disabled="isDeleting" @click="handleDeleteBundle">
            {{ isDeleting ? '删除中...' : '删除' }}
          </Button>
          <Button :disabled="isSaving" @click="handleSave">
            {{ isSaving ? '保存中...' : '保存' }}
          </Button>
          <Label :class="'whitespace-nowrap'">张数：</Label>
          <WinSelect
            v-model="printCount"
            :options="printCountOptions"
            trigger-class="h-8 !w-16 shrink-0 shadow-none"
          />
          <Button @click="handlePrintTag"> 标签打印 </Button>
          <Button @click="handleSendL3Insert"> L3新增电文补发 </Button>
          <Button @click="handleSendL3Delete"> L3删除电文补发 </Button>
        </div>
      </div>
      <!-- <div v-if="statusMessage" class="px-1 text-sm text-muted-foreground">
        {{ statusMessage }}
      </div> -->
    </div>

    <div class="mt-2 flex min-h-0 flex-1 gap-3 px-3 pb-3">
      <div class="flex min-h-0 w-[560px] flex-shrink-0 flex-col">
        <div
          class="relative flex min-h-0 flex-1 flex-col rounded-[3px] border border-[#868686] bg-[#d8d8d8] px-3 pt-[14px] pb-3 shadow-[inset_0_1px_0_#f7f7f7]"
        >
          <div
            class="absolute -top-[11px] left-3 bg-[#d8d8d8] px-1 text-sm font-bold leading-[1.2] text-[#6f1616]"
          >
            管捆列表
          </div>
          <WinTableFrame
            v-bind="tableFrameTone"
            :columns="bundleListColumns"
            class="min-h-0 flex-1 overflow-y-auto"
          >
            <TableBody class="[&_tr]:h-9">
              <TableRow
                v-for="(row, index) in bundleResults"
                :key="`${row.order_no}-${row.item_no}-${row.bundle_no}`"
                :class="{ 'win-table-row--selected': selectedBundleIndices.has(index) }"
                class="cursor-pointer"
                @mousedown="startBundleSelection(row, index)"
                @mouseenter="extendBundleSelection(index)"
              >
                <TableCell class="w-[100px]">
                  {{ row.order_no }}
                </TableCell>
                <TableCell class="w-[60px]">
                  {{ row.item_no }}
                </TableCell>
                <TableCell class="w-[70px]">
                  {{ row.bundle_no }}
                </TableCell>
                <TableCell class="w-[70px]">
                  {{ row.roll_no }}
                </TableCell>
                <TableCell class="w-[80px]">
                  {{ row.melt_no }}
                </TableCell>
                <TableCell class="w-[70px]">
                  {{ row.lot_no }}
                </TableCell>
                <TableCell class="w-[50px]">
                  {{ row.send_flag }}
                </TableCell>
              </TableRow>
              <TableRow v-if="bundleResults.length === 0">
                <TableCell colspan="7" class="h-20 text-center text-sm text-[#666666]">
                  暂无查询结果
                </TableCell>
              </TableRow>
            </TableBody>
          </WinTableFrame>
        </div>
      </div>

      <div class="flex min-h-0 flex-1 flex-col">
        <div
          class="relative flex min-h-0 flex-1 flex-col rounded-[3px] border border-[#868686] bg-[#d8d8d8] px-3 pt-[14px] pb-3 shadow-[inset_0_1px_0_#f7f7f7]"
        >
          <div
            class="absolute -top-[11px] left-3 bg-[#d8d8d8] px-1 text-sm font-bold leading-[1.2] text-[#6f1616]"
          >
            管捆信息
          </div>

          <div
            class="flex min-h-0 flex-1 flex-col overflow-auto rounded-[2px] border border-[#8a8a8a] bg-[#d8d8d8] px-4 py-3 shadow-[inset_0_1px_0_#f4f4f4]"
          >
            <div class="grid grid-cols-6 gap-3">
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">合同号</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.order_no"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">项目号</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.item_no"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">管捆号</Label>
                <Input
                  :model-value="displayBundle.bundle_no"
                  :disabled="!hasDraftBundle"
                  class="h-8 text-center shadow-none"
                  data-bundle-no-input="true"
                  :class="duplicateMessage ? 'border-destructive' : ''"
                  @update:model-value="updateDraftTextField('bundle_no', $event)"
                />
                <p v-if="hasDraftBundle && duplicateMessage" class="text-xs text-destructive">
                  {{ duplicateMessage }}
                </p>
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">轧批号</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.roll_no ?? ''"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">炉号</Label>
                <Input
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.melt_no ?? ''"
                  :disabled="!hasDraftBundle"
                  @update:model-value="updateDraftTextField('melt_no', $event)"
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">试批号</Label>
                <Input
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.lot_no ?? ''"
                  :disabled="!hasDraftBundle"
                  @update:model-value="updateDraftTextField('lot_no', $event)"
                />
              </div>
            </div>

            <div class="mt-3 grid grid-cols-6 gap-3">
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">外径</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.diameter ?? ''"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">壁厚</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.wall_thickness ?? ''"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">最短</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.length_from ?? ''"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">最长</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.length_to ?? ''"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">根数</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.tube ?? ''"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">最后流水号</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.last_flow_no ?? ''"
                  readonly
                />
              </div>
            </div>

            <div class="mt-3 grid grid-cols-6 gap-3">
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">生产日期</Label>
                <Input
                  class="h-8 text-center shadow-none"
                  :model-value="draftUi.produceDate"
                  :disabled="!hasDraftBundle"
                  type="date"
                  @update:model-value="updateDraftUiField('produceDate', $event)"
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">生产时间</Label>
                <Input
                  class="h-8 text-center shadow-none"
                  :model-value="draftUi.produceClock"
                  :disabled="!hasDraftBundle"
                  type="time"
                  step="1"
                  @update:model-value="updateDraftUiField('produceClock', $event)"
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">管捆状态</Label>
                <Input
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.bundle_type ?? ''"
                  :disabled="!hasDraftBundle"
                  @update:model-value="updateDraftTextField('bundle_type', $event)"
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">班组</Label>
                <WinSelect
                  :model-value="displayBundle.ban_ci ?? ''"
                  :options="shiftSelectOptions"
                  :disabled="!hasDraftBundle"
                  placeholder="选择班组"
                  trigger-class="h-8 shadow-none"
                  @update:model-value="updateDraftShift"
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">作业点代码</Label>
                <Input
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.product_job_point ?? ''"
                  :disabled="!hasDraftBundle"
                  @update:model-value="updateDraftTextField('product_job_point', $event)"
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">去向代码</Label>
                <Input
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.direction_code ?? ''"
                  :disabled="!hasDraftBundle"
                  @update:model-value="updateDraftTextField('direction_code', $event)"
                />
              </div>
            </div>

            <div class="mt-3 grid grid-cols-6 gap-3">
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">理论重量</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.theory_weight ?? ''"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">理论长度</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.theory_total_length ?? ''"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">米制重量</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.weight ?? ''"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">英制重量</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.weight_eng ?? ''"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">米制长度</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.total_length ?? ''"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">英制长度</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.length_eng ?? ''"
                  readonly
                />
              </div>
            </div>

            <div class="mt-3 grid grid-cols-3 gap-3">
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">材质正文</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.mat_text ?? ''"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">标准正文</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.std_text ?? ''"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">钢级正文</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.sg_text ?? ''"
                  readonly
                />
              </div>
            </div>

            <div class="mt-3 grid grid-cols-6 gap-3">
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">管端类型符号</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.end_type_sign ?? ''"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">管端型式</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.end_type ?? ''"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">螺纹类型符号</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.thread_type_sign ?? ''"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">螺纹类型</Label>
                <Input
                  variant="readonly"
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.thread_type ?? ''"
                  readonly
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">接箍炉号</Label>
                <Input
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.pono_id_coupling ?? ''"
                  :disabled="!hasDraftBundle"
                  @update:model-value="updateDraftTextField('pono_id_coupling', $event)"
                />
              </div>
              <div
                class="space-y-1 [&_[data-slot=label]]:justify-center [&_[data-slot=input]]:text-center"
              >
                <Label class="text-sm">接箍批号</Label>
                <Input
                  class="h-8 text-center shadow-none"
                  :model-value="displayBundle.lot_no_thread ?? ''"
                  :disabled="!hasDraftBundle"
                  @update:model-value="updateDraftTextField('lot_no_thread', $event)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex min-h-0 w-[460px] flex-shrink-0 flex-col">
        <div
          class="relative flex min-h-0 flex-1 flex-col rounded-[3px] border border-[#868686] bg-[#d8d8d8] px-3 pt-[14px] pb-3 shadow-[inset_0_1px_0_#f7f7f7]"
        >
          <div
            class="absolute -top-[11px] left-3 bg-[#d8d8d8] px-1 text-sm font-bold leading-[1.2] text-[#6f1616]"
          >
            管子信息
          </div>

          <WinTableFrame
            v-bind="tableFrameTone"
            :columns="tubeDraftColumns"
            class="min-h-0 flex-1 overflow-y-auto"
          >
            <TableBody class="[&_tr]:h-9">
              <TableRow
                v-for="(row, index) in draftTubes"
                :key="index"
                :class="{ 'win-table-row--selected': selectedTubeIndex === index }"
                class="cursor-pointer"
                @click="selectedTubeIndex = index"
              >
                <TableCell class="w-[90px] p-1">
                  <Input
                    variant="table"
                    :model-value="row.flow_no"
                    type="number"
                    class="h-7 border-0 px-1 text-center focus-visible:ring-0"
                    @update:model-value="updateTubeField(index, 'flow_no', $event)"
                  />
                </TableCell>
                <TableCell class="w-[90px] p-1">
                  <Input
                    variant="table"
                    :model-value="row.tube_no ?? 0"
                    type="number"
                    class="h-7 border-0 px-1 text-center focus-visible:ring-0"
                    @update:model-value="updateTubeField(index, 'tube_no', $event)"
                  />
                </TableCell>
                <TableCell class="w-[100px] p-1">
                  <Input
                    variant="table"
                    :model-value="row.length ?? 0"
                    type="number"
                    step="0.001"
                    class="h-7 border-0 px-1 text-center focus-visible:ring-0"
                    @update:model-value="updateTubeField(index, 'length', $event)"
                  />
                </TableCell>
                <TableCell class="w-[100px] p-1">
                  <Input
                    variant="table"
                    :model-value="row.weight ?? 0"
                    type="number"
                    step="0.001"
                    class="h-7 border-0 px-1 text-center focus-visible:ring-0"
                    @update:model-value="updateTubeField(index, 'weight', $event)"
                  />
                </TableCell>
              </TableRow>
              <TableRow v-if="draftTubes.length === 0">
                <TableCell colspan="4" class="h-20 text-center text-sm text-[#666666]">
                  当前没有管子草稿数据
                </TableCell>
              </TableRow>
            </TableBody>
          </WinTableFrame>
          <div class="mt-3 flex items-center gap-3">
            <Button class="w-32" @click="handleAddTube"> 管子新增 </Button>
            <Button class="w-32" @click="handleDeleteTube"> 管子删除 </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue';
import type { AcceptableValue } from 'reka-ui';
import type {
  TagPrintEvent,
  ApiBundleDataEvent,
  BundleQueryShift,
  BundleRecord,
  BundleRecordKey,
  OrderData,
  TubeRecord,
} from '@gt4_web/shared';
import { useWebSocket } from '@/services/websocket';
const { sendUserCommand } = useWebSocket();
import {
  checkBundleDuplicate,
  deleteBundle,
  getBundleDetail,
  getBundleDraftBootstrap,
  getBundles,
  saveBundleDraft,
} from '@/api';
import Button from '@/components/custom/WinButton.vue';
import Input from '@/components/custom/WinInput.vue';
import WinSelect from '@/components/custom/WinSelect.vue';
import WinTableFrame from '@/components/custom/WinTableFrame.vue';
import { Label } from '@/components/ui/label';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';

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

const shiftSelectOptions = shiftOptions.map((item) => ({
  value: item.value,
  label: `${item.value}-${item.label}`,
}));

const queryShiftOptions = [
  { value: 'all', label: '所有' },
  { value: 'day', label: '早班' },
  { value: 'night', label: '夜班' },
] as const;

const printCountOptions = ['1', '2'] as const;

const tableFrameTone = {
  borderColor: '#9a9a9a',
  shellBackground: '#d4d4d4',
  headerBackground: '#dddddd',
  headerTextColor: '#4b5f7d',
  cellBorderColor: '#b0b0b0',
  plainRowBackground: '#ebebeb',
  oddRowBackground: '#ebebeb',
  evenRowBackground: '#e6e6e6',
  selectedRowBackground: '#b8cceb',
} as const;

const bundleListColumns = [
  { key: 'order_no', label: '合同号', width: '100px' },
  { key: 'item_no', label: '项目号', width: '60px' },
  { key: 'bundle_no', label: '管捆号', width: '70px' },
  { key: 'roll_no', label: '轧批号', width: '70px' },
  { key: 'melt_no', label: '炉号', width: '80px' },
  { key: 'lot_no', label: '试批号', width: '70px' },
  { key: 'send_flag', label: '发送', width: '50px' },
] as const;

const tubeDraftColumns = [
  { key: 'flow_no', label: '流水号', width: '90px' },
  { key: 'tube_no', label: '管号', width: '90px' },
  { key: 'length', label: '长度（米）', width: '100px' },
  { key: 'weight', label: '重量（千克）', width: '100px' },
] as const;

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

const queryState = reactive<{
  queryDate: string;
  shift: BundleQueryShift;
  bundleNo: string;
  orderNo: string;
  itemNo: string;
}>({
  queryDate: getTodayString(),
  shift: 'all',
  bundleNo: '',
  orderNo: '',
  itemNo: '',
});

const bundleResults = ref<BundleRecord[]>([]);
const selectedBundleIndex = ref<number | null>(null);
const selectedBundleIndices = ref(new Set<number>());
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
const isDeleting = ref(false);
const printCount = ref('1');

const emptyBundleDisplay: BundleRecord = {
  order_no: '',
  item_no: '',
  bundle_no: '',
  roll_no: '',
  melt_no: '',
  lot_no: '',
  prod_code: '',
  prod_cname: '',
  mat_no: '',
  mat_text: '',
  std_sg_code: '',
  std_text: '',
  sg_text: '',
  diameter: null,
  wall_thickness: null,
  weight: null,
  weight_eng: null,
  total_length: null,
  length_eng: null,
  length_from: null,
  length_to: null,
  tube: null,
  bundle_type: '',
  produce_time: '',
  ban_ci: '',
  product_job_point: '',
  direction_code: '',
  theory_weight: null,
  theory_total_length: null,
  last_flow_no: null,
  end_type_code: '',
  end_type_sign: '',
  thread_type_code: '',
  thread_type_sign: '',
  coupling_type_code: '',
  coupling_type_sign: '',
  pono_id_coupling: '',
  lot_no_thread: '',
  order_no_old: '',
  toc: '',
  send_flag: '',
  gross_weight: null,
  end_type: '',
  thread_type: '',
  diameter_down_ctrl: null,
  diameter_up_ctrl: null,
  wal_thick_down_ctrl: null,
  wal_thick_up_ctrl: null,
  weight_per_meter: null,
  weight_ew: null,
  room_no: '',
};

const hasDraftBundle = computed(() => draftBundle.value !== null);
const displayBundle = computed(() => draftBundle.value ?? emptyBundleDisplay);

let duplicateTimer: number | null = null;
let duplicateRequestId = 0;
let bundleSelectionAnchor: number | null = null;
let isSelectingBundles = false;

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
    pono_id_coupling: bundle.pono_id_coupling ?? '',
    lot_no_thread: bundle.lot_no_thread ?? '',
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
    bundle_type: '000',
    ban_ci: '',
    product_job_point: 'E101',
    direction_code: 'T310',
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

function setBundleSelectionRange(fromIndex: number, toIndex: number) {
  const startIndex = Math.min(fromIndex, toIndex);
  const endIndex = Math.max(fromIndex, toIndex);
  selectedBundleIndices.value = new Set(
    Array.from({ length: endIndex - startIndex + 1 }, (_, index) => startIndex + index),
  );
}

function startBundleSelection(row: BundleRecord, index: number) {
  bundleSelectionAnchor = index;
  isSelectingBundles = true;
  setBundleSelectionRange(index, index);
  void selectBundle(row, index);
}

function extendBundleSelection(index: number) {
  if (!isSelectingBundles || bundleSelectionAnchor == null) {
    return;
  }

  setBundleSelectionRange(bundleSelectionAnchor, index);
}

function stopBundleSelection() {
  isSelectingBundles = false;
  bundleSelectionAnchor = null;
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

function updateDraftTextField(
  field:
    | 'bundle_no'
    | 'melt_no'
    | 'lot_no'
    | 'bundle_type'
    | 'product_job_point'
    | 'direction_code'
    | 'pono_id_coupling'
    | 'lot_no_thread',
  value: string | number,
) {
  if (!draftBundle.value) {
    return;
  }

  draftBundle.value[field] = String(value);
}

function updateDraftUiField(field: 'produceDate' | 'produceClock', value: string | number) {
  if (!draftBundle.value) {
    return;
  }

  draftUi[field] = String(value);
}

function updateDraftShift(value: AcceptableValue) {
  if (!draftBundle.value) {
    return;
  }

  draftBundle.value.ban_ci = value == null ? '' : String(value);
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
      shift: queryState.shift,
      bundle_no: queryState.bundleNo.trim() || undefined,
    });

    bundleResults.value = rows;
    selectedBundleIndex.value = null;
    selectedBundleIndices.value = new Set();

    if (rows.length === 0) {
      resetDraftState();
      statusMessage.value = '未查询到记录，已清空管捆信息和管子信息';
      window.alert('未查询到记录');
      return;
    }

    statusMessage.value = `查询到 ${rows.length} 条管捆记录，已默认选中第一条`;
    selectedBundleIndices.value = new Set([0]);
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
    pono_id_coupling: draftBundle.value.pono_id_coupling?.trim() ?? '',
    lot_no_thread: draftBundle.value.lot_no_thread?.trim() ?? '',
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

function notifyBundleDataChangedLogic1(
  flag: ApiBundleDataEvent['flag'],
  bundleKey: BundleRecordKey,
) {
  const cmd: ApiBundleDataEvent = {
    flag,
    order_no: bundleKey.order_no,
    item_no: bundleKey.item_no,
    bundle_no: bundleKey.bundle_no,
  };

  sendUserCommand('api_bundle_data_event', cmd);
}

function notifyBundleDataChanged(
  originalBundleKey: BundleRecordKey | null,
  bundleKey: BundleRecordKey,
) {
  if (originalBundleKey) {
    // 先发删除事件
    const cmd: ApiBundleDataEvent = {
      flag: 'D',
      order_no: originalBundleKey.order_no,
      item_no: originalBundleKey.item_no,
      bundle_no: originalBundleKey.bundle_no,
    };
    sendUserCommand('api_bundle_data_event', cmd);
  }

  const cmd: ApiBundleDataEvent = {
    flag: 'I',
    order_no: bundleKey.order_no,
    item_no: bundleKey.item_no,
    bundle_no: bundleKey.bundle_no,
  };

  sendUserCommand('api_bundle_data_event', cmd);
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

    // const operationFlag: ApiBundleDataEvent['flag'] = originalBundleKey.value ? 'U' : 'I';
    notifyBundleDataChanged(originalBundleKey.value, {
      order_no: bundle.order_no,
      item_no: bundle.item_no,
      bundle_no: bundle.bundle_no,
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

async function handleSendL3Insert() {
  if (!draftBundle.value) {
    window.alert('请先选择管捆');
    return;
  }

  try {
    notifyBundleDataChangedLogic1('I', {
      order_no: draftBundle.value.order_no,
      item_no: draftBundle.value.item_no,
      bundle_no: draftBundle.value.bundle_no,
    });
  } catch (error) {
    console.error(error);
    window.alert(getErrorMessage(error, '发送管捆到L3失败'));
  }
}

async function handleSendL3Delete() {
  if (!draftBundle.value) {
    window.alert('请先选择管捆');
    return;
  }

  try {
    notifyBundleDataChangedLogic1('D', {
      order_no: draftBundle.value.order_no,
      item_no: draftBundle.value.item_no,
      bundle_no: draftBundle.value.bundle_no,
    });
  } catch (error) {
    console.error(error);
    window.alert(getErrorMessage(error, '发送管捆删除到L3失败'));
  }
}

async function handleDeleteBundle() {
  if (!originalBundleKey.value) {
    window.alert('当前没有可删除的已保存管捆记录');
    return;
  }

  const deleteKey = originalBundleKey.value;
  const confirmed = window.confirm(
    `确认删除当前选中的管捆 ${deleteKey.bundle_no} 吗？此操作会同时删除对应的所有管子数据。`,
  );
  if (!confirmed) {
    return;
  }

  isDeleting.value = true;

  try {
    const result = await deleteBundle(deleteKey);
    notifyBundleDataChangedLogic1('D', deleteKey);
    const remainingRows = bundleResults.value.filter(
      (row) =>
        !(
          row.order_no === deleteKey.order_no &&
          row.item_no === deleteKey.item_no &&
          row.bundle_no === deleteKey.bundle_no
        ),
    );

    bundleResults.value = remainingRows;
    window.alert(result.message);

    if (remainingRows.length === 0) {
      selectedBundleIndex.value = null;
      resetDraftState();
      statusMessage.value = '删除成功，当前查询结果中已无更多管捆记录';
      return;
    }

    const nextIndex = Math.min(selectedBundleIndex.value ?? 0, remainingRows.length - 1);
    statusMessage.value = result.message;
    selectedBundleIndices.value = new Set([nextIndex]);
    await selectBundle(remainingRows[nextIndex], nextIndex);
  } catch (error) {
    console.error(error);
    window.alert(getErrorMessage(error, '删除管捆失败'));
  } finally {
    isDeleting.value = false;
  }
}

function handlePrintTag() {
  const selectedBundles = [...selectedBundleIndices.value]
    .sort((left, right) => left - right)
    .map((index) => bundleResults.value[index])
    .filter((bundle): bundle is BundleRecord => bundle != null);
  const bundlesToPrint =
    selectedBundles.length > 0 ? selectedBundles : [draftBundle.value].filter(Boolean);

  if (bundlesToPrint.length === 0) {
    window.alert('请先选择要打印标签的管捆记录');
    return;
  }

  for (const bundle of bundlesToPrint) {
    const cmd: TagPrintEvent = {
      order_no: bundle.order_no,
      item_no: bundle.item_no,
      bundle_no: bundle.bundle_no,
      count: Number(printCount.value),
    };
    sendUserCommand('tag_print_event', cmd);
    console.log('tag print cmd:', cmd.order_no, cmd.item_no, cmd.bundle_no, cmd.count);
  }
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

onBeforeUnmount(() => {
  if (duplicateTimer != null) {
    window.clearTimeout(duplicateTimer);
  }
  window.removeEventListener('mouseup', stopBundleSelection);
});

window.addEventListener('mouseup', stopBundleSelection);
</script>
