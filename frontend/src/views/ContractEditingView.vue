<template>
  <div class="h-full w-full overflow-hidden bg-[#d8d8d8] p-2 [font-family:sans-serif]">
    <div class="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <div class="mt-4 grid grid-cols-[30rem_minmax(0,1fr)] gap-3">
        <div
          class="relative min-w-0 rounded-[3px] border border-[#868686] bg-[#d3d3d3] px-3 pt-[14px] pb-3 shadow-[inset_0_1px_0_#f7f7f7]"
        >
          <div
            class="absolute -top-[11px] left-3 bg-[#d8d8d8] px-1 text-sm font-bold leading-[1.2] text-[#6f1616]"
          >
            合同申请
          </div>

          <div class="flex items-center gap-4 pt-1">
            <div class="flex items-center gap-2">
              <Label :class="baseLabelClass">合同号</Label>
              <Input v-model="requestOrder.orderNo" class="h-8 w-36 shadow-none" />
            </div>
            <div class="flex items-center gap-2">
              <Label :class="baseLabelClass">项目号</Label>
              <Input v-model="requestOrder.itemNo" class="h-8 w-20 text-right shadow-none" />
            </div>
            <Button class="min-w-22" @click="handleRequest">申请</Button>
          </div>
        </div>

        <div
          class="relative min-w-0 rounded-[3px] border border-[#868686] bg-[#d3d3d3] px-3 pt-[14px] pb-3 shadow-[inset_0_1px_0_#f7f7f7]"
        >
          <div
            class="absolute -top-[11px] left-3 bg-[#d8d8d8] px-1 text-sm font-bold leading-[1.2] text-[#6f1616]"
          >
            合同查询
          </div>

          <div class="flex flex-wrap items-center gap-4 pt-1">
            <div class="flex items-center gap-2">
              <Label :class="baseLabelClass">合同号</Label>
              <WinSelect
                v-model="queryForm.orderNo"
                :options="orderNoOptions"
                placeholder="选择合同号"
                trigger-class="w-36"
              />
            </div>
            <div class="flex items-center gap-2">
              <Label :class="baseLabelClass">项目号</Label>
              <WinSelect
                v-model="queryForm.itemNo"
                :options="itemNoOptions"
                placeholder="选择"
                trigger-class="w-20"
              />
            </div>
            <Button class="min-w-20" @click="handleQuery">查询</Button>
            <div class="flex items-center gap-2">
              <Label :class="baseLabelClass">查询日期范围</Label>
              <Input v-model="queryForm.dateFrom" type="date" class="h-8 w-40 shadow-none" />
            </div>
            <Label :class="baseLabelClass">至</Label>
            <Input v-model="queryForm.dateTo" type="date" class="h-8 w-40 shadow-none" />
          </div>
        </div>
      </div>

      <div
        class="relative flex-1 min-h-0 rounded-[3px] border border-[#868686] bg-[#d3d3d3] mt-2 px-3 pt-[14px] pb-3 shadow-[inset_0_1px_0_#f7f7f7]"
      >
        <div
          class="absolute -top-[11px] left-3 bg-[#d8d8d8] px-1 text-sm font-bold leading-[1.2] text-[#6f1616]"
        >
          合同明细
        </div>

        <div
          class="flex h-full min-h-0 flex-col overflow-hidden rounded-[2px] border border-[#8a8a8a] bg-[#d8d8d8] p-4 shadow-[inset_0_1px_0_#f4f4f4]"
        >
          <div class="flex-1 min-h-0 overflow-auto pr-1">
            <div class="space-y-3">
              <div class="flex flex-wrap items-center gap-4">
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">合同号</Label>
                  <Input v-model="formData.order_no" class="h-8 w-40 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">项目号</Label>
                  <Input v-model="formData.item_no" class="h-8 w-16 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">轧批号</Label>
                  <Input v-model="formData.roll_no" class="h-8 w-40 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">外径</Label>
                  <Input v-model="formData.diameter" class="h-8 w-24 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">壁厚</Label>
                  <Input v-model="formData.wall_thickness" class="h-8 w-24 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">原合同号</Label>
                  <Input v-model="formData.order_no_old" class="h-8 w-40 shadow-none" />
                </div>
              </div>

              <div class="grid grid-cols-12 gap-3">
                <div class="col-span-2 flex items-center gap-2">
                  <Label :class="baseLabelClass">品名细分类代码</Label>
                  <Input v-model="formData.prod_code" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="col-span-3 flex items-center gap-2">
                  <Label :class="baseLabelClass">品名细分类</Label>
                  <WinSelect
                    v-model="formData.prod_cname"
                    :options="prodCNameOptions"
                    placeholder="请选择"
                    trigger-class="w-full"
                  />
                </div>
                <div class="col-span-2 flex items-center gap-2">
                  <Label :class="baseLabelClass">热处理方式代码</Label>
                  <Input v-model="formData.heat_treat_code" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="col-span-5 flex items-center gap-2">
                  <Label :class="baseLabelClass">热处理方式正文</Label>
                  <Input v-model="formData.heat_treat_text" class="h-8 flex-1 shadow-none" />
                </div>
              </div>

              <div class="grid grid-cols-12 gap-3">
                <div class="col-span-2 flex items-center gap-2">
                  <Label :class="baseLabelClass">标准钢级代码</Label>
                  <Input v-model="formData.std_sg_code" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="col-span-10 flex items-center gap-2">
                  <Label :class="baseLabelClass">标准正文</Label>
                  <Input v-model="formData.std_text" class="h-8 flex-1 shadow-none" />
                </div>
              </div>

              <div class="grid grid-cols-12 gap-3">
                <div class="col-span-5 flex items-center gap-2">
                  <Label :class="baseLabelClass">钢级正文</Label>
                  <Input v-model="formData.sg_text" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="col-span-2 flex items-center gap-2">
                  <Label :class="baseLabelClass">材质号</Label>
                  <Input v-model="formData.mat_no" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="col-span-5 flex items-center gap-2">
                  <Label :class="baseLabelClass">材质正文</Label>
                  <Input v-model="formData.mat_text" class="h-8 flex-1 shadow-none" />
                </div>
              </div>

              <div class="grid grid-cols-6 gap-3">
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">螺纹类型代码</Label>
                  <Input v-model="formData.end_type_code" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">螺纹类型符号</Label>
                  <Input v-model="formData.end_type_sign" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">管端类型代码</Label>
                  <Input v-model="formData.thread_type_code" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">管端类型符号</Label>
                  <Input v-model="formData.thread_type_sign" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">接箍类型代码</Label>
                  <Input v-model="formData.coupling_type_code" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">接箍类型符号</Label>
                  <Input v-model="formData.coupling_type_sign" class="h-8 flex-1 shadow-none" />
                </div>
              </div>

              <div class="grid grid-cols-6 gap-3">
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">螺纹表面处理方式代码</Label>
                  <Input
                    v-model="formData.thread_face_treat_mode_code"
                    class="h-8 flex-1 shadow-none"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">螺纹表面处理方式</Label>
                  <Input v-model="formData.thread_face_treat_mode" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">订货长度起</Label>
                  <Input v-model="formData.length_from" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">订货长度止</Label>
                  <Input v-model="formData.length_to" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">订货计量单位代码</Label>
                  <Input v-model="formData.order_unit_code" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">订货计量单位</Label>
                  <Input v-model="formData.order_unit" class="h-8 flex-1 shadow-none" />
                </div>
              </div>

              <div class="grid grid-cols-6 gap-3">
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">订货数量</Label>
                  <Input v-model="formData.order_qty" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">订货根数</Label>
                  <Input v-model="formData.order_tube" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">订货重量</Label>
                  <Input v-model="formData.order_weight" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">定尺订货重量</Label>
                  <Input v-model="formData.fixed_order_weight" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">非定尺订货重量</Label>
                  <Input v-model="formData.unfixed_order_weight" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">提货公差单位代码</Label>
                  <Input
                    v-model="formData.delivery_tolerance_code"
                    class="h-8 flex-1 shadow-none"
                  />
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">提货公差单位</Label>
                  <Input v-model="formData.delivery_tolerance_unit" class="h-8 w-16 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">提货公差起-至</Label>
                  <Input v-model="formData.delivery_tolerance_from" class="h-8 w-16 shadow-none" />
                  <span class="font-bold text-[#333333]">-</span>
                  <Input v-model="formData.delivery_tolerance_to" class="h-8 w-16 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">短尺率</Label>
                  <Input v-model="formData.short_rate" class="h-8 w-12 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">短尺长度起-至</Label>
                  <Input v-model="formData.short_from" class="h-8 w-20 shadow-none" />
                  <span class="font-bold text-[#333333]">-</span>
                  <Input v-model="formData.short_to" class="h-8 w-20 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">最大单捆重量</Label>
                  <Input v-model="formData.single_bundle_weight_max" class="h-8 w-20 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">最大单捆根数</Label>
                  <Input v-model="formData.single_bundle_tube_max" class="h-8 w-14 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">涂油代码</Label>
                  <Input v-model="formData.oil_code" class="h-8 w-40 shadow-none" />
                </div>
                <div class="flex min-w-[18rem] flex-1 items-center gap-2">
                  <Label :class="baseLabelClass">涂油正文</Label>
                  <Input v-model="formData.oil_type" class="h-8 flex-1 shadow-none" />
                </div>
              </div>

              <div class="flex items-center gap-2">
                <Label :class="baseLabelClass">压印要求</Label>
                <Input v-model="formData.stamp_req" class="h-8 flex-1 shadow-none" />
              </div>

              <div class="flex items-center gap-2">
                <Label :class="baseLabelClass">喷印要求</Label>
                <Input v-model="formData.stencil_req" class="h-8 flex-1 shadow-none" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">标签要求1</Label>
                  <Input v-model="formData.label_req_1" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">标签要求2</Label>
                  <Input v-model="formData.label_req_2" class="h-8 flex-1 shadow-none" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">标签要求3</Label>
                  <Input v-model="formData.label_req_3" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">标签要求4</Label>
                  <Input v-model="formData.label_req_4" class="h-8 flex-1 shadow-none" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">标签要求5</Label>
                  <Input v-model="formData.label_req_5" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">标签要求6</Label>
                  <Input v-model="formData.label_req_6" class="h-8 flex-1 shadow-none" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">标签要求7</Label>
                  <Input v-model="formData.label_req_7" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">标签要求8</Label>
                  <Input v-model="formData.label_req_8" class="h-8 flex-1 shadow-none" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">质量特殊要求</Label>
                  <Input v-model="formData.qual_special_req" class="h-8 flex-1 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">生产特殊要求</Label>
                  <Input v-model="formData.produce_special_req" class="h-8 flex-1 shadow-none" />
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-4">
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">色环</Label>
                  <Input v-model="formData.color_circle" class="h-8 w-32 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">色环位置</Label>
                  <Input v-model="formData.color_circle_pos" class="h-8 w-32 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">标准水压压力(MPA)</Label>
                  <Input v-model="formData.std_pressure_mpa" class="h-8 w-16 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">标准水压压力(PSI)</Label>
                  <Input v-model="formData.std_pressure_psi" class="h-8 w-20 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">最小稳压时间</Label>
                  <Input v-model="formData.stabilivolt_time_min" class="h-8 w-16 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">退火标志</Label>
                  <Input v-model="formData.anneal_flag" class="h-8 w-20 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">米重</Label>
                  <Input v-model="formData.weight_per_meter" class="h-8 w-20 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">EW值</Label>
                  <Input v-model="formData.weight_ew" class="h-8 w-20 shadow-none" />
                </div>
                <div class="flex items-center gap-2">
                  <Label :class="baseLabelClass">名义重量</Label>
                  <Input v-model="formData.theory_weight_eng" class="h-8 w-20 shadow-none" />
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 border-t border-[#a5a5a5] pt-3">
            <Button class="min-w-24" @click="handleSetCurrentContract">设为当前合同</Button>
            <Button class="min-w-24" @click="handleContractAdd">确认新增</Button>
            <Button class="min-w-24" @click="handleContractModify">确认修改</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted, onUnmounted } from 'vue';
import Button from '@/components/custom/WinButton.vue';
import Input from '@/components/custom/WinInput.vue';
import WinSelect from '@/components/custom/WinSelect.vue';
import { Label } from '@/components/ui/label';
import { getOrderNos, getItemNos, getOrderData, updateOrderData, createOrderData } from '@/api';
import type { DataPushMessage, OrderData } from '@gt4_web/shared';
import type { SetCurrentContractCmd, RequestOrderDataCmd } from '@gt4_web/shared';
import { useWebSocket } from '@/services/websocket';

const { subscribe, sendUserCommand, onDataPush, offDataPush } = useWebSocket();

const baseLabelClass = 'whitespace-nowrap text-[15px]';
const REQUEST_ORDER_COOLDOWN_MS = 2000;

// 缓存查询到的完整记录，修改时以此为基础合并表单数据
const cachedOrderData = ref<OrderData | null>(null);
const requestOrderResultArmed = ref(false);
let lastRequestOrderAt = 0;
let requestOrderTimeoutId: ReturnType<typeof window.setTimeout> | null = null;

function clearRequestOrderTimeout() {
  if (requestOrderTimeoutId == null) {
    return;
  }

  window.clearTimeout(requestOrderTimeoutId);
  requestOrderTimeoutId = null;
}

function armRequestOrderTimeout() {
  clearRequestOrderTimeout();
  requestOrderTimeoutId = window.setTimeout(() => {
    requestOrderTimeoutId = null;

    if (!requestOrderResultArmed.value) {
      return;
    }

    requestOrderResultArmed.value = false;
    window.alert('申请合同失败');
  }, REQUEST_ORDER_COOLDOWN_MS);
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const today = new Date();
const tenDaysAgo = new Date();
tenDaysAgo.setDate(today.getDate() - 10);

// 合同申请表单
const requestOrder = reactive({
  orderNo: '',
  itemNo: '1',
});

// 合同查询表单
const queryForm = reactive({
  orderNo: '',
  itemNo: '',
  dateFrom: formatDateForInput(tenDaysAgo),
  dateTo: formatDateForInput(today),
});

// 下拉选项
const orderNoOptions = ref<string[]>([]);
const itemNoOptions = ref<string[]>([]);
const prodCNameOptions = ref<string[]>([]);

// 合同明细表单数据
const formData = reactive({
  // 第1行
  order_no: '',
  item_no: '',
  roll_no: '',
  diameter: '',
  wall_thickness: '',
  order_no_old: '',

  // 第2行
  prod_code: '',
  prod_cname: '',
  heat_treat_code: '',
  heat_treat_text: '',

  // 第3行
  std_sg_code: '',
  std_text: '',

  // 第4行
  sg_text: '',
  mat_no: '',
  mat_text: '',

  // 第5行
  end_type_code: '',
  end_type_sign: '',
  thread_type_code: '',
  thread_type_sign: '',
  coupling_type_code: '',
  coupling_type_sign: '',

  // 第6行
  thread_face_treat_mode_code: '',
  thread_face_treat_mode: '',
  length_from: '',
  length_to: '',
  order_unit_code: '',
  order_unit: '',

  // 第7行
  order_qty: '',
  order_tube: '',
  order_weight: '',
  fixed_order_weight: '',
  unfixed_order_weight: '',
  delivery_tolerance_code: '',

  // 第8行
  delivery_tolerance_unit: '',
  delivery_tolerance_from: '',
  delivery_tolerance_to: '',
  short_rate: '',
  short_from: '',
  short_to: '',
  single_bundle_weight_max: '',
  single_bundle_tube_max: '',

  // 第9行
  oil_code: '',
  oil_type: '',

  // 第10-11行
  stamp_req: '',
  stencil_req: '',

  // 标签要求
  label_req_1: '',
  label_req_2: '',
  label_req_3: '',
  label_req_4: '',
  label_req_5: '',
  label_req_6: '',
  label_req_7: '',
  label_req_8: '',

  // 质量/生产特殊要求
  qual_special_req: '',
  produce_special_req: '',

  // 色环
  color_circle: '',
  color_circle_pos: '',

  // 水压/物理参数
  std_pressure_mpa: '',
  std_pressure_psi: '',
  stabilivolt_time_min: '',
  anneal_flag: '',
  weight_per_meter: '',
  weight_ew: '',
  theory_weight_eng: '',
});

// 辅助函数：字符串转数字，空字符串返回 null
function toNum(val: string): number | null {
  if (val === '' || val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function toStr(val: string): string | null {
  return val === '' ? null : val;
}

function insertUniqueOption(options: string[], value: string): string[] {
  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return options;
  }

  if (options.includes(normalizedValue)) {
    return options;
  }

  return [normalizedValue, ...options];
}

function syncRequestedOrderIntoQueryOptions() {
  orderNoOptions.value = insertUniqueOption(orderNoOptions.value, requestOrder.orderNo);

  if (queryForm.orderNo === requestOrder.orderNo) {
    itemNoOptions.value = insertUniqueOption(itemNoOptions.value, requestOrder.itemNo);
  }
}

async function refreshQueryOptionsAfterRequest() {
  if (!queryForm.dateFrom || !queryForm.dateTo) {
    return;
  }

  try {
    orderNoOptions.value = await getOrderNos(queryForm.dateFrom, queryForm.dateTo);

    if (queryForm.orderNo === requestOrder.orderNo && requestOrder.orderNo) {
      itemNoOptions.value = await getItemNos(
        requestOrder.orderNo,
        queryForm.dateFrom,
        queryForm.dateTo,
      );
    }
  } catch (err) {
    console.error('刷新合同下拉选项失败', err);
  }
}

function isFailedRequestOrderResultMessage(value: string): boolean {
  return /失败|fail|error|不存在|无效/i.test(value);
}

// 表单数据 -> 本页面编辑的字段
function formFields() {
  return {
    order_no: formData.order_no,
    item_no: formData.item_no,
    roll_no: toStr(formData.roll_no),
    diameter: toNum(formData.diameter),
    wall_thickness: toNum(formData.wall_thickness),
    order_no_old: toStr(formData.order_no_old),
    prod_code: toStr(formData.prod_code),
    prod_cname: toStr(formData.prod_cname),
    heat_treat_code: toStr(formData.heat_treat_code),
    heat_treat_text: toStr(formData.heat_treat_text),
    std_sg_code: toStr(formData.std_sg_code),
    std_text: toStr(formData.std_text),
    sg_text: toStr(formData.sg_text),
    mat_no: toStr(formData.mat_no),
    mat_text: toStr(formData.mat_text),
    thread_type_code: toStr(formData.thread_type_code),
    thread_type_sign: toStr(formData.thread_type_sign),
    end_type_code: toStr(formData.end_type_code),
    end_type_sign: toStr(formData.end_type_sign),
    coupling_type_code: toStr(formData.coupling_type_code),
    coupling_type_sign: toStr(formData.coupling_type_sign),
    thread_face_treat_mode_code: toStr(formData.thread_face_treat_mode_code),
    thread_face_treat_mode: toStr(formData.thread_face_treat_mode),
    length_from: toNum(formData.length_from),
    length_to: toNum(formData.length_to),
    order_unit_code: toStr(formData.order_unit_code),
    order_unit: toStr(formData.order_unit),
    order_qty: toNum(formData.order_qty),
    order_tube: toNum(formData.order_tube),
    order_weight: toNum(formData.order_weight),
    fixed_order_weight: toNum(formData.fixed_order_weight),
    unfixed_order_weight: toNum(formData.unfixed_order_weight),
    delivery_tolerance_code: toStr(formData.delivery_tolerance_code),
    delivery_tolerance_unit: toStr(formData.delivery_tolerance_unit),
    delivery_tolerance_from: toNum(formData.delivery_tolerance_from),
    delivery_tolerance_to: toNum(formData.delivery_tolerance_to),
    short_rate: toNum(formData.short_rate),
    short_from: toNum(formData.short_from),
    short_to: toNum(formData.short_to),
    single_bundle_weight_max: toNum(formData.single_bundle_weight_max),
    single_bundle_tube_max: toNum(formData.single_bundle_tube_max),
    oil_code: toStr(formData.oil_code),
    oil_type: toStr(formData.oil_type),
    stamp_req: toStr(formData.stamp_req),
    stencil_req: toStr(formData.stencil_req),
    label_req_1: toStr(formData.label_req_1),
    label_req_2: toStr(formData.label_req_2),
    label_req_3: toStr(formData.label_req_3),
    label_req_4: toStr(formData.label_req_4),
    label_req_5: toStr(formData.label_req_5),
    label_req_6: toStr(formData.label_req_6),
    label_req_7: toStr(formData.label_req_7),
    label_req_8: toStr(formData.label_req_8),
    qual_special_req: toStr(formData.qual_special_req),
    produce_special_req: toStr(formData.produce_special_req),
    std_pressure_mpa: toNum(formData.std_pressure_mpa),
    std_pressure_psi: toNum(formData.std_pressure_psi),
    stabilivolt_time_min: toNum(formData.stabilivolt_time_min),
    anneal_flag: toStr(formData.anneal_flag),
    weight_per_meter: toNum(formData.weight_per_meter),
    weight_ew: toNum(formData.weight_ew),
    theory_weight_eng: toNum(formData.theory_weight_eng),
    color_circle: toStr(formData.color_circle),
    color_circle_pos: toStr(formData.color_circle_pos),
  };
}

// 修改时：基于缓存完整记录，合并本页面编辑的字段
function formToApiForUpdate(): OrderData {
  return {
    ...cachedOrderData.value!,
    ...formFields(),
  };
}

// 新增时：只提供本页面字段，其余由数据库默认值填充
function formToApiForCreate(): OrderData {
  return formFields() as OrderData;
}

// API 数据 -> 表单数据
function apiToForm(data: OrderData) {
  formData.order_no = data.order_no ?? '';
  formData.item_no = data.item_no ?? '';
  formData.roll_no = data.roll_no ?? '';
  formData.diameter = data.diameter != null ? String(data.diameter) : '';
  formData.wall_thickness = data.wall_thickness != null ? String(data.wall_thickness) : '';
  formData.order_no_old = data.order_no_old ?? '';
  formData.prod_code = data.prod_code ?? '';
  formData.prod_cname = data.prod_cname ?? '';
  formData.heat_treat_code = data.heat_treat_code ?? '';
  formData.heat_treat_text = data.heat_treat_text ?? '';
  formData.std_sg_code = data.std_sg_code ?? '';
  formData.std_text = data.std_text ?? '';
  formData.sg_text = data.sg_text ?? '';
  formData.mat_no = data.mat_no ?? '';
  formData.mat_text = data.mat_text ?? '';
  formData.end_type_code = data.end_type_code ?? '';
  formData.end_type_sign = data.end_type_sign ?? '';
  formData.thread_type_code = data.thread_type_code ?? '';
  formData.thread_type_sign = data.thread_type_sign ?? '';
  formData.coupling_type_code = data.coupling_type_code ?? '';
  formData.coupling_type_sign = data.coupling_type_sign ?? '';
  formData.thread_face_treat_mode_code = data.thread_face_treat_mode_code ?? '';
  formData.thread_face_treat_mode = data.thread_face_treat_mode ?? '';
  formData.length_from = data.length_from != null ? String(data.length_from) : '';
  formData.length_to = data.length_to != null ? String(data.length_to) : '';
  formData.order_unit_code = data.order_unit_code ?? '';
  formData.order_unit = data.order_unit ?? '';
  formData.order_qty = data.order_qty != null ? String(data.order_qty) : '';
  formData.order_tube = data.order_tube != null ? String(data.order_tube) : '';
  formData.order_weight = data.order_weight != null ? String(data.order_weight) : '';
  formData.fixed_order_weight =
    data.fixed_order_weight != null ? String(data.fixed_order_weight) : '';
  formData.unfixed_order_weight =
    data.unfixed_order_weight != null ? String(data.unfixed_order_weight) : '';
  formData.delivery_tolerance_code = data.delivery_tolerance_code ?? '';
  formData.delivery_tolerance_unit = data.delivery_tolerance_unit ?? '';
  formData.delivery_tolerance_from =
    data.delivery_tolerance_from != null ? String(data.delivery_tolerance_from) : '';
  formData.delivery_tolerance_to =
    data.delivery_tolerance_to != null ? String(data.delivery_tolerance_to) : '';
  formData.short_rate = data.short_rate != null ? String(data.short_rate) : '';
  formData.short_from = data.short_from != null ? String(data.short_from) : '';
  formData.short_to = data.short_to != null ? String(data.short_to) : '';
  formData.single_bundle_weight_max =
    data.single_bundle_weight_max != null ? String(data.single_bundle_weight_max) : '';
  formData.single_bundle_tube_max =
    data.single_bundle_tube_max != null ? String(data.single_bundle_tube_max) : '';
  formData.oil_code = data.oil_code ?? '';
  formData.oil_type = data.oil_type ?? '';
  formData.stamp_req = data.stamp_req ?? '';
  formData.stencil_req = data.stencil_req ?? '';
  formData.label_req_1 = data.label_req_1 ?? '';
  formData.label_req_2 = data.label_req_2 ?? '';
  formData.label_req_3 = data.label_req_3 ?? '';
  formData.label_req_4 = data.label_req_4 ?? '';
  formData.label_req_5 = data.label_req_5 ?? '';
  formData.label_req_6 = data.label_req_6 ?? '';
  formData.label_req_7 = data.label_req_7 ?? '';
  formData.label_req_8 = data.label_req_8 ?? '';
  formData.qual_special_req = data.qual_special_req ?? '';
  formData.produce_special_req = data.produce_special_req ?? '';
  formData.std_pressure_mpa = data.std_pressure_mpa != null ? String(data.std_pressure_mpa) : '';
  formData.std_pressure_psi = data.std_pressure_psi != null ? String(data.std_pressure_psi) : '';
  formData.stabilivolt_time_min =
    data.stabilivolt_time_min != null ? String(data.stabilivolt_time_min) : '';
  formData.anneal_flag = data.anneal_flag ?? '';
  formData.weight_per_meter = data.weight_per_meter != null ? String(data.weight_per_meter) : '';
  formData.weight_ew = data.weight_ew != null ? String(data.weight_ew) : '';
  formData.theory_weight_eng = data.theory_weight_eng != null ? String(data.theory_weight_eng) : '';
  formData.color_circle = data.color_circle ?? '';
  formData.color_circle_pos = data.color_circle_pos ?? '';
}

// 当查询日期范围改变后，查询合同号列表
watch(
  () => [queryForm.dateFrom, queryForm.dateTo],
  async ([dateFrom, dateTo]) => {
    if (!dateFrom || !dateTo) return;
    try {
      const nos = await getOrderNos(dateFrom, dateTo);
      orderNoOptions.value = nos;
      // 清空已选合同号和项目号
      queryForm.orderNo = '';
      queryForm.itemNo = '';
      itemNoOptions.value = [];
    } catch (err) {
      console.error('查询合同号失败', err);
    }
  },
  { immediate: true },
);

// 当合同号下拉列表选择项改变后，查询项目号列表
watch(
  () => queryForm.orderNo,
  async (orderNo) => {
    if (!orderNo) {
      itemNoOptions.value = [];
      queryForm.itemNo = '';
      return;
    }
    try {
      const nos = await getItemNos(orderNo, queryForm.dateFrom, queryForm.dateTo);
      itemNoOptions.value = nos;
      queryForm.itemNo = '';
    } catch (err) {
      console.error('查询项目号失败', err);
    }
  },
);

// 事件处理
function handleRequest() {
  const now = Date.now();
  if (now - lastRequestOrderAt < REQUEST_ORDER_COOLDOWN_MS) {
    window.alert('2秒内禁止重复申请');
    return;
  }

  lastRequestOrderAt = now;
  requestOrderResultArmed.value = true;
  armRequestOrderTimeout();

  const cmd: RequestOrderDataCmd = {
    order_no: requestOrder.orderNo,
    item_no: requestOrder.itemNo,
  };
  sendUserCommand('RequestOrderDataCmd', cmd);

  console.log('request', requestOrder);
}

// 点击查询按钮，根据合同号、项目号查询合同明细
async function handleQuery() {
  if (!queryForm.orderNo || !queryForm.itemNo) {
    alert('请选择合同号和项目号');
    return;
  }
  try {
    const data = await getOrderData(queryForm.orderNo, queryForm.itemNo);
    cachedOrderData.value = data;
    apiToForm(data);
  } catch (err) {
    console.error('查询合同数据失败', err);
    alert('查询合同数据失败');
  }
}

function handleSetCurrentContract() {
  const cmd: SetCurrentContractCmd = {
    order_no: formData.order_no,
    item_no: formData.item_no,
  };
  // 发送设置当前合同命令
  sendUserCommand('SetCurrentContractCmd', cmd);
  console.log('set current contract', formData.order_no);
}

// 点击确认新增按钮，新增一条合同记录
async function handleContractAdd() {
  if (!formData.order_no || !formData.item_no) {
    alert('合同号和项目号不能为空');
    return;
  }
  try {
    const result = await createOrderData(formToApiForCreate());
    alert(result.message);
  } catch (err) {
    console.error('新增合同数据失败', err);
    alert('新增合同数据失败');
  }
}

// 点击确认修改按钮，保存当前记录
async function handleContractModify() {
  if (!cachedOrderData.value) {
    alert('请先查询合同数据');
    return;
  }
  try {
    const result = await updateOrderData(formToApiForUpdate());
    alert(result.message);
  } catch (err) {
    console.error('保存合同数据失败', err);
    alert('保存合同数据失败');
  }
}

async function handleRequestOrderResultPush(message: DataPushMessage) {
  if (message.tag !== 'REQUEST_ORDER_RESULT') {
    return;
  }

  if (!requestOrderResultArmed.value) {
    return;
  }

  clearRequestOrderTimeout();
  requestOrderResultArmed.value = false;

  if (message.hasValue === false || message.value == null) {
    window.alert('REQUEST_ORDER_RESULT 事件已触发');
    return;
  }

  if (!isFailedRequestOrderResultMessage(message.value)) {
    syncRequestedOrderIntoQueryOptions();
    await refreshQueryOptionsAfterRequest();
  }

  window.alert(message.value);
}

// WebSocket 是全局单例；跳转到不订阅实时数据的页面时，需要在卸载时显式清空当前订阅。
onMounted(() => {
  onDataPush(handleRequestOrderResultPush);
  subscribe(['REQUEST_ORDER_RESULT']);
});

onUnmounted(() => {
  clearRequestOrderTimeout();
  requestOrderResultArmed.value = false;
  offDataPush(handleRequestOrderResultPush);
  subscribe([]);
});
</script>
