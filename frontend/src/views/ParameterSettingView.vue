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
            <Input v-model="formData.order_no" readonly class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">管捆类型：</Label>
            <Input v-model="formData.bundle_type" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">测长允许：</Label>
            <RadioGroup v-model="formData.length_enable" class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <RadioGroupItem id="lengthEnable-allow" value="allow" />
                <Label for="lengthEnable-allow">允许</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem id="lengthEnable-deny" value="deny" />
                <Label for="lengthEnable-deny">禁止</Label>
              </div>
            </RadioGroup>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">管捆号首位：</Label>
            <Select v-model="formData.bundle_first_type">
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
            <Input v-model="formData.item_no" readonly class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">打捆根数：</Label>
            <Input v-model="formData.bundle_number" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">称重允许：</Label>
            <RadioGroup v-model="formData.weight_enable" class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <RadioGroupItem id="weight_enable-allow" value="allow" />
                <Label for="weight_enable-allow">允许</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem id="weight_enable-deny" value="deny" />
                <Label for="weight_enable-deny">禁止</Label>
              </div>
            </RadioGroup>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">管捆流水号：</Label>
            <Input v-model="formData.bundle_flow_no" class="flex-1" />
          </div>

          <!-- Row 3 -->
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap text-blue-700 font-bold">当前轧批号：</Label>
            <Input v-model="formData.roll_no" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">去向：</Label>
            <Input v-model="formData.direction_code" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">针刻印允许：</Label>
            <RadioGroup v-model="formData.carve_enable" class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <RadioGroupItem id="carve_enable-allow" value="allow" />
                <Label for="carve_enable-allow">允许</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem id="carveEnable-deny" value="deny" />
                <Label for="carveEnable-deny">禁止</Label>
              </div>
            </RadioGroup>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">喷印刻印&lt;年&gt;：</Label>
            <Select v-model="formData.spray_year_count">
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
            <Input v-model="formData.produce_job_point" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">喷涂长度小数位数：</Label>
            <Select v-model="formData.spray_length_precision">
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
            <RadioGroup v-model="formData.spray_enable" class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <RadioGroupItem id="spray_enable-allow" value="allow" />
                <Label for="spray_enable-allow">允许</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem id="spray_enable-deny" value="deny" />
                <Label for="spray_enable-deny">禁止</Label>
              </div>
            </RadioGroup>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">管捆标签张数：</Label>
            <Select v-model="formData.label_count">
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
            <Input v-model="formData.melt_no" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">喷涂重量小数位数：</Label>
            <Select v-model="formData.spray_weight_precision">
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
            <RadioGroup v-model="formData.waste_length_enable" class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <RadioGroupItem id="waste_length_enable-allow" value="allow" />
                <Label for="waste_length_enable-allow">允许</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem id="waste_length_enable-deny" value="deny" />
                <Label for="waste_length_enable-deny">禁止</Label>
              </div>
            </RadioGroup>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">判废管长起止：</Label>
            <Input v-model="formData.length_limit_min" class="w-16" />
            <span class="font-bold">-&gt;</span>
            <Input v-model="formData.length_limit_max" class="w-16" />
            <span class="text-sm">米</span>
          </div>

          <!-- Row 6 -->
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">上料试批号：</Label>
            <Input v-model="formData.lot_no" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">色环允许：</Label>
            <RadioGroup v-model="formData.circle_enable" class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <RadioGroupItem id="circle_enable-allow" value="allow" />
                <Label for="circle_enable-allow">允许</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem id="circle_enable-deny" value="deny" />
                <Label for="circle_enable-deny">禁止</Label>
              </div>
            </RadioGroup>
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">重量判废：</Label>
            <RadioGroup v-model="formData.waste_weight_enable" class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <RadioGroupItem id="waste_weight_enable-allow" value="allow" />
                <Label for="waste_weight_enable-allow">允许</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem id="waste_weight_enable-deny" value="deny" />
                <Label for="waste_weight_enable-deny">禁止</Label>
              </div>
            </RadioGroup>
          </div>
          <div class="p-2 border-b">
            <!-- 空白，row6 col4 无内容 -->
          </div>

          <!-- Row 7 -->
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold leading-tight"
              >喷印工位下一<br />根管子流水号</Label
            >
            <Input v-model="formData.flow_no" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">喷枪选择：</Label>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold">1</span>
              <Checkbox v-model="formData.gun1" />
              <span class="text-xs font-bold">2</span>
              <Checkbox v-model="formData.gun2" />
              <span class="text-xs font-bold">3</span>
              <Checkbox v-model="formData.gun3" />
              <span class="text-xs font-bold">4</span>
              <Checkbox v-model="formData.gun4" />
              <span class="text-xs font-bold">5</span>
              <Checkbox v-model="formData.gun5" />
            </div>
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">喷涂长度格式：</Label>
            <RadioGroup v-model="formData.spray_length_type" class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <RadioGroupItem id="spray_length_type-metric" value="metric" />
                <Label for="spray_length_type-metric">公制</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem id="spray_length_type-imperial" value="imperial" />
                <Label for="spray_length_type-imperial">英制</Label>
              </div>
            </RadioGroup>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">包装材料重量：</Label>
            <Input v-model="formData.weight_packging" class="flex-1" />
            <span class="text-sm">KG</span>
          </div>

          <!-- Row 8 -->
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">上料总根数：</Label>
            <Input v-model="formData.feed_number" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">钢管外径：</Label>
            <Input v-model="formData.diameter" class="flex-1" />
            <span class="text-sm">毫米</span>
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">喷涂重量格式：</Label>
            <RadioGroup v-model="formData.spray_weight_type" class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <RadioGroupItem id="spray_weight_type-metric" value="metric" />
                <Label for="spray_weight_type-metric">公制</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem id="spray_weight_type-imperial" value="imperial" />
                <Label for="spray_weight_type-imperial">英制</Label>
              </div>
            </RadioGroup>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">标签长度格式：</Label>
            <RadioGroup v-model="formData.label_length_type" class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <RadioGroupItem id="label_length_type-metric" value="metric" />
                <Label for="label_length_type-metric">公制</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem id="label_length_type-imperial" value="imperial" />
                <Label for="label_length_type-imperial">英制</Label>
              </div>
            </RadioGroup>
          </div>

          <!-- Row 9 -->
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">接箍炉号：</Label>
            <Input v-model="formData.melt_no_coupling" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">保护环重量：</Label>
            <Input v-model="formData.weight_coupling" class="flex-1" />
            <span class="text-sm">KG</span>
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">管重偏差上限：</Label>
            <Input v-model="formData.weight_limit_max" class="flex-1" />
            <span class="text-sm">%</span>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">标签重量格式：</Label>
            <RadioGroup v-model="formData.label_weight_type" class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <RadioGroupItem id="label_weight_type-metric" value="metric" />
                <Label for="label_weight_type-metric">公制</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem id="label_weight_type-imperial" value="imperial" />
                <Label for="label_weight_type-imperial">英制</Label>
              </div>
            </RadioGroup>
          </div>

          <!-- Row 10 -->
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">接箍批号：</Label>
            <Input v-model="formData.lot_no_coupling" class="flex-1" />
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">保护环长度：</Label>
            <Input v-model="formData.length_coupling" class="flex-1" />
            <span class="text-sm">米</span>
          </div>
          <div class="flex items-center gap-2 p-2 border-b border-r">
            <Label class="whitespace-nowrap font-bold">管重偏差下限：</Label>
            <Input v-model="formData.weight_limit_min" class="flex-1" />
            <span class="text-sm">%</span>
          </div>
          <div class="flex items-center gap-2 p-2 border-b">
            <Label class="whitespace-nowrap font-bold">标签格式：</Label>
            <RadioGroup v-model="formData.label_type" class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <RadioGroupItem id="label_type-fixed" value="fixed" />
                <Label for="label_type-fixed">固定</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem id="label_type-free" value="free" />
                <Label for="label_type-free">自由</Label>
              </div>
            </RadioGroup>
          </div>

          <!-- Row 11 -->
          <div class="flex items-center gap-2 p-2 border-r">
            <Label class="whitespace-nowrap font-bold leading-tight"
              >测长工位下<br />一根管号</Label
            >
            <Input v-model="formData.tube_no" class="flex-1" />
          </div>
          <div class="p-2 border-r">
            <!-- 空白 -->
          </div>
          <div class="flex items-center gap-2 p-2 border-r">
            <Label class="whitespace-nowrap font-bold">二维码喷印：</Label>
            <RadioGroup v-model="formData.qrcode_spray_enable" class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <RadioGroupItem id="qrcode_spray_enable-allow" value="allow" />
                <Label for="qrcode_spray_enable-allow">允许</Label>
              </div>
              <div class="flex items-center gap-1">
                <RadioGroupItem id="qrcode_spray_enable-deny" value="deny" />
                <Label for="qrcode_spray_enable-deny">禁止</Label>
              </div>
            </RadioGroup>
          </div>
          <div class="flex items-center justify-end gap-4 p-2">
            <Button @click="handleRefresh">刷新</Button>
            <Button variant="default" @click="handleConfirm">确认修改</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { toast } from 'vue-sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getParameterSet, saveParameterSet, formToApi, apiToForm } from '@/api';
import type { ParameterSetForm } from '@/api';

// 表单数据
const formData = reactive<ParameterSetForm>({
  // 第一列 - 基本信息
  order_no: '', // 当前合同号（只读）
  item_no: '', // 当前项目号（只读）
  roll_no: '', // 当前轧批号
  produce_job_point: '', // 机组代码
  melt_no: '', // 上料炉号
  lot_no: '', // 上料试批号
  flow_no: '', // 喷印工位下一根管子流水号
  feed_number: '', // 上料总根数
  melt_no_coupling: '', // 接箍炉号
  lot_no_coupling: '', // 接箍批号
  tube_no: '', // 测长工位下一根管号

  // 第二列 - 管捆/喷涂参数
  bundle_type: '', // 管捆类型
  bundle_number: '', // 打捆根数
  direction_code: '', // 去向
  spray_length_precision: '', // 喷涂长度小数位数
  spray_weight_precision: '', // 喷涂重量小数位数
  circle_enable: 'allow', // 色环允许
  circle_time: '', // 色环时间
  weight_coupling: '', // 保护环重量
  length_coupling: '', // 保护环长度

  // 喷枪选择
  gun1: true, //色环喷枪1
  gun2: true, //色环喷枪2
  gun3: true, //色环喷枪3
  gun4: true, //色环喷枪4
  gun5: true, //色环喷枪5

  // 第三列 - 允许/禁止开关
  length_enable: 'allow', // 测长允许
  weight_enable: 'allow', // 称重允许
  carve_enable: 'deny', // 针刻印允许
  spray_enable: 'allow', // 喷印允许
  waste_length_enable: 'allow', // 长度判废
  waste_weight_enable: 'allow', // 重量判废
  spray_length_type: 'metric', // 喷涂长度格式
  spray_weight_type: 'metric', // 喷涂重量格式
  weight_limit_max: '', // 管重偏差上限
  weight_limit_min: '', // 管重偏差下限
  qrcode_spray_enable: 'deny', // 二维码喷印

  // 第四列 - 标签/管捆编号
  bundle_first_type: '', // 管捆号首位
  bundle_flow_no: '', // 管捆流水号
  spray_year_count: '', // 喷印刻印<年>
  label_count: '', // 管捆标签张数
  length_limit_min: '', // 判废管长起
  length_limit_max: '', // 判废管长止
  weight_packging: '', // 包装材料重量
  label_length_type: 'metric', // 标签长度格式
  label_weight_type: 'metric', // 标签重量格式
  label_type: 'fixed', // 标签格式

  // 隐藏字段（表中有但画面上不直接显示的）
  diameter: '',
  thickness: '',
  order_weight: '',
  gun_clear: '',
  weight_per_meter: '',
  weight_ew: '',
});

// 下拉选项
const bundleFirstTypeOptions = ref(['1：油管', '2：套管']);
const paperCountOptions = ref(['1位', '2位', '2位(含季默认1位)']);
const emCountOptions = ref(['0', '1', '2', '3', '4']);
const precisionOptions = ref(['0', '1', '2', '3']);

const loading = ref(false);

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const data = await getParameterSet();
    const form = apiToForm(data);
    Object.assign(formData, form);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      toast.warning('没有查询到参数记录');
    } else {
      toast.error('查询参数失败');
    }
  } finally {
    loading.value = false;
  }
}

// 页面加载时自动查询
onMounted(() => {
  loadData();
});

// 事件处理
function handleRefresh() {
  loadData();
}

async function handleConfirm() {
  loading.value = true;
  try {
    const apiData = formToApi(formData);
    await saveParameterSet(apiData);
    toast.success('参数保存成功');
  } catch {
    toast.error('参数保存失败');
  } finally {
    loading.value = false;
  }
}
</script>
