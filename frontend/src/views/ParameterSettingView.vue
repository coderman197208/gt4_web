<template>
  <div class="h-full w-full flex flex-col overflow-hidden p-4">
    <!-- 参数设定 GroupBox -->
    <div class="border rounded-lg p-4 relative flex-1 flex flex-col min-h-0">
      <div class="absolute -top-3 left-4 px-2 bg-white text-sm font-bold text-[1rem]">参数设定</div>

      <!-- 主参数表格区域 -->
      <div class="flex-1 min-h-0 overflow-auto">
        <div class="grid grid-cols-4 gap-x-4 border rounded">
          <!-- Row 1 -->
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap text-blue-700 font-bold">当前合同号：</Label>
            <Input v-model="formData.orderNo" readonly class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">管捆类型：</Label>
            <Input v-model="formData.bundleType" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">测长允许：</Label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.lengthEnable"
                  type="radio"
                  name="lengthEnable"
                  value="allow"
                />
                <span>允许</span>
              </label>
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.lengthEnable"
                  type="radio"
                  name="lengthEnable"
                  value="deny"
                />
                <span>禁止</span>
              </label>
            </div>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">管捆号首位：</Label>
            <Select v-model="formData.bundleFirstType">
              <SelectTrigger class="flex-1">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="item in bundleFirstTypeOptions" :key="item" :value="item">
                  {{ item }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Row 2 -->
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap text-blue-700 font-bold">当前项目号：</Label>
            <Input v-model="formData.itemNo" readonly class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">打捆根数：</Label>
            <Input v-model="formData.bundleNum" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">称重允许：</Label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.weightEnable"
                  type="radio"
                  name="weightEnable"
                  value="allow"
                />
                <span>允许</span>
              </label>
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.weightEnable"
                  type="radio"
                  name="weightEnable"
                  value="deny"
                />
                <span>禁止</span>
              </label>
            </div>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">管捆流水号：</Label>
            <Input v-model="formData.bundleFlowNo" class="flex-1" />
          </div>

          <!-- Row 3 -->
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap text-blue-700 font-bold">当前轧批号：</Label>
            <Input v-model="formData.rollNo" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">去向：</Label>
            <Input v-model="formData.direction" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">针刻印允许：</Label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.carveEnable"
                  type="radio"
                  name="carveEnable"
                  value="allow"
                />
                <span>允许</span>
              </label>
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.carveEnable"
                  type="radio"
                  name="carveEnable"
                  value="deny"
                />
                <span>禁止</span>
              </label>
            </div>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">喷印刻印&lt;年&gt;：</Label>
            <Select v-model="formData.paperCount">
              <SelectTrigger class="flex-1">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="item in paperCountOptions" :key="item" :value="item">
                  {{ item }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Row 4 -->
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap text-blue-700 font-bold">机组代码：</Label>
            <Input v-model="formData.lineCode" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">喷涂长度小数位数：</Label>
            <Select v-model="formData.sprayLenPrecision">
              <SelectTrigger class="w-20">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="item in precisionOptions" :key="item" :value="item">
                  {{ item }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">喷印允许：</Label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.sprayEnable"
                  type="radio"
                  name="sprayEnable"
                  value="allow"
                />
                <span>允许</span>
              </label>
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.sprayEnable"
                  type="radio"
                  name="sprayEnable"
                  value="deny"
                />
                <span>禁止</span>
              </label>
            </div>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">管捆标签张数：</Label>
            <Select v-model="formData.emCount">
              <SelectTrigger class="flex-1">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="item in emCountOptions" :key="item" :value="item">
                  {{ item }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Row 5 -->
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">上料炉号：</Label>
            <Input v-model="formData.meltNo" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">喷涂重量小数位数：</Label>
            <Select v-model="formData.sprayWeiPrecision">
              <SelectTrigger class="w-20">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="item in precisionOptions" :key="item" :value="item">
                  {{ item }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">长度判废：</Label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.wasteLengthEnable"
                  type="radio"
                  name="wasteLengthEnable"
                  value="allow"
                />
                <span>允许</span>
              </label>
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.wasteLengthEnable"
                  type="radio"
                  name="wasteLengthEnable"
                  value="deny"
                />
                <span>禁止</span>
              </label>
            </div>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">判废管长起止：</Label>
            <Input v-model="formData.wasteLengthFrom" class="w-16" />
            <span class="font-bold">-&gt;</span>
            <Input v-model="formData.wasteLengthTo" class="w-16" />
            <span class="text-sm">米</span>
          </div>

          <!-- Row 6 -->
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">上料试批号：</Label>
            <Input v-model="formData.lotNo" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">色环允许：</Label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.circleEnable"
                  type="radio"
                  name="circleEnable"
                  value="allow"
                />
                <span>允许</span>
              </label>
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.circleEnable"
                  type="radio"
                  name="circleEnable"
                  value="deny"
                />
                <span>禁止</span>
              </label>
            </div>
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">重量判废：</Label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.wasteWeightEnable"
                  type="radio"
                  name="wasteWeightEnable"
                  value="allow"
                />
                <span>允许</span>
              </label>
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.wasteWeightEnable"
                  type="radio"
                  name="wasteWeightEnable"
                  value="deny"
                />
                <span>禁止</span>
              </label>
            </div>
          </div>
          <div class="p-2 border-b">
            <!-- 空白，row6 col4 无内容 -->
          </div>

          <!-- Row 7 -->
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold leading-tight"
              >喷印工位下一<br />根管子流水号</Label
            >
            <Input v-model="formData.flowNo" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">喷枪选择：</Label>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold">1</span>
              <Checkbox v-model:checked="formData.circle1" />
              <span class="text-xs font-bold">2</span>
              <Checkbox v-model:checked="formData.circle2" />
              <span class="text-xs font-bold">3</span>
              <Checkbox v-model:checked="formData.circle3" />
              <span class="text-xs font-bold">4</span>
              <Checkbox v-model:checked="formData.circle4" />
              <span class="text-xs font-bold">5</span>
              <Checkbox v-model:checked="formData.circle5" />
            </div>
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">喷涂长度格式：</Label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.sprayLengthType"
                  type="radio"
                  name="sprayLengthType"
                  value="metric"
                />
                <span>公制</span>
              </label>
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.sprayLengthType"
                  type="radio"
                  name="sprayLengthType"
                  value="imperial"
                />
                <span>英制</span>
              </label>
            </div>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">包装材料重量：</Label>
            <Input v-model="formData.weightPackaging" class="flex-1" />
            <span class="text-sm">KG</span>
          </div>

          <!-- Row 8 -->
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">上料总根数：</Label>
            <Input v-model="formData.totalNum" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">钢管外径：</Label>
            <Input v-model="formData.circleTime" class="flex-1" />
            <span class="text-sm">毫米</span>
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">喷涂重量格式：</Label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.sprayWeightType"
                  type="radio"
                  name="sprayWeightType"
                  value="metric"
                />
                <span>公制</span>
              </label>
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.sprayWeightType"
                  type="radio"
                  name="sprayWeightType"
                  value="imperial"
                />
                <span>英制</span>
              </label>
            </div>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">标签长度格式：</Label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.tagLengthType"
                  type="radio"
                  name="tagLengthType"
                  value="metric"
                />
                <span>公制</span>
              </label>
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.tagLengthType"
                  type="radio"
                  name="tagLengthType"
                  value="imperial"
                />
                <span>英制</span>
              </label>
            </div>
          </div>

          <!-- Row 9 -->
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">接箍炉号：</Label>
            <Input v-model="formData.meltNoCoupling" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">保护环重量：</Label>
            <Input v-model="formData.weightCoupling" class="flex-1" />
            <span class="text-sm">KG</span>
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">管重偏差上限：</Label>
            <Input v-model="formData.weightUpperLimit" class="flex-1" />
            <span class="text-sm">%</span>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">标签重量格式：</Label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.tagWeightType"
                  type="radio"
                  name="tagWeightType"
                  value="metric"
                />
                <span>公制</span>
              </label>
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.tagWeightType"
                  type="radio"
                  name="tagWeightType"
                  value="imperial"
                />
                <span>英制</span>
              </label>
            </div>
          </div>

          <!-- Row 10 -->
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">接箍批号：</Label>
            <Input v-model="formData.lotNoCoupling" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">保护环长度：</Label>
            <Input v-model="formData.lengthCoupling" class="flex-1" />
            <span class="text-sm">米</span>
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">管重偏差下限：</Label>
            <Input v-model="formData.weightLowerLimit" class="flex-1" />
            <span class="text-sm">%</span>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">塑料标签格式：</Label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1">
                <input v-model="formData.emType" type="radio" name="emType" value="fixed" />
                <span>固定</span>
              </label>
              <label class="flex items-center gap-1">
                <input v-model="formData.emType" type="radio" name="emType" value="free" />
                <span>自由</span>
              </label>
            </div>
          </div>

          <!-- Row 11 -->
          <div class="flex items-center gap-2 p-2 border-r">
            <Label class="whitespace-nowrap font-bold leading-tight"
              >测长工位下<br />一根管号</Label
            >
            <Input v-model="formData.tubeNo" class="flex-1" />
          </div>
          <div class="p-2 border-r">
            <!-- 空白 -->
          </div>
          <div class="flex items-center gap-2 p-2 border-r">
            <Label class="whitespace-nowrap font-bold">二维码喷印：</Label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.quickMarkSprayEnable"
                  type="radio"
                  name="quickMarkSprayEnable"
                  value="allow"
                />
                <span>允许</span>
              </label>
              <label class="flex items-center gap-1">
                <input
                  v-model="formData.quickMarkSprayEnable"
                  type="radio"
                  name="quickMarkSprayEnable"
                  value="deny"
                />
                <span>禁止</span>
              </label>
            </div>
          </div>
          <div class="flex items-center justify-end gap-4 p-2">
            <Button @click="handleRefresh">刷新</Button>
            <Button variant="info" @click="handleConfirm">确认修改</Button>
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// 表单数据
const formData = reactive({
  // 第一列 - 基本信息
  orderNo: '', // 当前合同号（只读）
  itemNo: '', // 当前项目号（只读）
  rollNo: '', // 当前轧批号
  lineCode: '', // 机组代码
  meltNo: '', // 上料炉号
  lotNo: '', // 上料试批号
  flowNo: '', // 喷印工位下一根管子流水号
  totalNum: '', // 上料总根数
  meltNoCoupling: '', // 接箍炉号
  lotNoCoupling: '', // 接箍批号
  tubeNo: '', // 测长工位下一根管号

  // 第二列 - 管捆/喷涂参数
  bundleType: '', // 管捆类型
  bundleNum: '', // 打捆根数
  direction: '', // 去向
  sprayLenPrecision: '', // 喷涂长度小数位数
  sprayWeiPrecision: '', // 喷涂重量小数位数
  circleEnable: 'allow', // 色环允许
  circleTime: '', // 钢管外径
  weightCoupling: '', // 保护环重量
  lengthCoupling: '', // 保护环长度

  // 喷枪选择
  circle1: true,
  circle2: true,
  circle3: true,
  circle4: true,
  circle5: true,

  // 第三列 - 允许/禁止开关
  lengthEnable: 'allow', // 测长允许
  weightEnable: 'allow', // 称重允许
  carveEnable: 'deny', // 针刻印允许
  sprayEnable: 'allow', // 喷印允许
  wasteLengthEnable: 'allow', // 长度判废
  wasteWeightEnable: 'allow', // 重量判废
  sprayLengthType: 'metric', // 喷涂长度格式
  sprayWeightType: 'metric', // 喷涂重量格式
  weightUpperLimit: '', // 管重偏差上限
  weightLowerLimit: '', // 管重偏差下限
  quickMarkSprayEnable: 'deny', // 二维码喷印

  // 第四列 - 标签/管捆编号
  bundleFirstType: '', // 管捆号首位
  bundleFlowNo: '', // 管捆流水号
  paperCount: '', // 喷印刻印<年>
  emCount: '', // 管捆标签张数
  wasteLengthFrom: '', // 判废管长起
  wasteLengthTo: '', // 判废管长止
  weightPackaging: '', // 包装材料重量
  tagLengthType: 'metric', // 标签长度格式
  tagWeightType: 'metric', // 标签重量格式
  emType: 'fixed', // 塑料标签格式
});

// 下拉选项
const bundleFirstTypeOptions = ref(['1：油管', '2：套管']);
const paperCountOptions = ref(['1位', '2位', '2位(含季默认1位)']);
const emCountOptions = ref(['0', '1', '2', '3', '4']);
const precisionOptions = ref(['0', '1', '2', '3']);

// 事件处理
function handleRefresh() {
  console.log('refresh');
}

function handleConfirm() {
  console.log('confirm', formData);
}
</script>
