<template>
  <div class="h-full w-full flex flex-col overflow-hidden">
    <!-- 页面内容 -->
    <div class="flex-1 overflow-auto p-4 space-y-4">
      <!-- 合同申请 -->
      <div class="border rounded-lg p-4 relative">
        <div class="absolute -top-3 left-4 px-2 bg-white text-sm font-bold text-[1rem]">
          合同申请
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <Label class="whitespace-nowrap">合同号</Label>
            <Input v-model="requestForm.orderNo" class="w-36" />
          </div>
          <div class="flex items-center gap-2">
            <Label class="whitespace-nowrap">项目号</Label>
            <Input v-model="requestForm.itemNo" class="w-20 text-right" />
          </div>
          <Button @click="handleRequest">申请</Button>
        </div>
      </div>

      <!-- 合同查询 -->
      <div class="border rounded-lg p-4 relative">
        <div class="absolute -top-3 left-4 px-2 bg-white text-sm font-bold text-[1rem]">
          合同查询
        </div>
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <Label class="whitespace-nowrap">合同号</Label>
            <Select v-model="queryForm.orderNo">
              <SelectTrigger class="w-36">
                <SelectValue placeholder="选择合同号" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="item in orderNoOptions" :key="item" :value="item">
                  {{ item }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-center gap-2">
            <Label class="whitespace-nowrap">项目号</Label>
            <Select v-model="queryForm.itemNo">
              <SelectTrigger class="w-20">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="item in itemNoOptions" :key="item" :value="item">
                  {{ item }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button @click="handleQuery">查询</Button>
          <div class="flex items-center gap-2">
            <Label class="whitespace-nowrap">查询范围</Label>
            <Input v-model="queryForm.dateFrom" type="date" class="w-40" />
          </div>
          <Label class="whitespace-nowrap">至</Label>
          <Input v-model="queryForm.dateTo" type="date" class="w-40" />
        </div>
      </div>

      <!-- 合同明细 -->
      <div class="border rounded-lg p-4 relative">
        <div class="absolute -top-3 left-4 px-2 bg-white text-sm font-bold text-[1rem]">
          合同明细
        </div>

        <div class="space-y-3">
          <!-- 第1行：合同号、项目号、轧批号、外径、壁厚、原合同号 -->
          <div class="grid grid-cols-6 gap-3">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">合同号</Label>
              <Input v-model="formData.orderNo" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">项目号</Label>
              <Input v-model="formData.itemNo" class="w-14" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">轧批号</Label>
              <Input v-model="formData.rollNo" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">外径</Label>
              <Input v-model="formData.diameter" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">壁厚</Label>
              <Input v-model="formData.walThick" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">原合同号</Label>
              <Input v-model="formData.orderNoOld" class="flex-1" />
            </div>
          </div>

          <!-- 第2行：品名细分类代码、品名细分类、热处理方式代码、热处理方式正文 -->
          <div class="grid grid-cols-12 gap-3">
            <div class="col-span-2 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">品名细分类代码</Label>
              <Input v-model="formData.prodCode" class="flex-1" />
            </div>
            <div class="col-span-3 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">品名细分类</Label>
              <Select v-model="formData.prodCName">
                <SelectTrigger class="flex-1">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="item in prodCNameOptions" :key="item" :value="item">
                    {{ item }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="col-span-2 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">热处理方式代码</Label>
              <Input v-model="formData.heatTreatCode" class="flex-1" />
            </div>
            <div class="col-span-5 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">热处理方式正文</Label>
              <Input v-model="formData.heatTreatText" class="flex-1" />
            </div>
          </div>

          <!-- 第3行：标准钢级代码、标准正文 -->
          <div class="grid grid-cols-12 gap-3">
            <div class="col-span-2 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标准钢级代码</Label>
              <Input v-model="formData.stdSgCode" class="flex-1" />
            </div>
            <div class="col-span-10 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标准正文</Label>
              <Input v-model="formData.stdText" class="flex-1" />
            </div>
          </div>

          <!-- 第4行：钢级正文、材质号、材质正文 -->
          <div class="grid grid-cols-12 gap-3">
            <div class="col-span-5 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">钢级正文</Label>
              <Input v-model="formData.sgText" class="flex-1" />
            </div>
            <div class="col-span-2 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">材质号</Label>
              <Input v-model="formData.matNo" class="flex-1" />
            </div>
            <div class="col-span-5 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">材质正文</Label>
              <Input v-model="formData.matText" class="flex-1" />
            </div>
          </div>

          <!-- 第5行：螺纹类型代码/符号、管端类型代码/符号、接箍类型代码/符号 -->
          <div class="grid grid-cols-6 gap-3">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">螺纹类型代码</Label>
              <Input v-model="formData.endTypeCode" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">螺纹类型符号</Label>
              <Input v-model="formData.endTypeSign" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">管端类型代码</Label>
              <Input v-model="formData.threadTypeCode" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">管端类型符号</Label>
              <Input v-model="formData.threadTypeSign" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">接箍类型代码</Label>
              <Input v-model="formData.couplingTypeCode" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">接箍类型符号</Label>
              <Input v-model="formData.couplingTypeSign" class="flex-1" />
            </div>
          </div>

          <!-- 第6行：螺纹表面处理方式代码/方式、订货长度起/止、订货计量单位代码/单位 -->
          <div class="grid grid-cols-6 gap-3">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">螺纹表面处理方式代码</Label>
              <Input v-model="formData.threadFaceTreatModeCode" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">螺纹表面处理方式</Label>
              <Input v-model="formData.threadFaceTreatMode" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">订货长度起</Label>
              <Input v-model="formData.lengthFrom" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">订货长度止</Label>
              <Input v-model="formData.lengthTo" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">订货计量单位代码</Label>
              <Input v-model="formData.orderUnitCode" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">订货计量单位</Label>
              <Input v-model="formData.orderUnit" class="flex-1" />
            </div>
          </div>

          <!-- 第7行：订货数量、订货根数、订货重量、定尺订货重量、非定尺订货重量、提货公差单位代码 -->
          <div class="grid grid-cols-6 gap-3">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">订货数量</Label>
              <Input v-model="formData.orderQty" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">订货根数</Label>
              <Input v-model="formData.orderTube" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">订货重量</Label>
              <Input v-model="formData.orderWeight" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">定尺订货重量</Label>
              <Input v-model="formData.fixedOrderWeight" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">非定尺订货重量</Label>
              <Input v-model="formData.unfixedOrderWeight" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">提货公差单位代码</Label>
              <Input v-model="formData.deliveryToleranceCode" class="flex-1" />
            </div>
          </div>

          <!-- 第8行：提货公差单位、提货公差起-至、短尺率、短尺长度起-至、最大单捆重量、最大单捆根数 -->
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">提货公差单位</Label>
              <Input v-model="formData.deliveryToleranceUnit" class="w-16" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">提货公差起-至</Label>
              <Input v-model="formData.deliveryToleranceFrom" class="w-16" />
              <span class="font-bold">-</span>
              <Input v-model="formData.deliveryToleranceTo" class="w-16" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">短尺率</Label>
              <Input v-model="formData.shortRate" class="w-12" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">短尺长度起-至</Label>
              <Input v-model="formData.shortFrom" class="w-20" />
              <span class="font-bold">-</span>
              <Input v-model="formData.shortTo" class="w-20" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">最大单捆重量</Label>
              <Input v-model="formData.singleBundleWeightMax" class="w-20" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">最大单捆根数</Label>
              <Input v-model="formData.singleBundleTubeMax" class="w-14" />
            </div>
          </div>

          <!-- 第9行：涂油代码、涂油正文 -->
          <div class="grid grid-cols-12 gap-3">
            <div class="col-span-2 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">涂油代码</Label>
              <Input v-model="formData.oilCode" class="flex-1" />
            </div>
            <div class="col-span-10 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">涂油正文</Label>
              <Input v-model="formData.oilType" class="flex-1" />
            </div>
          </div>

          <!-- 第10行：压印要求 -->
          <div class="flex items-center gap-2">
            <Label class="whitespace-nowrap text-xs font-bold">压印要求</Label>
            <Input v-model="formData.stampReq" class="flex-1" />
          </div>

          <!-- 第11行：喷印要求 -->
          <div class="flex items-center gap-2">
            <Label class="whitespace-nowrap text-xs font-bold">喷印要求</Label>
            <Input v-model="formData.stencilReq" class="flex-1" />
          </div>

          <!-- 第12行：标签要求 1 & 2 -->
          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标签要求1</Label>
              <Input v-model="formData.lableReq1" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标签要求2</Label>
              <Input v-model="formData.lableReq2" class="flex-1" />
            </div>
          </div>

          <!-- 第13行：标签要求 3 & 4 -->
          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标签要求3</Label>
              <Input v-model="formData.lableReq3" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标签要求4</Label>
              <Input v-model="formData.lableReq4" class="flex-1" />
            </div>
          </div>

          <!-- 第14行：标签要求 5 & 6 -->
          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标签要求5</Label>
              <Input v-model="formData.lableReq5" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标签要求6</Label>
              <Input v-model="formData.lableReq6" class="flex-1" />
            </div>
          </div>

          <!-- 第15行：标签要求 7 & 8 -->
          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标签要求7</Label>
              <Input v-model="formData.lableReq7" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标签要求8</Label>
              <Input v-model="formData.lableReq8" class="flex-1" />
            </div>
          </div>

          <!-- 第16行：质量特殊要求 -->
          <div class="flex items-center gap-2">
            <Label class="whitespace-nowrap text-xs font-bold">质量特殊要求</Label>
            <Input v-model="formData.qualSpecialReq" class="flex-1" />
          </div>

          <!-- 第17行：生产特殊要求、色环、色环位置 -->
          <div class="grid grid-cols-12 gap-3">
            <div class="col-span-6 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">生产特殊要求</Label>
              <Input v-model="formData.produceSpecialReq" class="flex-1" />
            </div>
            <div class="col-span-4 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">色环</Label>
              <Input v-model="formData.colorCircle" class="flex-1" />
            </div>
            <div class="col-span-2 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">色环位置</Label>
              <Input v-model="formData.colorCirclePos" class="flex-1" />
            </div>
          </div>

          <!-- 第18行：标准水压压力(MPA/PSI)、最小稳压时间、退火标记、米重、EV值、名义重量 -->
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标准水压压力(MPA)</Label>
              <Input v-model="formData.stdPressureMpa" class="w-16" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标准水压压力(PSI)</Label>
              <Input v-model="formData.stdPressurePsi" class="w-20" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">最小稳压时间</Label>
              <Input v-model="formData.stabilivoltTimeMin" class="w-16" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">退火标记</Label>
              <Input v-model="formData.annealFlag" class="w-20" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">米重</Label>
              <Input v-model="formData.weightPerMeter" class="w-20" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">EV值</Label>
              <Input v-model="formData.weightEw" class="w-20" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">名义重量</Label>
              <Input v-model="formData.theoryWeightEng" class="w-20" />
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="flex justify-end gap-3 pt-2">
            <Button @click="handleSetCurrentContract">设为当前合同</Button>
            <Button variant="info" @click="handleContractAdd">确认新增</Button>
            <Button variant="info" @click="handleContractModify">确认修改</Button>
          </div>
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// 合同申请表单
const requestForm = reactive({
  orderNo: '',
  itemNo: '1',
});

// 合同查询表单
const queryForm = reactive({
  orderNo: '',
  itemNo: '',
  dateFrom: '',
  dateTo: '',
});

// 下拉选项
const orderNoOptions = ref<string[]>([]);
const itemNoOptions = ref<string[]>(['0', '1', '2', '3']);
const prodCNameOptions = ref<string[]>([]);

// 合同明细表单数据
const formData = reactive({
  // 第1行
  orderNo: '',
  itemNo: '',
  rollNo: '',
  diameter: '',
  walThick: '',
  orderNoOld: '',

  // 第2行
  prodCode: '',
  prodCName: '',
  heatTreatCode: '',
  heatTreatText: '',

  // 第3行
  stdSgCode: '',
  stdText: '',

  // 第4行
  sgText: '',
  matNo: '',
  matText: '',

  // 第5行
  endTypeCode: '',
  endTypeSign: '',
  threadTypeCode: '',
  threadTypeSign: '',
  couplingTypeCode: '',
  couplingTypeSign: '',

  // 第6行
  threadFaceTreatModeCode: '',
  threadFaceTreatMode: '',
  lengthFrom: '',
  lengthTo: '',
  orderUnitCode: '',
  orderUnit: '',

  // 第7行
  orderQty: '',
  orderTube: '',
  orderWeight: '',
  fixedOrderWeight: '',
  unfixedOrderWeight: '',
  deliveryToleranceCode: '',

  // 第8行
  deliveryToleranceUnit: '',
  deliveryToleranceFrom: '',
  deliveryToleranceTo: '',
  shortRate: '',
  shortFrom: '',
  shortTo: '',
  singleBundleWeightMax: '',
  singleBundleTubeMax: '',

  // 第9行
  oilCode: '',
  oilType: '',

  // 第10-11行
  stampReq: '',
  stencilReq: '',

  // 标签要求
  lableReq1: '',
  lableReq2: '',
  lableReq3: '',
  lableReq4: '',
  lableReq5: '',
  lableReq6: '',
  lableReq7: '',
  lableReq8: '',

  // 质量/生产特殊要求
  qualSpecialReq: '',
  produceSpecialReq: '',

  // 色环
  colorCircle: '',
  colorCirclePos: '',

  // 水压/物理参数
  stdPressureMpa: '',
  stdPressurePsi: '',
  stabilivoltTimeMin: '',
  annealFlag: '',
  weightPerMeter: '',
  weightEw: '',
  theoryWeightEng: '',
});

// 事件处理
function handleRequest() {
  console.log('request', requestForm);
}

function handleQuery() {
  console.log('query', queryForm);
}

function handleSetCurrentContract() {
  console.log('set current contract', formData.orderNo);
}

function handleContractAdd() {
  console.log('contract add', formData);
}

function handleContractModify() {
  console.log('contract modify', formData);
}
</script>
