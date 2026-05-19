<template>
  <div class="parameter-setting-view w-full overflow-hidden bg-[#d8d8d8] p-2">
    <div
      class="relative flex h-full min-h-0 flex-col rounded-[3px] border border-[#868686] bg-[#d3d3d3] mt-4 px-2 pt-[14px] pb-2 shadow-[inset_0_1px_0_#f7f7f7]"
    >
      <div
        class="absolute -top-[11px] left-3 bg-[#d8d8d8] px-1 text-sm font-bold leading-[1.2] text-[#6f1616]"
      >
        参数设定
      </div>

      <!-- <div
        class="flex-1 min-h-0 overflow-auto rounded-[2px] border border-[#8a8a8a] bg-[#d8d8d8] p-1.5 shadow-[inset_0_1px_0_#f4f4f4]"
      > -->
      <div
        class="parameter-grid grid grid-cols-4 gap-x-0 overflow-hidden rounded-[2px] border border-[#8a8a8a]"
      >
        <!-- Row 1 -->
        <div class="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap text-blue-700 font-bold">当前合同号：</Label>
          <Input v-model="formData.order_no" variant="readonly" readonly class="flex-1" />
        </div>
        <div class="grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap font-bold">管捆类型：</Label>
          <Input v-model="formData.bundle_type" class="flex-1" />
        </div>
        <div
          class="grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-center gap-2 p-4 border-b border-r"
        >
          <Label class="whitespace-nowrap font-bold">测长允许：</Label>
          <WinRadioGroup v-model="formData.length_enable" :options="allowDenyOptions" />
        </div>
        <div class="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b">
          <Label class="whitespace-nowrap font-bold">管捆号首位：</Label>
          <WinSelect v-model="formData.bundle_first_type" :options="bundleFirstTypeOptions" />
        </div>

        <!-- Row 2 -->
        <div class="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap text-blue-700 font-bold">当前项目号：</Label>
          <Input v-model="formData.item_no" variant="readonly" readonly class="flex-1" />
        </div>
        <div class="grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap font-bold">打捆根数：</Label>
          <Input v-model="formData.bundle_number" class="flex-1" />
        </div>
        <div
          class="grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-center gap-2 p-4 border-b border-r"
        >
          <Label class="whitespace-nowrap font-bold">称重允许：</Label>
          <WinRadioGroup v-model="formData.weight_enable" :options="allowDenyOptions" />
        </div>
        <div class="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b">
          <Label class="whitespace-nowrap font-bold">管捆流水号：</Label>
          <Input v-model="formData.bundle_flow_no" class="flex-1" />
        </div>

        <!-- Row 3 -->
        <div class="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap text-blue-700 font-bold">当前轧批号：</Label>
          <Input v-model="formData.roll_no" class="flex-1" />
        </div>
        <div class="grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap font-bold">去向：</Label>
          <Input v-model="formData.direction_code" class="flex-1" />
        </div>
        <div
          class="grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-center gap-2 p-4 border-b border-r"
        >
          <Label class="whitespace-nowrap font-bold">针刻印允许：</Label>
          <WinRadioGroup v-model="formData.carve_enable" :options="allowDenyOptions" />
        </div>
        <div class="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b">
          <Label class="whitespace-nowrap font-bold">喷印刻印&lt;年&gt;：</Label>
          <WinSelect v-model="formData.spray_year_count" :options="paperCountOptions" />
        </div>

        <!-- Row 4 -->
        <div class="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap text-blue-700 font-bold">机组代码：</Label>
          <Input v-model="formData.produce_job_point" class="flex-1" />
        </div>
        <div class="grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap font-bold">喷涂长度小数位数：</Label>
          <WinSelect
            v-model="formData.spray_length_precision"
            :options="precisionOptions"
            placeholder="选择"
            trigger-class="w-20"
          />
        </div>
        <div
          class="grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-center gap-2 p-4 border-b border-r"
        >
          <Label class="whitespace-nowrap font-bold">喷印允许：</Label>
          <WinRadioGroup v-model="formData.spray_enable" :options="allowDenyOptions" />
        </div>
        <div class="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b">
          <Label class="whitespace-nowrap font-bold">管捆标签张数：</Label>
          <WinSelect v-model="formData.label_count" :options="emCountOptions" />
        </div>

        <!-- Row 5 -->
        <div class="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap font-bold">上料炉号：</Label>
          <Input v-model="formData.melt_no" class="flex-1" />
        </div>
        <div class="grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap font-bold">喷涂重量小数位数：</Label>
          <WinSelect
            v-model="formData.spray_weight_precision"
            :options="precisionOptions"
            placeholder="选择"
            trigger-class="w-20"
          />
        </div>
        <div
          class="grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-center gap-2 p-4 border-b border-r"
        >
          <Label class="whitespace-nowrap font-bold">长度判废：</Label>
          <WinRadioGroup v-model="formData.waste_length_enable" :options="allowDenyOptions" />
        </div>
        <div class="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b">
          <Label class="whitespace-nowrap font-bold">判废管长起止：</Label>
          <div class="flex items-center justify-start gap-2">
            <Input v-model="formData.length_limit_min" class="w-16" />
            <span class="font-bold">-&gt;</span>
            <Input v-model="formData.length_limit_max" class="w-16" />
            <span class="text-sm">米</span>
          </div>
        </div>

        <!-- Row 6 -->
        <div class="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap font-bold">上料试批号：</Label>
          <Input v-model="formData.lot_no" class="flex-1" />
        </div>
        <div class="grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap font-bold">色环允许：</Label>
          <WinRadioGroup v-model="formData.circle_enable" :options="allowDenyOptions" />
        </div>
        <div
          class="grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-center gap-2 p-4 border-b border-r"
        >
          <Label class="whitespace-nowrap font-bold">重量判废：</Label>
          <WinRadioGroup v-model="formData.waste_weight_enable" :options="allowDenyOptions" />
        </div>
        <div class="p-4 border-b">
          <!-- 空白，row6 col4 无内容 -->
        </div>

        <!-- Row 7 -->
        <div class="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap font-bold leading-tight"
            >喷印工位下一<br />根管子流水号</Label
          >
          <Input v-model="formData.flow_no" class="flex-1" />
        </div>
        <div class="grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap font-bold">喷枪选择：</Label>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold">1</span>
            <WinCheckbox v-model="formData.gun1" />
            <span class="text-xs font-bold">2</span>
            <WinCheckbox v-model="formData.gun2" />
            <span class="text-xs font-bold">3</span>
            <WinCheckbox v-model="formData.gun3" />
            <span class="text-xs font-bold">4</span>
            <WinCheckbox v-model="formData.gun4" />
            <span class="text-xs font-bold">5</span>
            <WinCheckbox v-model="formData.gun5" />
          </div>
        </div>
        <div
          class="grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-center gap-2 p-4 border-b border-r"
        >
          <Label class="whitespace-nowrap font-bold">喷涂长度格式：</Label>
          <WinRadioGroup v-model="formData.spray_length_type" :options="metricImperialOptions" />
        </div>
        <div class="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b">
          <Label class="whitespace-nowrap font-bold">包装材料重量：</Label>
          <div class="flex items-center justify-start gap-2">
            <Input v-model="formData.weight_packaging" class="flex-1" />
            <span class="text-sm">KG</span>
          </div>
        </div>

        <!-- Row 8 -->
        <div class="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap font-bold">上料总根数：</Label>
          <Input v-model="formData.feed_number" class="flex-1" />
        </div>
        <div class="grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap font-bold">钢管外径：</Label>
          <div class="unit-input-row">
            <Input v-model="formData.diameter" class="w-full" />
            <span class="unit-label text-sm">毫米</span>
          </div>
        </div>
        <div
          class="grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-center gap-2 p-4 border-b border-r"
        >
          <Label class="whitespace-nowrap font-bold">喷涂重量格式：</Label>
          <WinRadioGroup v-model="formData.spray_weight_type" :options="metricImperialOptions" />
        </div>
        <div class="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b">
          <Label class="whitespace-nowrap font-bold">标签长度格式：</Label>
          <WinRadioGroup v-model="formData.label_length_type" :options="metricImperialOptions" />
        </div>

        <!-- Row 9 -->
        <div class="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap font-bold">接箍炉号：</Label>
          <Input v-model="formData.melt_no_coupling" class="flex-1" />
        </div>
        <div class="grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap font-bold">保护环重量：</Label>
          <div class="unit-input-row">
            <Input v-model="formData.weight_coupling" class="w-full" />
            <span class="unit-label text-sm">KG</span>
          </div>
        </div>
        <div
          class="grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-center gap-2 p-4 border-b border-r"
        >
          <Label class="whitespace-nowrap font-bold">管重偏差上限：</Label>
          <Input v-model="formData.weight_limit_max" class="flex-1" />
          <span class="text-sm">%</span>
        </div>
        <div class="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b">
          <Label class="whitespace-nowrap font-bold">标签重量格式：</Label>
          <WinRadioGroup v-model="formData.label_weight_type" :options="metricImperialOptions" />
        </div>

        <!-- Row 10 -->
        <div class="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap font-bold">接箍批号：</Label>
          <Input v-model="formData.lot_no_coupling" class="flex-1" />
        </div>
        <div class="grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-2 p-4 border-b border-r">
          <Label class="whitespace-nowrap font-bold">保护环长度：</Label>
          <div class="unit-input-row">
            <Input v-model="formData.length_coupling" class="w-full" />
            <span class="unit-label text-sm">米</span>
          </div>
        </div>
        <div
          class="grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-center gap-2 p-4 border-b border-r"
        >
          <Label class="whitespace-nowrap font-bold">管重偏差下限：</Label>
          <Input v-model="formData.weight_limit_min" class="flex-1" />
          <span class="text-sm">%</span>
        </div>
        <div class="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-b">
          <Label class="whitespace-nowrap font-bold">标签格式：</Label>
          <WinRadioGroup v-model="formData.label_type" :options="labelTypeOptions" />
        </div>

        <!-- Row 11 -->
        <div class="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-2 p-4 border-r">
          <Label class="whitespace-nowrap font-bold leading-tight">测长工位下<br />一根管号</Label>
          <Input v-model="formData.tube_no" class="flex-1" />
        </div>
        <div class="p-2 border-r">
          <!-- 空白 -->
        </div>
        <div class="grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-center gap-2 p-4 border-r">
          <Label class="whitespace-nowrap font-bold">二维码喷印：</Label>
          <WinRadioGroup v-model="formData.qrcode_spray_enable" :options="allowDenyOptions" />
        </div>
        <div class="flex items-center justify-end gap-2 p-3">
          <Button class="min-w-24" :disabled="loading" @click="handleRefresh"> 刷新 </Button>
          <Button class="min-w-24" :disabled="loading" @click="handleConfirm"> 确认修改 </Button>
        </div>
        <!-- </div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { toast } from 'vue-sonner';
import Button from '@/components/custom/WinButton.vue';
import WinCheckbox from '@/components/custom/WinCheckbox.vue';
import Input from '@/components/custom/WinInput.vue';
import WinRadioGroup from '@/components/custom/WinRadioGroup.vue';
import WinSelect from '@/components/custom/WinSelect.vue';
import { Label } from '@/components/ui/label';
import { getParameterSet, saveParameterSet, formToApi, apiToForm } from '@/api';
import type { ParameterSetForm } from '@/api';
import { useWebSocket } from '@/services/websocket';

const { sendUserCommand } = useWebSocket();

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
  weight_packaging: '', // 包装材料重量
  label_length_type: 'metric', // 标签长度格式
  label_weight_type: 'metric', // 标签重量格式
  label_type: 'fixed', // 标签格式

  // 隐藏字段（表中有但画面上不直接显示的）
  diameter: '',
  wall_thickness: '',
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
const allowDenyOptions = [
  { label: '允许', value: 'allow' },
  { label: '禁止', value: 'deny' },
];
const metricImperialOptions = [
  { label: '公制', value: 'metric' },
  { label: '英制', value: 'imperial' },
];
const labelTypeOptions = [
  { label: '固定', value: 'fixed' },
  { label: '自由', value: 'free' },
];

const loading = ref(false);

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const data = await getParameterSet();
    const form = apiToForm(data);
    Object.assign(formData, form);
  } catch (err: unknown) {
    const status =
      typeof err === 'object' && err !== null && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;

    if (status === 404) {
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
    sendUserCommand('parameter_set_updated'); // 发送参数更新通知
    toast.success('参数保存成功');
  } catch {
    toast.error('参数保存失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.parameter-setting-view {
  background: #d8d8d8;
  font-family: 'Microsoft YaHei', system-ui, sans-serif;
}

.parameter-grid {
  background: #8a8a8a;
}

.parameter-grid > div {
  background: #d8d8d8;
  border-color: #6f6f6f;
  box-shadow: inset 0 1px 0 #f4f4f4;
}

.parameter-grid :deep(label) {
  color: #111827;
  font-size: 15px;
  font-weight: 700;
}

.parameter-grid :deep(label.text-blue-700) {
  color: #1d47a4;
}

.parameter-grid span {
  color: #333333;
}

.unit-input-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 2.75rem;
  align-items: center;
  column-gap: 0.5rem;
}

.unit-label {
  justify-self: start;
  text-align: left;
}

.parameter-grid :deep([data-slot='input']) {
  height: 32px;
  box-shadow: none;
}

.parameter-grid :deep(.win-button) {
  height: 32px;
  font-size: 12px;
  font-weight: 700;
}
</style>
