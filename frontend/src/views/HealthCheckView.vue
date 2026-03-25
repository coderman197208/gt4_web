<template>
  <div class="health-check h-full flex flex-col overflow-hidden">
    <!-- 顶部状态栏 -->
    <div class="flex-shrink-0 grid grid-cols-2 gap-2 mb-2">
      <div class="border rounded p-2">
        <Button @click="checkHealth" size="sm" class="w-full mb-1">Check Backend Health</Button>
        <p v-if="result" class="text-xs">Backend: {{ result }}</p>
      </div>
      <div class="border rounded p-2">
        <div class="flex items-center gap-2 mb-1">
          <span class="font-semibold text-sm">WebSocket状态:</span>
          <span :class="isConnected ? 'text-green-600' : 'text-red-600'" class="text-sm">
            {{ isConnected ? '已连接' : '未连接' }}
          </span>
        </div>
        <p v-if="error" class="text-red-600 text-xs">{{ error }}</p>
      </div>
    </div>

    <!-- Tag1 数据展示（表格，一行6列） -->
    <div class="flex-shrink-0 border rounded p-2 mb-2">
      <h3 class="text-sm font-semibold mb-1">Tag1 数据</h3>
      <Table v-if="realtimeStore.tag1" class="text-xs">
        <TableHeader>
          <TableRow>
            <TableHead class="p-1 h-auto">批号</TableHead>
            <TableHead class="p-1 h-auto">炉号</TableHead>
            <TableHead class="p-1 h-auto">车组号</TableHead>
            <TableHead class="p-1 h-auto">拖链序号</TableHead>
            <TableHead class="p-1 h-auto">轧制温度</TableHead>
            <TableHead class="p-1 h-auto">轧制编号</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell class="p-1">{{ realtimeStore.tag1.ph }}</TableCell>
            <TableCell class="p-1">{{ realtimeStore.tag1.lh }}</TableCell>
            <TableCell class="p-1">{{ realtimeStore.tag1.czh }}</TableCell>
            <TableCell class="p-1">{{ realtimeStore.tag1.tlxh }}</TableCell>
            <TableCell class="p-1">{{ realtimeStore.tag1.zzwj }}</TableCell>
            <TableCell class="p-1">{{ realtimeStore.tag1.zzbh }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <p v-else class="text-gray-500 text-xs">等待数据...</p>
    </div>

    <!-- Tag2 和 Tag3 数据并排展示 -->
    <div class="flex-1 grid grid-cols-2 gap-2 overflow-hidden">
      <!-- Tag2 数据展示（单个数字，只读输入框） -->
      <div class="border rounded p-2 flex flex-col">
        <h3 class="text-sm font-semibold mb-1 flex-shrink-0">Tag2 数据</h3>
        <Input
          v-if="realtimeStore.tag2 !== null"
          :model-value="String(realtimeStore.tag2)"
          readonly
          class="text-xs h-8"
        />
        <p v-else class="text-gray-500 text-xs">等待数据...</p>
      </div>

      <!-- Tag3 数据展示（6行1列表格） -->
      <div class="border rounded p-2 flex flex-col overflow-hidden">
        <h3 class="text-sm font-semibold mb-1 flex-shrink-0">Tag3 数据</h3>
        <Table v-if="realtimeStore.tag3" class="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead class="p-1 h-auto">值</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="(value, index) in realtimeStore.tag3" :key="index">
              <TableCell class="p-1">{{ value }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <p v-else class="text-gray-500 text-xs">等待数据...</p>
      </div>
    </div>

    <!-- PlanInfo 数据展示 -->
    <div class="border rounded p-2 mb-2">
      <h3 class="text-sm font-semibold mb-1">PlanInfo 数据</h3>
      <Table v-if="realtimeStore.planInfo" class="text-xs">
        <TableHeader>
          <TableRow>
            <TableHead class="p-1 h-auto">合同号</TableHead>
            <TableHead class="p-1 h-auto">项目号</TableHead>
            <TableHead class="p-1 h-auto">轧批号</TableHead>
            <TableHead class="p-1 h-auto">炉号</TableHead>
            <TableHead class="p-1 h-auto">试批号</TableHead>
            <TableHead class="p-1 h-auto">接箍批号</TableHead>
            <TableHead class="p-1 h-auto">接箍炉号</TableHead>
            <TableHead class="p-1 h-auto">投料支数</TableHead>
            <TableHead class="p-1 h-auto">管号</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell class="p-1">{{ realtimeStore.planInfo.order_no }}</TableCell>
            <TableCell class="p-1">{{ realtimeStore.planInfo.item_no }}</TableCell>
            <TableCell class="p-1">{{ realtimeStore.planInfo.roll_no }}</TableCell>
            <TableCell class="p-1">{{ realtimeStore.planInfo.melt_no }}</TableCell>
            <TableCell class="p-1">{{ realtimeStore.planInfo.lot_no }}</TableCell>
            <TableCell class="p-1">{{ realtimeStore.planInfo.lotno_coupling }}</TableCell>
            <TableCell class="p-1">{{ realtimeStore.planInfo.meltno_coupling }}</TableCell>
            <TableCell class="p-1">{{ realtimeStore.planInfo.feed_num }}</TableCell>
            <TableCell class="p-1">{{ realtimeStore.planInfo.tube_no }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <p v-else class="text-gray-500 text-xs">等待数据...</p>
      <!-- 这里可以添加一个按钮来发送命令到后端重置投料之数  -->
      <Button v-if="realtimeStore.planInfo" class="mt-2" @click="sendSetFeedNumCommand">
        重置投料之数
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useWebSocket } from '@/services/websocket';
import { useRealtimeDataStore } from '@/stores/realtimeData';

const result = ref('');
const { isConnected, error, subscribe, sendCommand } = useWebSocket();
const realtimeStore = useRealtimeDataStore();

async function checkHealth() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }
    const data = await res.json();
    result.value = JSON.stringify(data);
  } catch (error) {
    result.value = 'error';
  }
}

async function sendSetFeedNumCommand() {
  // 发送命令
  sendCommand('command1', { feed_num: 100 });
}

// 在组件挂载时订阅tag1, tag2, tag3
onMounted(() => {
  subscribe(['tag1', 'tag2', 'tag3', 'PlanInfo']);
  console.log('[HealthCheckView] 已订阅 tag1, tag2, tag3, PlanInfo');
});

// 在组件卸载时取消所有订阅
onUnmounted(() => {
  subscribe([]);
  console.log('[HealthCheckView] 已取消所有订阅');
});
</script>

<style scoped>
/* 工业界面样式 - 固定布局，无滚动 */
</style>
