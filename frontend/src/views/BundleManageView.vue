<template>
  <div class="h-full w-full flex flex-col overflow-hidden">
    <!-- 查询条件 -->
    <div class="flex-shrink-0 p-3 space-y-3">
      <!-- 查询条件 -->
      <div class="border rounded-lg p-4 relative">
        <div class="flex items-center gap-4">
          <Label class="whitespace-nowrap">查询日期</Label>
          <Input type="date" class="w-40" />
          <Label class="whitespace-nowrap">管捆号</Label>
          <Input type="text" class="w-40" />
          <Button variant="outline" @click="handleQuery">执行查询</Button>
          <Label class="whitespace-nowrap">合同号</Label>
          <Input type="text" class="w-40" />
          <Label class="whitespace-nowrap">项目号</Label>
          <Input type="text" class="w-20" />
          <Button variant="outline">新增</Button>
          <Button variant="outline">删除</Button>
          <Button variant="outline">保存</Button>
          <Button variant="outline" @click="handlePrintTag">标签打印</Button>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="flex-1 flex overflow-hidden p-3 pt-0 gap-3">
      <!-- 左侧：管捆列表 -->
      <div class="w-[560px] flex-shrink-0 flex flex-col pt-4">
        <div class="border rounded-lg p-4 relative flex-1 flex flex-col">
          <div class="absolute -top-3 left-4 px-2 bg-white text-sm font-bold text-[1rem]">
            管捆列表
          </div>
          <!-- 固定表头 -->
          <div class="border-b">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[120px]">合同号</TableHead>
                  <TableHead class="w-[60px]">项目号</TableHead>
                  <TableHead class="w-[80px]">管捆号</TableHead>
                  <TableHead class="w-[80px]">轧批号</TableHead>
                  <TableHead class="w-[80px]">炉号</TableHead>
                  <TableHead class="w-[80px]">试批号</TableHead>
                  <TableHead class="w-[50px]">发送标记</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>
          <!-- 可滚动表体 -->
          <div class="flex-1 overflow-y-auto">
            <Table>
              <TableBody>
                <TableRow
                  v-for="(row, index) in bundleList"
                  :key="index"
                  :class="{ 'bg-accent': selectedBundleIndex === index }"
                  class="cursor-pointer"
                  @click="selectBundle(index)"
                >
                  <TableCell class="w-[120px]">{{ row.orderNo }}</TableCell>
                  <TableCell class="w-[60px]">{{ row.itemNo }}</TableCell>
                  <TableCell class="w-[80px]">{{ row.bundleNo }}</TableCell>
                  <TableCell class="w-[80px]">{{ row.rollNo }}</TableCell>
                  <TableCell class="w-[80px]">{{ row.meltNo }}</TableCell>
                  <TableCell class="w-[80px]">{{ row.lotNo }}</TableCell>
                  <TableCell class="w-[50px]">{{ row.flag }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <!-- 中间：管捆信息 -->
      <div class="flex-1 flex flex-col pt-4">
        <div class="border rounded-lg p-4 relative flex-1 flex flex-col">
          <div class="absolute -top-3 left-4 px-2 bg-white text-sm font-bold text-[1rem]">
            管捆信息
          </div>

          <!-- 第一行：合同号、项目号、管捆号、轧批号、炉号、试批号 -->
          <div class="grid grid-cols-6 gap-3 my-3">
            <div class="space-y-1">
              <Label class="text-xs">合同号</Label>
              <Input v-model="formData.orderNo" readonly />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">项目号</Label>
              <Input v-model="formData.itemNo" readonly />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">管捆号</Label>
              <Input v-model="formData.bundleNo" readonly />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">轧批号</Label>
              <Input v-model="formData.rollNo" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">炉号</Label>
              <Input v-model="formData.meltNo" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">试批号</Label>
              <Input v-model="formData.lotNo" />
            </div>
          </div>

          <!-- 第二行：外径、壁厚、最短、最长、根数、最后流水号 -->
          <div class="grid grid-cols-6 gap-3 mb-3">
            <div class="space-y-1">
              <Label class="text-xs">外径</Label>
              <Input v-model="formData.diameter" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">壁厚</Label>
              <Input v-model="formData.wall_thickness" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">最短</Label>
              <Input v-model="formData.lengthFrom" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">最长</Label>
              <Input v-model="formData.lengthTo" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">根数</Label>
              <Input v-model="formData.count" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">最后管号</Label>
              <Input v-model="formData.lastFlowNo" />
            </div>
          </div>

          <!-- 第三行：生产日期、生产时间、管捆状态、班组、作业点代码、去向代码 -->
          <div class="grid grid-cols-6 gap-3 mb-3">
            <div class="space-y-1">
              <Label class="text-xs">生产日期</Label>
              <Input v-model="formData.produceDate" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">生产时间</Label>
              <Input v-model="formData.produceTime" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">管捆状态</Label>
              <Input v-model="formData.bundleType" class="bg-teal-200" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">班组</Label>
              <Select v-model="formData.shiftNo">
                <SelectTrigger class="w-full bg-teal-200">
                  <SelectValue placeholder="选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="item in shiftOptions" :key="item" :value="item">
                    {{ item }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-1">
              <Label class="text-xs">作业点代码</Label>
              <Input v-model="formData.produceJobPoint" class="bg-teal-200" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">去向代码</Label>
              <Input v-model="formData.directionCode" class="bg-teal-200" />
            </div>
          </div>

          <!-- 第四行：理论重量、理论长度、米制重量、英制重量、米制长度、英制长度 -->
          <div class="grid grid-cols-6 gap-3 mb-3">
            <div class="space-y-1">
              <Label class="text-xs">理论重量</Label>
              <Input v-model="formData.theoryWeight" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">理论长度</Label>
              <Input v-model="formData.theoryTotalLength" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">米制重量</Label>
              <Input v-model="formData.weightMetric" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">英制重量</Label>
              <Input v-model="formData.weightEng" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">米制长度</Label>
              <Input v-model="formData.lengthMetric" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">英制长度</Label>
              <Input v-model="formData.lengthEng" />
            </div>
          </div>

          <!-- 第五行：材质正文、标准正文、钢级正文 -->
          <div class="grid grid-cols-3 gap-3 mb-3">
            <div class="space-y-1">
              <Label class="text-xs">材质正文</Label>
              <Input v-model="formData.matText" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">标准正文</Label>
              <Input v-model="formData.stdText" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">钢级正文</Label>
              <Input v-model="formData.sgText" />
            </div>
          </div>

          <!-- 第六行：管端类型符号、螺纹类型符号、管端型式 -->
          <div class="grid grid-cols-6 gap-3 mb-3">
            <div class="space-y-1">
              <Label class="text-xs">管端类型符号</Label>
              <Input v-model="formData.endTypeSign" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">螺纹类型符号</Label>
              <Input v-model="formData.threadTypeSign" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">管端型式</Label>
              <Input v-model="formData.threadTypeSign" />
            </div>
          </div>

          <!-- 第七行: 接箍炉号、接箍批号、螺纹类型 -->
          <div class="grid grid-cols-6 gap-3 mb-3">
            <div class="space-y-1">
              <Label class="text-xs">接箍炉号</Label>
              <Input v-model="formData.ponoIdCoupling" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">接箍批号</Label>
              <Input v-model="formData.lotNoThread" />
            </div>
            <div class="space-y-1">
              <Label class="text-xs">螺纹类型</Label>
              <Input v-model="formData.lotNoThread" />
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：管子信息 -->
      <div class="w-[520px] flex-shrink-0 flex flex-col pt-4">
        <div class="border rounded-lg p-4 relative flex-1 flex flex-col">
          <div class="absolute -top-3 left-4 px-2 bg-white text-sm font-bold text-[1rem]">
            管子信息
          </div>

          <!-- 管子数据表格 -->
          <div class="border rounded flex-1 flex flex-col min-h-0">
            <!-- 固定表头 -->
            <div class="border-b">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-[100px]">管号</TableHead>
                    <TableHead class="w-[100px]">流水号</TableHead>
                    <TableHead class="w-[120px]">长度（米）</TableHead>
                    <TableHead class="w-[120px]">重量（千克）</TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>
            <!-- 可滚动表体 -->
            <div class="flex-1 overflow-y-auto">
              <Table>
                <TableBody>
                  <TableRow
                    v-for="(row, index) in tubeFlowData"
                    :key="index"
                    :class="{ 'bg-accent': selectedTubeIndex === index }"
                    class="cursor-pointer"
                  >
                    <TableCell class="w-[90px]">
                      <input v-model="row.shortFlag" type="checkbox" class="h-4 w-4" />
                    </TableCell>
                    <TableCell class="w-[100px]">{{ row.flowNo }}</TableCell>
                    <TableCell class="w-[120px]">{{ row.lengthMetric }}</TableCell>
                    <TableCell class="w-[120px]">{{ row.weightMetric }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          <div class="flex items-center gap-3 mt-3">
            <Button variant="outline" class="w-32 mt-3">管子新增</Button>
            <Button variant="outline" class="w-32 mt-3">管子删除</Button>
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// 查询条件
const queryForm = reactive({
  orderNo: '',
  itemNo: '',
  bundleNo: '',
});

// 班组选项
const shiftOptions = ref(['夜甲', '夜乙', '夜丙', '夜丁', '早甲', '早乙', '早丙', '早丁']);

// 管捆列表
const bundleList = ref<
  Array<{
    orderNo: string;
    itemNo: string;
    bundleNo: string;
    rollNo: string;
    meltNo: string;
    lotNo: string;
    flag: string;
  }>
>([]);
const selectedBundleIndex = ref<number | null>(null);

// 管捆基本信息表单
const formData = reactive({
  orderNo: '',
  itemNo: '',
  rollNo: '',
  meltNo: '',
  lotNo: '',
  bundleNo: '',
  diameter: '',
  thickness: '',
  lengthFrom: '',
  lengthTo: '',
  count: '',
  lastFlowNo: '',
  produceTime: '',
  bundleType: '',
  shiftNo: '',
  produceJobPoint: '',
  directionCode: '',
  theoryWeight: '',
  weightMetric: '',
  weightEng: '',
  theoryTotalLength: '',
  lengthMetric: '',
  lengthEng: '',
  matText: '',
  stdText: '',
  prodCname: '',
  sgText: '',
  endTypeSign: '',
  threadTypeSign: '',
  malePonoIdCoupling: '',
  maleLotNoThread: '',
  femalePonoIdCoupling: '',
  femaleLotNoThread: '',
  ponoIdCoupling: '',
  lotNoThread: '',
  seamLotNo: '',
  orderNoOld: '',
  delFlag: '',
  specInput: '',
});

// 管子流水号数据表格
const tubeFlowData = ref<
  Array<{
    shortFlag: boolean;
    flowNo: string;
    lengthMetric: string;
    weightMetric: string;
  }>
>([]);
const selectedTubeIndex = ref<number | null>(null);

// 查询
function handleQuery() {
  console.log('query', queryForm);
}

// 选择管捆
function selectBundle(index: number) {
  selectedBundleIndex.value = index;
  const selected = bundleList.value[index];
  formData.orderNo = selected.orderNo;
  formData.itemNo = selected.itemNo;
  formData.bundleNo = selected.bundleNo;
  formData.rollNo = selected.rollNo;
  formData.meltNo = selected.meltNo;
  formData.lotNo = selected.lotNo;
}

// 保存
function handleSave() {
  console.log('save', formData);
}

// 删除管捆
function handleDeleteBundle() {
  console.log('delete bundle');
}

// 标签打印
function handlePrintTag() {}
</script>
