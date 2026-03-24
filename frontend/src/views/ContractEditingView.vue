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
              <Input v-model="formData.order_no" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">项目号</Label>
              <Input v-model="formData.item_no" class="w-14" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">轧批号</Label>
              <Input v-model="formData.roll_no" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">外径</Label>
              <Input v-model="formData.diameter" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">壁厚</Label>
              <Input v-model="formData.wall_thickness" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">原合同号</Label>
              <Input v-model="formData.order_no_old" class="flex-1" />
            </div>
          </div>

          <!-- 第2行：品名细分类代码、品名细分类、热处理方式代码、热处理方式正文 -->
          <div class="grid grid-cols-12 gap-3">
            <div class="col-span-2 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">品名细分类代码</Label>
              <Input v-model="formData.prod_code" class="flex-1" />
            </div>
            <div class="col-span-3 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">品名细分类</Label>
              <Select v-model="formData.prod_cname">
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
              <Input v-model="formData.heat_treat_code" class="flex-1" />
            </div>
            <div class="col-span-5 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">热处理方式正文</Label>
              <Input v-model="formData.heat_treat_text" class="flex-1" />
            </div>
          </div>

          <!-- 第3行：标准钢级代码、标准正文 -->
          <div class="grid grid-cols-12 gap-3">
            <div class="col-span-2 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标准钢级代码</Label>
              <Input v-model="formData.std_sg_code" class="flex-1" />
            </div>
            <div class="col-span-10 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标准正文</Label>
              <Input v-model="formData.std_text" class="flex-1" />
            </div>
          </div>

          <!-- 第4行：钢级正文、材质号、材质正文 -->
          <div class="grid grid-cols-12 gap-3">
            <div class="col-span-5 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">钢级正文</Label>
              <Input v-model="formData.sg_text" class="flex-1" />
            </div>
            <div class="col-span-2 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">材质号</Label>
              <Input v-model="formData.mat_no" class="flex-1" />
            </div>
            <div class="col-span-5 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">材质正文</Label>
              <Input v-model="formData.mat_text" class="flex-1" />
            </div>
          </div>

          <!-- 第5行：螺纹类型代码/符号、管端类型代码/符号、接箍类型代码/符号 -->
          <div class="grid grid-cols-6 gap-3">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">螺纹类型代码</Label>
              <Input v-model="formData.end_type_code" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">螺纹类型符号</Label>
              <Input v-model="formData.end_type_sign" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">管端类型代码</Label>
              <Input v-model="formData.thread_type_code" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">管端类型符号</Label>
              <Input v-model="formData.thread_type_sign" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">接箍类型代码</Label>
              <Input v-model="formData.coupling_type_code" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">接箍类型符号</Label>
              <Input v-model="formData.coupling_type_sign" class="flex-1" />
            </div>
          </div>

          <!-- 第6行：螺纹表面处理方式代码/方式、订货长度起/止、订货计量单位代码/单位 -->
          <div class="grid grid-cols-6 gap-3">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">螺纹表面处理方式代码</Label>
              <Input v-model="formData.thread_face_treat_mode_code" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">螺纹表面处理方式</Label>
              <Input v-model="formData.thread_face_treat_mode" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">订货长度起</Label>
              <Input v-model="formData.length_from" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">订货长度止</Label>
              <Input v-model="formData.length_to" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">订货计量单位代码</Label>
              <Input v-model="formData.order_unit_code" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">订货计量单位</Label>
              <Input v-model="formData.order_unit" class="flex-1" />
            </div>
          </div>

          <!-- 第7行：订货数量、订货根数、订货重量、定尺订货重量、非定尺订货重量、提货公差单位代码 -->
          <div class="grid grid-cols-6 gap-3">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">订货数量</Label>
              <Input v-model="formData.order_qty" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">订货根数</Label>
              <Input v-model="formData.order_tube" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">订货重量</Label>
              <Input v-model="formData.order_weight" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">定尺订货重量</Label>
              <Input v-model="formData.fixed_order_weight" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">非定尺订货重量</Label>
              <Input v-model="formData.unfixed_order_weight" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">提货公差单位代码</Label>
              <Input v-model="formData.delivery_tolerance_code" class="flex-1" />
            </div>
          </div>

          <!-- 第8行：提货公差单位、提货公差起-至、短尺率、短尺长度起-至、最大单捆重量、最大单捆根数 -->
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">提货公差单位</Label>
              <Input v-model="formData.delivery_tolerance_unit" class="w-16" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">提货公差起-至</Label>
              <Input v-model="formData.delivery_tolerance_from" class="w-16" />
              <span class="font-bold">-</span>
              <Input v-model="formData.delivery_tolerance_to" class="w-16" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">短尺率</Label>
              <Input v-model="formData.short_rate" class="w-12" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">短尺长度起-至</Label>
              <Input v-model="formData.short_from" class="w-20" />
              <span class="font-bold">-</span>
              <Input v-model="formData.short_to" class="w-20" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">最大单捆重量</Label>
              <Input v-model="formData.single_bundle_weight_max" class="w-20" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">最大单捆根数</Label>
              <Input v-model="formData.single_bundle_tube_max" class="w-14" />
            </div>
          </div>

          <!-- 第9行：涂油代码、涂油正文 -->
          <div class="grid grid-cols-12 gap-3">
            <div class="col-span-2 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">涂油代码</Label>
              <Input v-model="formData.oil_code" class="flex-1" />
            </div>
            <div class="col-span-10 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">涂油正文</Label>
              <Input v-model="formData.oil_type" class="flex-1" />
            </div>
          </div>

          <!-- 第10行：压印要求 -->
          <div class="flex items-center gap-2">
            <Label class="whitespace-nowrap text-xs font-bold">压印要求</Label>
            <Input v-model="formData.stamp_req" class="flex-1" />
          </div>

          <!-- 第11行：喷印要求 -->
          <div class="flex items-center gap-2">
            <Label class="whitespace-nowrap text-xs font-bold">喷印要求</Label>
            <Input v-model="formData.stencil_req" class="flex-1" />
          </div>

          <!-- 第12行：标签要求 1 & 2 -->
          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标签要求1</Label>
              <Input v-model="formData.lable_req_1" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标签要求2</Label>
              <Input v-model="formData.lable_req_2" class="flex-1" />
            </div>
          </div>

          <!-- 第13行：标签要求 3 & 4 -->
          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标签要求3</Label>
              <Input v-model="formData.lable_req_3" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标签要求4</Label>
              <Input v-model="formData.lable_req_4" class="flex-1" />
            </div>
          </div>

          <!-- 第14行：标签要求 5 & 6 -->
          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标签要求5</Label>
              <Input v-model="formData.lable_req_5" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标签要求6</Label>
              <Input v-model="formData.lable_req_6" class="flex-1" />
            </div>
          </div>

          <!-- 第15行：标签要求 7 & 8 -->
          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标签要求7</Label>
              <Input v-model="formData.lable_req_7" class="flex-1" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标签要求8</Label>
              <Input v-model="formData.lable_req_8" class="flex-1" />
            </div>
          </div>

          <!-- 第16行：质量特殊要求 -->
          <div class="flex items-center gap-2">
            <Label class="whitespace-nowrap text-xs font-bold">质量特殊要求</Label>
            <Input v-model="formData.qual_special_req" class="flex-1" />
          </div>

          <!-- 第17行：生产特殊要求、色环、色环位置 -->
          <div class="grid grid-cols-12 gap-3">
            <div class="col-span-6 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">生产特殊要求</Label>
              <Input v-model="formData.produce_special_req" class="flex-1" />
            </div>
            <div class="col-span-4 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">色环</Label>
              <Input v-model="formData.color_circle" class="flex-1" />
            </div>
            <div class="col-span-2 flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">色环位置</Label>
              <Input v-model="formData.color_circle_pos" class="flex-1" />
            </div>
          </div>

          <!-- 第18行：标准水压压力(MPA/PSI)、最小稳压时间、退火标志、米重、EV值、名义重量 -->
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标准水压压力(MPA)</Label>
              <Input v-model="formData.std_pressure_mpa" class="w-16" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">标准水压压力(PSI)</Label>
              <Input v-model="formData.std_pressure_psi" class="w-20" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">最小稳压时间</Label>
              <Input v-model="formData.stabilivolt_time_min" class="w-16" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">退火标志</Label>
              <Input v-model="formData.anneal_flag" class="w-20" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">米重</Label>
              <Input v-model="formData.weight_per_meter" class="w-20" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">EW值</Label>
              <Input v-model="formData.weight_ew" class="w-20" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="whitespace-nowrap text-xs font-bold">名义重量</Label>
              <Input v-model="formData.theory_weight_eng" class="w-20" />
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="flex justify-end gap-3 pt-2">
            <Button @click="handleSetCurrentContract">设为当前合同</Button>
            <Button variant="outline" @click="handleContractAdd">确认新增</Button>
            <Button variant="outline" @click="handleContractModify">确认修改</Button>
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
  lable_req_1: '',
  lable_req_2: '',
  lable_req_3: '',
  lable_req_4: '',
  lable_req_5: '',
  lable_req_6: '',
  lable_req_7: '',
  lable_req_8: '',

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
