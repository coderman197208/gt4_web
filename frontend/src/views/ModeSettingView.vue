<template>
  <div class="h-full w-full flex flex-col overflow-hidden p-4">
    <!-- 主内容区域 -->
    <div class="flex-1 flex gap-4 overflow-hidden">
      <!-- 左侧：标签打印 -->
      <div class="w-[420px] flex-shrink-0">
        <div class="border rounded-lg p-4 relative h-full flex flex-col">
          <div
            class="absolute -top-3 left-4 px-2 bg-white text-sm font-bold text-[1rem] text-red-800"
          >
            标签打印
          </div>

          <!-- 合同号 / 项目号 查询 -->
          <div class="grid grid-cols-[auto_1fr_auto] gap-2 items-center mt-2">
            <Label class="whitespace-nowrap">合同号：</Label>
            <Input v-model="formData.order_no" class="h-8" />
            <Button @click="handleQuery">查询</Button>

            <Label class="whitespace-nowrap">项目号：</Label>
            <Input v-model="formData.item_no" class="h-8" />
            <Button @click="handleToCurrentOrder">返回当前合同</Button>
          </div>

          <!-- 自由格式设定 -->
          <div class="mt-4">
            <Label class="text-sm font-bold">自由格式设定:</Label>
          </div>

          <!-- 8行标签格式输入框 -->
          <div class="border rounded mt-2 p-2 space-y-2 flex-1">
            <!-- <div v-for="i in 8" :key="i" class="flex items-center gap-2">
              <Label class="w-6 text-right font-bold">{{ i }}.</Label>
              <Input v-model="formData.labelReqs[i - 1]" class="flex-1 h-8 font-mono" />
            </div> -->
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">1.</Label>
              <Input v-model="formData.label_req_1" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">2.</Label>
              <Input v-model="formData.label_req_2" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">3.</Label>
              <Input v-model="formData.label_req_3" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">4.</Label>
              <Input v-model="formData.label_req_4" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">5.</Label>
              <Input v-model="formData.label_req_5" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">6.</Label>
              <Input v-model="formData.label_req_6" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">7.</Label>
              <Input v-model="formData.label_req_7" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">8.</Label>
              <Input v-model="formData.label_req_8" class="flex-1" />
            </div>
          </div>

          <!-- 标签长度格式 -->
          <div class="flex items-center gap-2 mt-3">
            <Label class="whitespace-nowrap font-bold">标签长度格式：</Label>
            <RadioGroup v-model="formData.label_length_type" class="flex gap-4">
              <div class="flex items-center gap-1">
                <RadioGroupItem value="0" id="tagLength-metric" />
                <Label for="tagLength-metric">公制</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem value="1" id="tagLength-imperial" />
                <Label for="tagLength-imperial">英制</Label>
              </div>
            </RadioGroup>
          </div>

          <!-- 标签重量格式 -->
          <div class="flex items-center gap-2 mt-2">
            <Label class="whitespace-nowrap font-bold">标签重量格式：</Label>
            <RadioGroup v-model="formData.label_weight_type" class="flex gap-4">
              <div class="flex items-center gap-1">
                <RadioGroupItem value="0" id="tagWeight-metric" />
                <Label for="tagWeight-metric">公制</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem value="1" id="tagWeight-imperial" />
                <Label for="tagWeight-imperial">英制</Label>
              </div>
            </RadioGroup>
          </div>

          <!-- 塑料标签格式 -->
          <div class="flex items-center gap-2 mt-2">
            <Label class="whitespace-nowrap font-bold">塑料标签格式：</Label>
            <RadioGroup v-model="formData.label_type" class="flex gap-4">
              <div class="flex items-center gap-1">
                <RadioGroupItem value="0" id="em-fixed" />
                <Label for="em-fixed">固定</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem value="1" id="em-free" />
                <Label for="em-free">自由</Label>
              </div>
            </RadioGroup>
            <!-- <Button @click="handleSaveLabelFormat" class="ml-auto">保存</Button> -->
          </div>
        </div>
      </div>

      <!-- 中间列：针刻印 + 喷印要求 -->
      <div class="flex-1 flex flex-col gap-4 overflow-hidden">
        <!-- 针刻印 -->
        <div class="border rounded-lg p-4 relative flex-1">
          <div
            class="absolute -top-3 left-4 px-2 bg-white text-sm font-bold text-[1rem] text-red-800"
          >
            针刻印
          </div>

          <div class="mt-2">
            <Label class="text-sm font-bold">针刻印格式设定:</Label>
          </div>

          <!-- 8行针刻印格式输入框 -->
          <div class="mt-2 space-y-2">
            <!-- <div v-for="i in 8" :key="i" class="flex items-center gap-2">
              <Label class="w-6 text-right font-bold">{{ i }}.</Label>
              <Input v-model="formData.stampReqManuls[i - 1]" class="flex-1 h-8 font-mono" />
            </div> -->
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">1.</Label>
              <Input v-model="formData.stamp_req_1_manual" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">2.</Label>
              <Input v-model="formData.stamp_req_2_manual" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">3.</Label>
              <Input v-model="formData.stamp_req_3_manual" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">4.</Label>
              <Input v-model="formData.stamp_req_4_manual" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">5.</Label>
              <Input v-model="formData.stamp_req_5_manual" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">6.</Label>
              <Input v-model="formData.stamp_req_6_manual" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">7.</Label>
              <Input v-model="formData.stamp_req_7_manual" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">8.</Label>
              <Input v-model="formData.stamp_req_8_manual" class="flex-1" />
            </div>
          </div>

          <!-- 针刻印要求 -->
          <div class="mt-3">
            <Label class="font-bold">要求：</Label>
            <textarea
              v-model="formData.stamp_req"
              readonly
              class="mt-1 w-full h-20 border rounded px-3 py-2 text-sm font-mono bg-muted resize-none"
            />
          </div>

          <!-- <div class="flex justify-end mt-2">
            <Button @click="handleSaveStampFormat">保存</Button>
          </div> -->
        </div>

        <!-- 喷印要求 -->
        <div class="border rounded-lg p-4 relative flex-shrink-0">
          <div
            class="absolute -top-3 left-4 px-2 bg-white text-sm font-bold text-[1rem] text-red-800"
          >
            喷印要求
          </div>

          <textarea
            v-model="formData.stencil_req"
            class="mt-1 w-full h-20 border rounded px-3 py-2 text-sm font-mono text-blue-600 resize-none"
          />

          <div class="flex justify-end mt-2">
            <!-- <Button @click="handleSaveSprayFormat">保存</Button> -->
          </div>
        </div>
      </div>

      <div class="flex-1 flex flex-col gap-4 overflow-hidden">
        <!-- 右侧：通配符说明 -->
        <div class="w-[200px] flex-shrink-0">
          <div class="border rounded-lg p-4 relative">
            <div
              class="absolute -top-3 left-4 px-2 bg-white text-sm font-bold text-[1rem] text-red-800"
            >
              通配符说明
            </div>

            <div class="mt-2 space-y-3">
              <div v-for="item in wildcardList" :key="item.code" class="flex items-center gap-2">
                <span class="font-bold w-10">{{ item.code }}</span>
                <span>{{ item.desc }}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Button @click="handleSaveFormat">保存</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getOrderData, updateOrderData } from '@/api';
import type { OrderData } from '@gt4_web/shared';

// 缓存查询到的完整记录，保存时以此为基础合并表单修改
const cachedOrderData = ref<OrderData | null>(null);

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
  label_req_1: '',
  label_req_2: '',
  label_req_3: '',
  label_req_4: '',
  label_req_5: '',
  label_req_6: '',
  label_req_7: '',
  label_req_8: '',
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
  formData.label_req_1 = data.label_req_1_manual ?? '';
  formData.label_req_2 = data.label_req_2_manual ?? '';
  formData.label_req_3 = data.label_req_3_manual ?? '';
  formData.label_req_4 = data.label_req_4_manual ?? '';
  formData.label_req_5 = data.label_req_5_manual ?? '';
  formData.label_req_6 = data.label_req_6_manual ?? '';
  formData.label_req_7 = data.label_req_7_manual ?? '';
  formData.label_req_8 = data.label_req_8_manual ?? '';
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
    label_req_1_manual: formData.label_req_1 || null,
    label_req_2_manual: formData.label_req_2 || null,
    label_req_3_manual: formData.label_req_3 || null,
    label_req_4_manual: formData.label_req_4 || null,
    label_req_5_manual: formData.label_req_5 || null,
    label_req_6_manual: formData.label_req_6 || null,
    label_req_7_manual: formData.label_req_7 || null,
    label_req_8_manual: formData.label_req_8 || null,
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
