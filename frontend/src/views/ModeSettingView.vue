<template>
  <div class="mode-setting-view w-full overflow-hidden bg-[#d8d8d8] p-2">
    <div
      class="flex h-full min-h-0 flex-col rounded-[3px] border border-[#868686] bg-[#d3d3d3] mt-4 px-2 pt-[14px] pb-2 shadow-[inset_0_1px_0_#f7f7f7]"
    >
      <div class="flex min-h-0 flex-1 gap-4 pt-2">
        <section class="panel-shell w-[430px] flex-shrink-0">
          <div class="panel-title">标签打印</div>

          <div class="flex min-h-0 flex-1 flex-col">
            <div class="grid grid-cols-[4.5rem_minmax(0,1fr)_7rem] items-center gap-2">
              <Label :class="baseLabelClass">合同号：</Label>
              <Input v-model="formData.order_no" class="h-8 shadow-none" />
              <Button class="min-w-24" @click="handleQuery"> 查询 </Button>

              <Label :class="baseLabelClass">项目号：</Label>
              <Input v-model="formData.item_no" class="h-8 shadow-none" />
              <Button class="min-w-24" @click="handleToCurrentOrder"> 返回当前合同 </Button>
            </div>

            <div class="mt-4">
              <Label :class="baseLabelClass">自由格式设定:</Label>
            </div>

            <div
              class="mt-2 flex min-h-0 flex-1 flex-col gap-2 rounded-[2px] border border-[#8a8a8a] bg-[#d8d8d8] p-2 shadow-[inset_0_1px_0_#f4f4f4]"
            >
              <div class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2">
                <Label :class="lineNoClass">1.</Label>
                <Input v-model="formData.label_req_1_manual" class="h-8 shadow-none" />
              </div>
              <div class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2">
                <Label :class="lineNoClass">2.</Label>
                <Input v-model="formData.label_req_2_manual" class="h-8 shadow-none" />
              </div>
              <div class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2">
                <Label :class="lineNoClass">3.</Label>
                <Input v-model="formData.label_req_3_manual" class="h-8 shadow-none" />
              </div>
              <div class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2">
                <Label :class="lineNoClass">4.</Label>
                <Input v-model="formData.label_req_4_manual" class="h-8 shadow-none" />
              </div>
              <div class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2">
                <Label :class="lineNoClass">5.</Label>
                <Input v-model="formData.label_req_5_manual" class="h-8 shadow-none" />
              </div>
              <div class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2">
                <Label :class="lineNoClass">6.</Label>
                <Input v-model="formData.label_req_6_manual" class="h-8 shadow-none" />
              </div>
              <div class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2">
                <Label :class="lineNoClass">7.</Label>
                <Input v-model="formData.label_req_7_manual" class="h-8 shadow-none" />
              </div>
              <div class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2">
                <Label :class="lineNoClass">8.</Label>
                <Input v-model="formData.label_req_8_manual" class="h-8 shadow-none" />
              </div>
            </div>

            <div class="mt-3 grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-2">
              <Label :class="baseLabelClass">标签长度格式：</Label>
              <WinRadioGroup
                v-model="formData.label_length_type"
                :options="metricImperialOptions"
              />
            </div>

            <div class="mt-2 grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-2">
              <Label :class="baseLabelClass">标签重量格式：</Label>
              <WinRadioGroup
                v-model="formData.label_weight_type"
                :options="metricImperialOptions"
              />
            </div>

            <div class="mt-2 grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-2">
              <Label :class="baseLabelClass">塑料标签格式：</Label>
              <WinRadioGroup v-model="formData.label_type" :options="labelTypeOptions" />
            </div>
          </div>
        </section>

        <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-visible">
          <section class="panel-shell flex min-h-0 flex-1 flex-col">
            <div class="panel-title">针刻印</div>

            <div class="flex min-h-0 flex-1 flex-col mt-2">
              <Label :class="baseLabelClass">针刻印格式设定:</Label>

              <div class="mt-2 flex min-h-0 flex-1 flex-col gap-2">
                <div class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2">
                  <Label :class="lineNoClass">1.</Label>
                  <Input v-model="formData.stamp_req_1_manual" class="h-8 shadow-none" />
                </div>
                <div class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2">
                  <Label :class="lineNoClass">2.</Label>
                  <Input v-model="formData.stamp_req_2_manual" class="h-8 shadow-none" />
                </div>
                <div class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2">
                  <Label :class="lineNoClass">3.</Label>
                  <Input v-model="formData.stamp_req_3_manual" class="h-8 shadow-none" />
                </div>
                <div class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2">
                  <Label :class="lineNoClass">4.</Label>
                  <Input v-model="formData.stamp_req_4_manual" class="h-8 shadow-none" />
                </div>
                <div class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2">
                  <Label :class="lineNoClass">5.</Label>
                  <Input v-model="formData.stamp_req_5_manual" class="h-8 shadow-none" />
                </div>
                <div class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2">
                  <Label :class="lineNoClass">6.</Label>
                  <Input v-model="formData.stamp_req_6_manual" class="h-8 shadow-none" />
                </div>
                <div class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2">
                  <Label :class="lineNoClass">7.</Label>
                  <Input v-model="formData.stamp_req_7_manual" class="h-8 shadow-none" />
                </div>
                <div class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2">
                  <Label :class="lineNoClass">8.</Label>
                  <Input v-model="formData.stamp_req_8_manual" class="h-8 shadow-none" />
                </div>
              </div>

              <div class="mt-4 grid grid-cols-[3rem_minmax(0,1fr)] items-start gap-2">
                <Label :class="baseLabelClass">要求：</Label>
                <textarea
                  v-model="formData.stamp_req"
                  readonly
                  class="win-textarea win-textarea-readonly h-24"
                />
              </div>
            </div>
          </section>

          <section class="panel-shell flex-shrink-0">
            <div class="panel-title">喷印要求</div>

            <div>
              <textarea
                v-model="formData.stencil_req_manual"
                class="win-textarea win-textarea-edit h-28"
              />
            </div>
          </section>
        </div>

        <div class="flex w-[220px] min-h-0 flex-shrink-0 flex-col gap-4 overflow-visible">
          <section class="panel-shell flex min-h-0 flex-1 flex-col">
            <div class="panel-title">通配符说明</div>

            <div class="flex min-h-0 flex-1 flex-col gap-2">
              <div
                v-for="item in wildcardList"
                :key="item.code"
                class="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-2 rounded-[2px] border border-[#8a8a8a] bg-[#efefef] px-2 py-1 shadow-[inset_0_1px_0_#ffffff]"
              >
                <span class="text-sm font-bold text-[#6f1616]">{{ item.code }}</span>
                <span class="text-sm font-bold text-[#333333]">{{ item.desc }}</span>
              </div>
            </div>
          </section>

          <section class="flex-shrink-0">
            <div class="flex items-center justify-center">
              <Button class="min-w-28" @click="handleSaveFormat"> 保存 </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import Button from '@/components/custom/WinButton.vue';
import Input from '@/components/custom/WinInput.vue';
import WinRadioGroup from '@/components/custom/WinRadioGroup.vue';
import { Label } from '@/components/ui/label';
import { getOrderData, updateOrderData } from '@/api';
import type { OrderData } from '@gt4_web/shared';

// 缓存查询到的完整记录，保存时以此为基础合并表单修改
const cachedOrderData = ref<OrderData | null>(null);

const baseLabelClass = 'text-[15px] font-bold text-[#111827] whitespace-nowrap';
const accentLabelClass = 'text-[15px] font-bold text-[#6f1616] whitespace-nowrap';
const lineNoClass = 'text-xs font-bold whitespace-nowrap text-right';

const metricImperialOptions = [
  { label: '公制', value: '0' },
  { label: '英制', value: '1' },
] as const;

const labelTypeOptions = [
  { label: '固定', value: '0' },
  { label: '自由', value: '1' },
] as const;

// 通配符说明
const wildcardList = [
  { code: '%K:', desc: '捆号' },
  { code: '%G:', desc: '支数' },
  { code: '%M:', desc: '炉号' },
  { code: '%S:', desc: '试批号' },
  { code: '%L:', desc: '长度' },
  { code: '%W:', desc: '重量' },
];

// 表单数据
const formData = reactive({
  // 查询条件
  order_no: '',
  item_no: '',
  // 标签打印格式（8行） - 对应 label_req_1_manual ~ label_req_8_manual
  label_req_1_manual: '',
  label_req_2_manual: '',
  label_req_3_manual: '',
  label_req_4_manual: '',
  label_req_5_manual: '',
  label_req_6_manual: '',
  label_req_7_manual: '',
  label_req_8_manual: '',
  // 标签格式选项 - 0=公制/固定, 1=英制/自由
  label_length_type: '0',
  label_weight_type: '0',
  label_type: '0',
  // 针刻印格式（8行）
  stamp_req_1_manual: '',
  stamp_req_2_manual: '',
  stamp_req_3_manual: '',
  stamp_req_4_manual: '',
  stamp_req_5_manual: '',
  stamp_req_6_manual: '',
  stamp_req_7_manual: '',
  stamp_req_8_manual: '',

  // 针刻印要求（只读）
  stamp_req: '',
  // 喷印要求
  stencil_req: '',
  // 人工喷印要求
  stencil_req_manual: '',
});

// API 数据 -> 表单数据
function apiToForm(data: OrderData) {
  formData.order_no = data.order_no ?? '';
  formData.item_no = data.item_no ?? '';
  // 标签打印 - 自由格式使用 manual 字段
  formData.label_req_1_manual = data.label_req_1_manual ?? '';
  formData.label_req_2_manual = data.label_req_2_manual ?? '';
  formData.label_req_3_manual = data.label_req_3_manual ?? '';
  formData.label_req_4_manual = data.label_req_4_manual ?? '';
  formData.label_req_5_manual = data.label_req_5_manual ?? '';
  formData.label_req_6_manual = data.label_req_6_manual ?? '';
  formData.label_req_7_manual = data.label_req_7_manual ?? '';
  formData.label_req_8_manual = data.label_req_8_manual ?? '';
  // 标签格式选项
  formData.label_length_type = String(data.label_length_type ?? 0);
  formData.label_weight_type = String(data.label_weight_type ?? 0);
  formData.label_type = String(data.label_type ?? 0);
  // 针刻印格式
  formData.stamp_req_1_manual = data.stamp_req_1_manual ?? '';
  formData.stamp_req_2_manual = data.stamp_req_2_manual ?? '';
  formData.stamp_req_3_manual = data.stamp_req_3_manual ?? '';
  formData.stamp_req_4_manual = data.stamp_req_4_manual ?? '';
  formData.stamp_req_5_manual = data.stamp_req_5_manual ?? '';
  formData.stamp_req_6_manual = data.stamp_req_6_manual ?? '';
  formData.stamp_req_7_manual = data.stamp_req_7_manual ?? '';
  formData.stamp_req_8_manual = data.stamp_req_8_manual ?? '';
  // 针刻印要求（只读）
  formData.stamp_req = data.stamp_req ?? '';
  // 喷印要求
  formData.stencil_req = data.stencil_req ?? '';
  formData.stencil_req_manual = data.stencil_req_manual ?? '';
}

// 表单数据 -> API 数据（基于缓存的完整记录，只覆盖本页面编辑的字段）
function formToApi(): OrderData {
  return {
    ...cachedOrderData.value!,
    label_req_1_manual: formData.label_req_1_manual || null,
    label_req_2_manual: formData.label_req_2_manual || null,
    label_req_3_manual: formData.label_req_3_manual || null,
    label_req_4_manual: formData.label_req_4_manual || null,
    label_req_5_manual: formData.label_req_5_manual || null,
    label_req_6_manual: formData.label_req_6_manual || null,
    label_req_7_manual: formData.label_req_7_manual || null,
    label_req_8_manual: formData.label_req_8_manual || null,
    label_length_type: Number(formData.label_length_type),
    label_weight_type: Number(formData.label_weight_type),
    label_type: Number(formData.label_type),
    stamp_req_1_manual: formData.stamp_req_1_manual || null,
    stamp_req_2_manual: formData.stamp_req_2_manual || null,
    stamp_req_3_manual: formData.stamp_req_3_manual || null,
    stamp_req_4_manual: formData.stamp_req_4_manual || null,
    stamp_req_5_manual: formData.stamp_req_5_manual || null,
    stamp_req_6_manual: formData.stamp_req_6_manual || null,
    stamp_req_7_manual: formData.stamp_req_7_manual || null,
    stamp_req_8_manual: formData.stamp_req_8_manual || null,
    stamp_req: formData.stamp_req || null,
    stencil_req: formData.stencil_req || null,
    stencil_req_manual: formData.stencil_req_manual || null,
  };
}

// 点击查询按钮
async function handleQuery() {
  if (!formData.order_no || !formData.item_no) {
    alert('请输入合同号和项目号');
    return;
  }
  try {
    const data = await getOrderData(formData.order_no, formData.item_no);
    cachedOrderData.value = data;
    apiToForm(data);
  } catch (err) {
    console.error('查询合同数据失败', err);
    alert('查询合同数据失败');
  }
}

function handleToCurrentOrder() {
  console.log('return to current order');
}

// 点击保存按钮
async function handleSaveFormat() {
  if (!cachedOrderData.value) {
    alert('请先查询合同数据');
    return;
  }
  try {
    const result = await updateOrderData(formToApi());
    alert(result.message);
  } catch (err) {
    console.error('保存数据失败', err);
    alert('保存数据失败');
  }
}
</script>

<style scoped>
.mode-setting-view {
  font-family: 'Microsoft YaHei', system-ui, sans-serif;
}

.panel-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid #868686;
  border-radius: 3px;
  background: #d3d3d3;
  padding: 14px 12px 12px;
  box-shadow: inset 0 1px 0 #f7f7f7;
}

.panel-title {
  position: absolute;
  top: -11px;
  left: 12px;
  padding: 0 4px;
  background: #d8d8d8;
  color: #6f1616;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
}

.panel-content {
  border: 1px solid #8a8a8a;
  border-radius: 2px;
  background: #d8d8d8;
  padding: 12px;
  box-shadow: inset 0 1px 0 #f4f4f4;
}

.win-textarea {
  width: 100%;
  resize: none;
  border: 1px solid #7a7a7a;
  border-radius: 2px;
  padding: 8px 10px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  outline: none;
}

.win-textarea:focus {
  border-color: #1d47a4;
}

.win-textarea-readonly {
  background: #f5f5f5;
  color: #333333;
}

.win-textarea-edit {
  background: #ffffff;
  color: #1d47a4;
}
</style>
