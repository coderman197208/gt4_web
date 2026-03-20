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
            <Input v-model="formData.orderNo" class="h-8" />
            <Button @click="handleQuery">查询</Button>

            <Label class="whitespace-nowrap">项目号：</Label>
            <Input v-model="formData.itemNo" class="h-8" />
            <Button @click="handleToCurrentOrder">返回当前合同</Button>
          </div>

          <!-- 自由格式设定 -->
          <div class="mt-4">
            <Label class="text-sm font-bold">自由格式设定:</Label>
          </div>

          <!-- 8行标签格式输入框 -->
          <div class="border rounded mt-2 p-2 space-y-2 flex-1">
            <div v-for="i in 8" :key="i" class="flex items-center gap-2">
              <Label class="w-6 text-right font-bold">{{ i }}.</Label>
              <Input v-model="formData.labelReqs[i - 1]" class="flex-1 h-8 font-mono" />
            </div>
          </div>

          <!-- 标签长度格式 -->
          <div class="flex items-center gap-2 mt-3">
            <Label class="whitespace-nowrap font-bold">标签长度格式：</Label>
            <RadioGroup v-model="formData.tagLengthType" class="flex gap-4">
              <div class="flex items-center gap-1">
                <RadioGroupItem value="metric" id="tagLength-metric" />
                <Label for="tagLength-metric">公制</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem value="imperial" id="tagLength-imperial" />
                <Label for="tagLength-imperial">英制</Label>
              </div>
            </RadioGroup>
          </div>

          <!-- 标签重量格式 -->
          <div class="flex items-center gap-2 mt-2">
            <Label class="whitespace-nowrap font-bold">标签重量格式：</Label>
            <RadioGroup v-model="formData.tagWeightType" class="flex gap-4">
              <div class="flex items-center gap-1">
                <RadioGroupItem value="metric" id="tagWeight-metric" />
                <Label for="tagWeight-metric">公制</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem value="imperial" id="tagWeight-imperial" />
                <Label for="tagWeight-imperial">英制</Label>
              </div>
            </RadioGroup>
          </div>

          <!-- 塑料标签格式 -->
          <div class="flex items-center gap-2 mt-2">
            <Label class="whitespace-nowrap font-bold">塑料标签格式：</Label>
            <RadioGroup v-model="formData.emType" class="flex gap-4">
              <div class="flex items-center gap-1">
                <RadioGroupItem value="fixed" id="em-fixed" />
                <Label for="em-fixed">固定</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem value="free" id="em-free" />
                <Label for="em-free">自由</Label>
              </div>
            </RadioGroup>
            <Button @click="handleSaveLabelFormat" class="ml-auto">保存</Button>
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
            <div v-for="i in 8" :key="i" class="flex items-center gap-2">
              <Label class="w-6 text-right font-bold">{{ i }}.</Label>
              <Input v-model="formData.stampReqManuls[i - 1]" class="flex-1 h-8 font-mono" />
            </div>
          </div>

          <!-- 要求 -->
          <div class="mt-3">
            <Label class="font-bold">要求：</Label>
            <textarea
              v-model="formData.stampReq"
              readonly
              class="mt-1 w-full h-20 border rounded px-3 py-2 text-sm font-mono bg-muted resize-none"
            />
          </div>

          <div class="flex justify-end mt-2">
            <Button @click="handleSaveStampFormat">保存</Button>
          </div>
        </div>

        <!-- 喷印要求 -->
        <div class="border rounded-lg p-4 relative flex-shrink-0">
          <div
            class="absolute -top-3 left-4 px-2 bg-white text-sm font-bold text-[1rem] text-red-800"
          >
            喷印要求
          </div>

          <textarea
            v-model="formData.sprayReq"
            class="mt-1 w-full h-20 border rounded px-3 py-2 text-sm font-mono text-blue-600 resize-none"
          />

          <div class="flex justify-end mt-2">
            <Button @click="handleSaveSprayFormat">保存</Button>
          </div>
        </div>
      </div>

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
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
  orderNo: '',
  itemNo: '',
  // 标签打印格式（8行）
  labelReqs: Array.from({ length: 8 }, () => ''),
  // 标签格式选项
  tagLengthType: 'metric',
  tagWeightType: 'metric',
  emType: 'fixed',
  // 针刻印格式（8行）
  stampReqManuls: Array.from({ length: 8 }, () => ''),
  // 针刻印要求（只读）
  stampReq: '',
  // 喷印要求
  sprayReq: '',
});

// 事件处理
function handleQuery() {
  console.log('query', formData.orderNo, formData.itemNo);
}

function handleToCurrentOrder() {
  console.log('return to current order');
}

function handleSaveLabelFormat() {
  console.log('save label format', {
    labelReqs: formData.labelReqs,
    tagLengthType: formData.tagLengthType,
    tagWeightType: formData.tagWeightType,
    emType: formData.emType,
  });
}

function handleSaveStampFormat() {
  console.log('save stamp format', formData.stampReqManuls);
}

function handleSaveSprayFormat() {
  console.log('save spray format', formData.sprayReq);
}
</script>
