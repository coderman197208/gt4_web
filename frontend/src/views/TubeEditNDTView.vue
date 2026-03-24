<template>
  <div class="h-full w-full flex flex-col overflow-hidden">
    <!-- 主内容区域 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 左侧面板：投料信息查询 + 产出实绩查询 + 管捆列表 -->
      <div class="w-[450px] flex-shrink-0 flex flex-col p-4 space-y-4">
        <!-- 投料信息查询 -->
        <div class="border rounded-lg p-4 relative">
          <div class="absolute -top-3 left-4 px-2 bg-white text-sm font-bold text-[1rem]">
            投料信息查询
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="flex items-center gap-4">
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

            <Button variant="outline" @click="handleQuery1">查询</Button>

            <div class="flex items-center gap-4">
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

            <Button variant="success" class="w-full" @click="handleBundle">成捆</Button>
          </div>
        </div>

        <!-- 产出实绩查询 -->
        <div class="border rounded-lg p-4 relative">
          <div class="absolute -top-3 left-4 px-2 bg-white text-sm font-bold text-[1rem]">
            产出实绩查询
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="flex items-center gap-4">
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

            <Button variant="outline" @click="handleQuery2">查询</Button>

            <div class="flex items-center gap-4">
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

            <Button variant="success" class="w-full" @click="handleSave">保存</Button>
          </div>
          <div class="h-4" />
          <div class="grid grid-cols-3 gap-2">
            <Button variant="primary" class="w-full" @click="handleAddTelegram"
              >新增电文补发</Button
            >
            <Button variant="warning" class="w-full" @click="handleDeleteTelegram"
              >删除电文补发</Button
            >
            <Button variant="destructive" class="w-full" @click="handleDelete">删除</Button>
          </div>
        </div>

        <!-- 管捆列表表格 -->
        <div class="flex-1 min-h-0">
          <div class="border rounded-lg h-full flex flex-col">
            <!-- 固定表头 -->
            <div class="border-b">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-[145px]">合同号</TableHead>
                    <TableHead class="w-[140px]">管捆号</TableHead>
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
                    :class="{ 'bg-accent': selectedIndex === index }"
                    class="cursor-pointer"
                    @click="selectBundle(index)"
                  >
                    <TableCell class="w-[145px]">{{ row.orderNo }}</TableCell>
                    <TableCell class="w-[140px]">{{ row.bundleNo }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧面板：管捆信息 +管子信息 -->
      <div class="flex-1 overflow-auto p-4">
        <div class="space-y-8">
          <!-- 管捆信息表单 -->
          <div class="border rounded-lg p-4 relative">
            <div class="absolute -top-5 left-4 px-2 bg-white text-sm font-bold text-[2rem]">
              管捆信息
            </div>

            <div class="h-6" />

            <!-- 第一行 -->
            <div class="grid grid-cols-10 gap-3 mb-4">
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
                <Label class="text-xs">去向代码</Label>
                <Input v-model="bundleData.directionCode" class="bg-teal-200" />
              </div>
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
                <Label class="text-xs">&nbsp;</Label>
                <Button variant="outline" class="w-full" @click="printLabel">打印标签</Button>
              </div>
            </div>

            <!-- 第二行 -->
            <div class="grid grid-cols-10 gap-3 mb-4">
              <div class="space-y-1">
                <Label class="text-xs">材质代码</Label>
                <Input v-model="bundleData.matNo" class="bg-teal-200" />
              </div>
              <div class="space-y-1 col-span-2">
                <Label class="text-xs">材质正文</Label>
                <Input v-model="bundleData.matText" readonly />
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
                <Label class="text-xs">产品名称</Label>
                <Input v-model="bundleData.prodCname" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">来源</Label>
                <Input v-model="bundleData.source" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">工位</Label>
                <Input v-model="bundleData.workStation" readonly />
              </div>
            </div>

            <!-- 第三行 -->
            <div class="grid grid-cols-10 gap-3 mb-4">
              <div class="space-y-1">
                <Label class="text-xs">标准钢级代码</Label>
                <Input v-model="bundleData.stdSgCode" readonly />
              </div>
              <div class="space-y-1 col-span-2">
                <Label class="text-xs">标准正文</Label>
                <Input v-model="bundleData.stdText" readonly />
              </div>
              <div class="space-y-1 col-span-2">
                <Label class="text-xs">钢级正文</Label>
                <Input v-model="bundleData.sgText" readonly />
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
              <div class="space-y-1">
                <Label class="text-xs">工艺</Label>
                <Input v-model="bundleData.heatTreatStatusCode" readonly />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">投料管捆号</Label>
                <Input v-model="bundleData.oldBundleNo" readonly />
              </div>
            </div>

            <!-- 第四行 -->
            <div class="grid grid-cols-10 gap-3 mb-4">
              <div class="space-y-1">
                <Label class="text-xs">原合同号</Label>
                <Input v-model="bundleData.orderNoOld" readonly />
              </div>
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
            </div>
          </div>

          <!-- 单管明细区域 -->
          <div class="border rounded-lg p-4 relative">
            <div class="absolute -top-5 left-4 px-2 bg-white text-sm font-bold text-[2rem]">
              管子信息
            </div>
            <div class="h-6" />
            <div class="grid grid-cols-6 gap-3 mb-4">
              <div></div>
              <!-- 第一组：起始管号 -->
              <div class="col-span-1 flex items-center gap-2">
                <Label class="text-[1rem] whitespace-nowrap">起始管号:</Label>
                <Input v-model="bundleData.startTubeNo" class="bg-teal-200 flex-1" />
              </div>

              <!-- 第二组：管数 -->
              <div class="col-span-1 flex items-center gap-2">
                <Label class="text-[1rem] whitespace-nowrap">管数:</Label>
                <Input v-model="bundleData.tubeCount" class="bg-teal-200 flex-1" />
              </div>

              <!-- 按钮 -->
              <div class="col-span-1 flex items-end">
                <Button variant="primary" class="w-full" @click="handleGenerateTubeNos"
                  >生成管号</Button
                >
              </div>
            </div>

            <!-- 表头 1-10 -->
            <div class="flex items-center mb-2">
              <div class="w-12 pr-2"></div>
              <!-- 占位，与下面行对齐 -->
              <div class="grid grid-cols-10 gap-2 flex-1">
                <template v-for="i in 10" :key="`header-${i}`">
                  <div class="text-xs text-center font-medium text-muted-foreground">管{{ i }}</div>
                </template>
              </div>
            </div>

            <!-- 管号 1-10 -->
            <div class="space-y-1 mb-3">
              <div class="flex items-center">
                <div class="w-12 text-xs text-muted-foreground pr-2">管号：</div>
                <div class="grid grid-cols-10 gap-2 flex-1">
                  <Input
                    v-for="i in 10"
                    :key="`tubeNo-${i}`"
                    v-model="bundleData.tubes[i - 1].tubeNo"
                    class="text-xs h-8"
                  />
                </div>
              </div>

              <div class="flex items-center">
                <div class="w-12 text-xs text-muted-foreground pr-2">长度：</div>
                <div class="grid grid-cols-10 gap-2 flex-1">
                  <Input
                    v-for="i in 10"
                    :key="`length-${i}`"
                    v-model="bundleData.tubes[i - 1].length"
                    class="text-xs h-8"
                  />
                </div>
              </div>

              <div class="flex items-center">
                <div class="w-12 text-xs text-muted-foreground pr-2">重量：</div>
                <div class="grid grid-cols-10 gap-2 flex-1">
                  <Input
                    v-for="i in 10"
                    :key="`weight-${i}`"
                    v-model="bundleData.tubes[i - 1].weight"
                    class="text-xs h-8"
                  />
                </div>
              </div>
            </div>

            <!-- 表头 11-20 -->
            <div class="flex items-center mb-2 mt-4">
              <div class="w-12 pr-2"></div>
              <!-- 占位，与下面行对齐 -->
              <div class="grid grid-cols-10 gap-2 flex-1">
                <template v-for="i in 10" :key="`header-${i + 10}`">
                  <div class="text-xs text-center font-medium text-muted-foreground">
                    管{{ i + 10 }}
                  </div>
                </template>
              </div>
            </div>

            <!-- 管号 11-20 -->
            <div class="space-y-1 mb-3">
              <div class="flex items-center">
                <div class="w-12 text-xs text-muted-foreground pr-2">管号：</div>
                <div class="grid grid-cols-10 gap-2 flex-1">
                  <Input
                    v-for="i in 10"
                    :key="`tubeNo-${i + 10}`"
                    v-model="bundleData.tubes[i + 9].tubeNo"
                    class="text-xs h-8"
                  />
                </div>
              </div>

              <div class="flex items-center">
                <div class="w-12 text-xs text-muted-foreground pr-2">长度：</div>
                <div class="grid grid-cols-10 gap-2 flex-1">
                  <Input
                    v-for="i in 10"
                    :key="`length-${i + 10}`"
                    v-model="bundleData.tubes[i + 9].length"
                    class="text-xs h-8"
                  />
                </div>
              </div>

              <div class="flex items-center">
                <div class="w-12 text-xs text-muted-foreground pr-2">重量：</div>
                <div class="grid grid-cols-10 gap-2 flex-1">
                  <Input
                    v-for="i in 10"
                    :key="`weight-${i + 10}`"
                    v-model="bundleData.tubes[i + 9].weight"
                    class="text-xs h-8"
                  />
                </div>
              </div>
            </div>

            <!-- 表头 21-30 -->
            <div class="flex items-center mb-2 mt-4">
              <div class="w-12 pr-2"></div>
              <!-- 占位，与下面行对齐 -->
              <div class="grid grid-cols-10 gap-2 flex-1">
                <template v-for="i in 10" :key="`header-${i + 20}`">
                  <div class="text-xs text-center font-medium text-muted-foreground">
                    管{{ i + 20 }}
                  </div>
                </template>
              </div>
            </div>

            <!-- 管号 21-30 -->
            <div class="space-y-1">
              <div class="flex items-center">
                <div class="w-12 text-xs text-muted-foreground pr-2">管号：</div>
                <div class="grid grid-cols-10 gap-2 flex-1">
                  <Input
                    v-for="i in 10"
                    :key="`tubeNo-${i + 20}`"
                    v-model="bundleData.tubes[i + 19].tubeNo"
                    class="text-xs h-8"
                  />
                </div>
              </div>

              <div class="flex items-center">
                <div class="w-12 text-xs text-muted-foreground pr-2">长度：</div>
                <div class="grid grid-cols-10 gap-2 flex-1">
                  <Input
                    v-for="i in 10"
                    :key="`length-${i + 20}`"
                    v-model="bundleData.tubes[i + 19].length"
                    class="text-xs h-8"
                  />
                </div>
              </div>

              <div class="flex items-center">
                <div class="w-12 text-xs text-muted-foreground pr-2">重量：</div>
                <div class="grid grid-cols-10 gap-2 flex-1">
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
  { orderNo: 'ORDER001', bundleNo: 'BDL001' },
  { orderNo: 'ORDER001', bundleNo: 'BDL002' },
  { orderNo: 'ORDER002', bundleNo: 'BDL003' },
  { orderNo: 'ORDER001', bundleNo: 'BDL001' },
  { orderNo: 'ORDER001', bundleNo: 'BDL002' },
  { orderNo: 'ORDER002', bundleNo: 'BDL003' },
  { orderNo: 'ORDER001', bundleNo: 'BDL001' },
  { orderNo: 'ORDER001', bundleNo: 'BDL002' },
  { orderNo: 'ORDER002', bundleNo: 'BDL003' },
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

  // 基本信息
  orderNo: '',
  bundleNo: '',
  roomNo: '',
  directionCode: '',
  prodCname: '',
  source: '',
  workStation: '',

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

function handleBundle() {
  console.log('Bundling tubes:', bundleData.tubes);
}

function handleSave() {
  console.log('Saving bundle data:', bundleData);
}

function handleAddTelegram() {
  console.log('Adding telegram for bundle:', bundleData.bundleNo);
}

function handleDeleteTelegram() {
  console.log('Deleting telegram for bundle:', bundleData.bundleNo);
}

function handleDelete() {
  console.log('Deleting bundle:', bundleData.bundleNo);
}

function printLabel() {
  console.log('Printing label for bundle:', bundleData.bundleNo);
}

function handleGenerateTubeNos() {
  console.log('Generating tube nos for bundle:', bundleData.bundleNo);
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
