<template>
  <div class="h-full w-full flex flex-col overflow-hidden">
    <!-- 查询区域 -->
    <div class="flex-shrink-0 border-b p-4 bg-background">
      <div class="flex items-center gap-4 flex-wrap">
        <!-- 第一组查询条件 -->
        <div class="flex items-center gap-2">
          <Label class="whitespace-nowrap">合同号</Label>
          <Select v-model="query1.orderNo">
            <SelectTrigger class="w-40">
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
          <Label class="whitespace-nowrap">管捆号</Label>
          <Select v-model="query1.bundleNo">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="选择管捆号" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="item in bundleNoOptions" :key="item" :value="item">
                {{ item }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button @click="handleQuery1">查询</Button>

        <div class="w-px h-6 bg-border mx-2" />

        <!-- 第二组查询条件 -->
        <div class="flex items-center gap-2">
          <Label class="whitespace-nowrap">合同号</Label>
          <Select v-model="query2.orderNo">
            <SelectTrigger class="w-40">
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
          <Label class="whitespace-nowrap">管捆号</Label>
          <Select v-model="query2.bundleNo">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="选择管捆号" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="item in bundleNoOptions" :key="item" :value="item">
                {{ item }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button @click="handleQuery2">查询</Button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="flex-1 flex overflow-hidden">
      <div class="border rounded-lg p-4 space-y-3">
        <!-- 左侧面板：管捆列表 + 操作按钮 -->
        <div class="w-[350px] flex-shrink-0 flex flex-col">
          <div class="text-sm font-medium mb-2">投料信息查询</div>
          <div class="grid grid-cols-2 gap-2">
            <Label class="whitespace-nowrap">管捆号</Label>
            <Select v-model="query2.bundleNo">
              <SelectTrigger class="w-40">
                <SelectValue placeholder="选择管捆号" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="item in bundleNoOptions" :key="item" :value="item">
                  {{ item }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="default" class="w-full">保存</Button>
            <Button variant="destructive" class="w-full">删除</Button>
            <Button variant="outline" class="w-full">打印标签</Button>
            <Button variant="outline" class="w-full">编捆</Button>
            <Button variant="outline" class="w-full">发送增加电报</Button>
          </div>
        </div>

        <!-- 管捆列表表格 -->
        <div class="flex-1 overflow-auto p-4">
          <div class="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[145px]">合同号</TableHead>
                  <TableHead class="w-[140px]">管捆号</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="(row, index) in bundleList"
                  :key="index"
                  :class="{ 'bg-accent': selectedIndex === index }"
                  class="cursor-pointer"
                  @click="selectBundle(index)"
                >
                  <TableCell>{{ row.orderNo }}</TableCell>
                  <TableCell>{{ row.bundleNo }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <!-- 操作按钮区域 -->
        <!-- <div class="flex-shrink-0 border-t p-4"> -->
        <div class="border rounded-lg p-4 space-y-3">
          <div class="text-sm font-medium mb-2">操作</div>
          <div class="grid grid-cols-2 gap-2">
            <Button variant="default" class="w-full">保存</Button>
            <Button variant="destructive" class="w-full">删除</Button>
            <Button variant="outline" class="w-full">打印标签</Button>
            <Button variant="outline" class="w-full">编捆</Button>
            <Button variant="outline" class="w-full">发送增加电报</Button>
            <Button variant="outline" class="w-full">发送删除电报</Button>
          </div>
        </div>
        <!-- </div> -->
      </div>

      <!-- 右侧面板：管捆信息详情 -->
      <div class="flex-1 overflow-auto p-4">
        <div class="space-y-4">
          <!-- 管捆信息表单 -->
          <div class="border rounded-lg p-4">
            <div class="text-sm font-medium mb-4">管捆信息</div>

            <!-- 生产信息 -->
            <div class="grid grid-cols-6 gap-3 mb-4">
              <div class="space-y-1">
                <Label class="text-xs">生产日期</Label>
                <Input v-model="bundleData.produceDate" class="bg-teal-200" />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">生产时间</Label>
                <Input v-model="bundleData.produceTime" class="bg-teal-200" />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">班次</Label>
                <Select v-model="bundleData.produceClsNo">
                  <SelectTrigger class="bg-teal-200">
                    <SelectValue placeholder="选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1">
                <Label class="text-xs">班别</Label>
                <Select v-model="bundleData.produceGrpNo">
                  <SelectTrigger class="bg-teal-200">
                    <SelectValue placeholder="选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1">
                <Label class="text-xs">生产作业点</Label>
                <Input v-model="bundleData.produceJobPoint" class="bg-teal-200" />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">操作标志</Label>
                <Input v-model="bundleData.operateFlag" readonly />
              </div>
            </div>

            <!-- 订单信息 -->
            <div class="grid grid-cols-6 gap-3 mb-4">
              <div class="space-y-1">
                <Label class="text-xs">合同号</Label>
                <Input v-model="bundleData.orderNo" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">管捆号</Label>
                <Input v-model="bundleData.bundleNo" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">库位</Label>
                <Input v-model="bundleData.roomNo" class="bg-teal-200" />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">去向代码</Label>
                <Input v-model="bundleData.directionCode" class="bg-teal-200" />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">原产代码</Label>
                <Input v-model="bundleData.originCode" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">产品名称</Label>
                <Input v-model="bundleData.prodCname" readonly />
              </div>
            </div>

            <!-- 材质规格 -->
            <div class="grid grid-cols-6 gap-3 mb-4">
              <div class="space-y-1">
                <Label class="text-xs">材质代码</Label>
                <Input v-model="bundleData.matNo" class="bg-teal-200" />
              </div>
              <div class="space-y-1 col-span-2">
                <Label class="text-xs">材质正文</Label>
                <Input v-model="bundleData.matText" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">外径</Label>
                <Input v-model="bundleData.diameter" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">壁厚</Label>
                <Input v-model="bundleData.wallThick" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">高度</Label>
                <Input v-model="bundleData.height" readonly />
              </div>
            </div>

            <!-- 工艺与管端 -->
            <div class="grid grid-cols-6 gap-3 mb-4">
              <div class="space-y-1">
                <Label class="text-xs">工艺</Label>
                <Input v-model="bundleData.heatTreatStatusCode" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">管端形式代码</Label>
                <Input v-model="bundleData.endTypeCode" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">管端形式符号</Label>
                <Input v-model="bundleData.endTypeSign" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">螺纹形式代码</Label>
                <Input v-model="bundleData.threadTypeCode" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">螺纹形式符号</Label>
                <Input v-model="bundleData.threadTypeSign" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">标准钢级代码</Label>
                <Input v-model="bundleData.stdSgCode" readonly />
              </div>
            </div>

            <!-- 标准与钢级 -->
            <div class="grid grid-cols-6 gap-3 mb-4">
              <div class="space-y-1 col-span-2">
                <Label class="text-xs">标准正文</Label>
                <Input v-model="bundleData.stdText" readonly />
              </div>
              <div class="space-y-1 col-span-2">
                <Label class="text-xs">钢级正文</Label>
                <Input v-model="bundleData.sgText" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">原合同号</Label>
                <Input v-model="bundleData.orderNoOld" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">投料管捆号</Label>
                <Input v-model="bundleData.oldBundleNo" readonly />
              </div>
            </div>

            <!-- 批次信息 -->
            <div class="grid grid-cols-6 gap-3 mb-4">
              <div class="space-y-1">
                <Label class="text-xs">轧批号</Label>
                <Input v-model="bundleData.rlNo" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">炉号</Label>
                <Input v-model="bundleData.meltNo" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">试批号</Label>
                <Input v-model="bundleData.lotNo" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">管捆类型</Label>
                <Select v-model="bundleData.bundleType">
                  <SelectTrigger class="bg-teal-200">
                    <SelectValue placeholder="选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N">正常</SelectItem>
                    <SelectItem value="S">短尺</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1">
                <Label class="text-xs">根数</Label>
                <Input v-model="bundleData.tube" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">重量</Label>
                <Input v-model="bundleData.weight" readonly />
              </div>
            </div>

            <!-- 汇总数据 -->
            <div class="grid grid-cols-6 gap-3">
              <div class="space-y-1">
                <Label class="text-xs">长度起</Label>
                <Input v-model="bundleData.orderLengthFrom" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">长度止</Label>
                <Input v-model="bundleData.orderLengthTo" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">总长度</Label>
                <Input v-model="bundleData.totalLength" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">起始管号</Label>
                <Input v-model="bundleData.startTubeNo" class="bg-teal-200" />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">管数</Label>
                <Input v-model="bundleData.tubeCount" class="bg-teal-200" />
              </div>
              <div class="space-y-1 flex items-end">
                <Button variant="outline" class="w-full">生成管号</Button>
              </div>
            </div>
          </div>

          <!-- 单管明细区域 -->
          <div class="border rounded-lg p-4">
            <div class="text-sm font-medium mb-4">单管明细</div>

            <!-- 表头 -->
            <div class="grid grid-cols-10 gap-2 mb-2">
              <template v-for="i in 10" :key="`header-${i}`">
                <div class="text-xs text-center font-medium text-muted-foreground">管{{ i }}</div>
              </template>
            </div>

            <!-- 管号 1-10 -->
            <div class="space-y-1 mb-3">
              <!-- <div class="text-xs text-muted-foreground">管号</div> -->
              <div class="grid grid-cols-10 gap-2">
                <Input
                  v-for="i in 10"
                  :key="`tubeNo-${i}`"
                  v-model="bundleData.tubes[i - 1].tubeNo"
                  class="text-xs h-8"
                />
              </div>
              <!-- <div class="text-xs text-muted-foreground mt-1">长度</div> -->
              <div class="grid grid-cols-10 gap-2">
                <Input
                  v-for="i in 10"
                  :key="`length-${i}`"
                  v-model="bundleData.tubes[i - 1].length"
                  class="text-xs h-8"
                />
              </div>
              <!-- <div class="text-xs text-muted-foreground mt-1">重量</div> -->
              <div class="grid grid-cols-10 gap-2">
                <Input
                  v-for="i in 10"
                  :key="`weight-${i}`"
                  v-model="bundleData.tubes[i - 1].weight"
                  class="text-xs h-8"
                />
              </div>
            </div>

            <!-- 表头 11-20 -->
            <div class="grid grid-cols-10 gap-2 mb-2 mt-4">
              <template v-for="i in 10" :key="`header-${i + 10}`">
                <div class="text-xs text-center font-medium text-muted-foreground">
                  管{{ i + 10 }}
                </div>
              </template>
            </div>

            <!-- 管号 11-20 -->
            <div class="space-y-1 mb-3">
              <!-- <div class="text-xs text-muted-foreground">管号</div> -->
              <div class="grid grid-cols-10 gap-2">
                <Input
                  v-for="i in 10"
                  :key="`tubeNo-${i + 10}`"
                  v-model="bundleData.tubes[i + 9].tubeNo"
                  class="text-xs h-8"
                />
              </div>
              <!-- <div class="text-xs text-muted-foreground mt-1">长度</div> -->
              <div class="grid grid-cols-10 gap-2">
                <Input
                  v-for="i in 10"
                  :key="`length-${i + 10}`"
                  v-model="bundleData.tubes[i + 9].length"
                  class="text-xs h-8"
                />
              </div>
              <!-- <div class="text-xs text-muted-foreground mt-1">重量</div> -->
              <div class="grid grid-cols-10 gap-2">
                <Input
                  v-for="i in 10"
                  :key="`weight-${i + 10}`"
                  v-model="bundleData.tubes[i + 9].weight"
                  class="text-xs h-8"
                />
              </div>
            </div>

            <!-- 表头 21-30 -->
            <div class="grid grid-cols-10 gap-2 mb-2 mt-4">
              <template v-for="i in 10" :key="`header-${i + 20}`">
                <div class="text-xs text-center font-medium text-muted-foreground">
                  管{{ i + 20 }}
                </div>
              </template>
            </div>

            <!-- 管号 21-30 -->
            <div class="space-y-1">
              <!-- <div class="text-xs text-muted-foreground">管号</div> -->
              <div class="grid grid-cols-10 gap-2">
                <Input
                  v-for="i in 10"
                  :key="`tubeNo-${i + 20}`"
                  v-model="bundleData.tubes[i + 19].tubeNo"
                  class="text-xs h-8"
                />
              </div>
              <!-- <div class="text-xs text-muted-foreground mt-1">长度</div> -->
              <div class="grid grid-cols-10 gap-2">
                <Input
                  v-for="i in 10"
                  :key="`length-${i + 20}`"
                  v-model="bundleData.tubes[i + 19].length"
                  class="text-xs h-8"
                />
              </div>
              <!-- <div class="text-xs text-muted-foreground mt-1">重量</div> -->
              <div class="grid grid-cols-10 gap-2">
                <Input
                  v-for="i in 10"
                  :key="`weight-${i + 20}`"
                  v-model="bundleData.tubes[i + 19].weight"
                  class="text-xs h-8"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
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
const query1 = reactive({
  orderNo: '',
  bundleNo: '',
});

const query2 = reactive({
  orderNo: '',
  bundleNo: '',
});

// 下拉选项（模拟数据）
const orderNoOptions = ref(['ORDER001', 'ORDER002', 'ORDER003']);
const bundleNoOptions = ref(['BDL001', 'BDL002', 'BDL003']);

// 管捆列表
const bundleList = ref([
  { orderNo: 'ORDER001', bundleNo: 'BDL001' },
  { orderNo: 'ORDER001', bundleNo: 'BDL002' },
  { orderNo: 'ORDER002', bundleNo: 'BDL003' },
]);

const selectedIndex = ref<number | null>(null);

// 创建30个管的初始数据
function createEmptyTubes() {
  return Array.from({ length: 30 }, () => ({
    tubeNo: '',
    length: '',
    weight: '',
  }));
}

// 管捆详情数据
const bundleData = reactive({
  // 生产信息
  produceDate: '',
  produceTime: '',
  produceClsNo: '',
  produceGrpNo: '',
  produceJobPoint: '',
  operateFlag: '',

  // 订单信息
  orderNo: '',
  bundleNo: '',
  roomNo: '',
  directionCode: '',
  originCode: '',
  prodCname: '',

  // 材质规格
  matNo: '',
  matText: '',
  diameter: '',
  wallThick: '',
  height: '',

  // 工艺与管端
  heatTreatStatusCode: '',
  endTypeCode: '',
  endTypeSign: '',
  threadTypeCode: '',
  threadTypeSign: '',
  stdSgCode: '',

  // 标准与钢级
  stdText: '',
  sgText: '',
  orderNoOld: '',
  oldBundleNo: '',

  // 批次信息
  rlNo: '',
  meltNo: '',
  lotNo: '',
  bundleType: '',
  tube: '',
  weight: '',

  // 汇总数据
  orderLengthFrom: '',
  orderLengthTo: '',
  totalLength: '',
  startTubeNo: '',
  tubeCount: '',

  // 单管明细
  tubes: createEmptyTubes(),
});

// 查询方法
function handleQuery1() {
  console.log('Query 1:', query1);
}

function handleQuery2() {
  console.log('Query 2:', query2);
}

// 选择管捆
function selectBundle(index: number) {
  selectedIndex.value = index;
  // 模拟加载数据
  const selected = bundleList.value[index];
  bundleData.orderNo = selected.orderNo;
  bundleData.bundleNo = selected.bundleNo;
}
</script>
