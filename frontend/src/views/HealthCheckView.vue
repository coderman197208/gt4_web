<template>
  <div class="health-check">
    <!-- 原有的健康检查按钮 -->
    <div class="mb-6">
      <Button @click="checkHealth">Check Backend Health</Button>
      <p v-if="result" class="health-check__result">Backend: {{ result }}</p>
    </div>

    <!-- WebSocket连接状态 -->
    <div class="mb-6">
      <div class="flex items-center gap-2">
        <span class="font-semibold">WebSocket状态:</span>
        <span :class="isConnected ? 'text-green-600' : 'text-red-600'">
          {{ isConnected ? '已连接' : '未连接' }}
        </span>
      </div>
      <p v-if="error" class="text-red-600 text-sm mt-1">{{ error }}</p>
    </div>

    <!-- Tag1 数据展示（表格，一行6列） -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">Tag1 数据</h3>
      <Table v-if="realtimeStore.tag1">
        <TableHeader>
          <TableRow>
            <TableHead>批号 (ph)</TableHead>
            <TableHead>炉号 (lh)</TableHead>
            <TableHead>车组号 (czh)</TableHead>
            <TableHead>拖链序号 (tlxh)</TableHead>
            <TableHead>轧制温度 (zzwj)</TableHead>
            <TableHead>轧制编号 (zzbh)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>{{ realtimeStore.tag1.ph }}</TableCell>
            <TableCell>{{ realtimeStore.tag1.lh }}</TableCell>
            <TableCell>{{ realtimeStore.tag1.czh }}</TableCell>
            <TableCell>{{ realtimeStore.tag1.tlxh }}</TableCell>
            <TableCell>{{ realtimeStore.tag1.zzwj }}</TableCell>
            <TableCell>{{ realtimeStore.tag1.zzbh }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <p v-else class="text-gray-500">等待数据...</p>
    </div>

    <!-- Tag2 数据展示（单个数字，只读输入框） -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">Tag2 数据</h3>
      <Input 
        v-if="realtimeStore.tag2 !== null" 
        :model-value="String(realtimeStore.tag2)" 
        readonly 
        class="max-w-xs"
      />
      <p v-else class="text-gray-500">等待数据...</p>
    </div>

    <!-- Tag3 数据展示（6行1列表格） -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">Tag3 数据</h3>
      <Table v-if="realtimeStore.tag3" class="max-w-xs">
        <TableHeader>
          <TableRow>
            <TableHead>值</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="(value, index) in realtimeStore.tag3" :key="index">
            <TableCell>{{ value }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <p v-else class="text-gray-500">等待数据...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useWebSocket } from '@/services/websocket';
import { useRealtimeDataStore } from '@/stores/realtimeData';

const result = ref('');
const { isConnected, error, subscribe } = useWebSocket();
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

// 在组件挂载时订阅tag1, tag2, tag3
onMounted(() => {
  subscribe(['tag1', 'tag2', 'tag3']);
  console.log('[HealthCheckView] 已订阅 tag1, tag2, tag3');
});
</script>

<style scoped>
.health-check {
  margin-top: 12px;
}

.health-check__result {
  margin-top: 8px;
}
</style>
