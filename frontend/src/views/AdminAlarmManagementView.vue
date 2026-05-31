<template>
  <div class="flex h-full w-full flex-col overflow-hidden bg-[#d8d8d8] px-3 pb-3 pt-4">
    <section
      class="relative flex flex-col rounded-[3px] border border-[#868686] bg-[#d3d3d3] px-3 pb-3 pt-[16px] shadow-[inset_0_1px_0_#f7f7f7]"
    >
      <div
        class="absolute -top-[11px] left-3 bg-[#d8d8d8] px-1 text-sm font-bold leading-[1.2] text-[#6f1616]"
      >
        报警管理
      </div>

      <div class="flex items-center justify-between gap-4 border-b border-[#a4a4a4] pb-3">
        <div>
          <h1 class="text-[22px] font-bold tracking-[0.08em] text-[#303030]">Admin Alarm Desk</h1>
          <p class="text-sm text-[#5f5f5f]">
            历史检索、当前页批量确认与普通用户报警区域配置统一工作台
          </p>
        </div>
        <div class="flex items-center gap-3 text-sm text-[#4f4f4f]">
          <span class="rounded border border-[#8c8c8c] bg-[#e4e4e4] px-3 py-1.5">
            当前角色: {{ currentUserName }} / admin
          </span>
          <span class="rounded border border-[#8c8c8c] bg-[#e4e4e4] px-3 py-1.5">
            可见区域: {{ store.visibleAreas.length }}
          </span>
          <span class="rounded border border-[#8c8c8c] bg-[#e4e4e4] px-3 py-1.5">
            未确认: {{ store.summary.total_unacked }}
          </span>
        </div>
      </div>

      <div class="mt-3 flex items-center gap-2">
        <button
          type="button"
          class="rounded border px-4 py-2 text-sm font-semibold transition-colors"
          :class="
            store.mode === 'history'
              ? 'border-[#7e4545] bg-[#8d4e4e] text-white'
              : 'border-[#8f8f8f] bg-[#e4e4e4] text-[#4c4c4c] hover:bg-[#f0f0f0]'
          "
          @click="store.setMode('history')"
        >
          历史管理
        </button>
        <button
          type="button"
          class="rounded border px-4 py-2 text-sm font-semibold transition-colors"
          :class="
            store.mode === 'user-areas'
              ? 'border-[#7e4545] bg-[#8d4e4e] text-white'
              : 'border-[#8f8f8f] bg-[#e4e4e4] text-[#4c4c4c] hover:bg-[#f0f0f0]'
          "
          @click="store.setMode('user-areas')"
        >
          用户区域配置
        </button>
        <div class="ml-auto text-sm text-[#666666]">
          {{ store.mode === 'history' ? '默认模式: 历史管理' : '配置普通用户的授权区域和默认区域' }}
        </div>
      </div>

      <div
        v-if="store.mode === 'history'"
        class="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-hidden"
      >
        <section
          class="rounded-[3px] border border-[#8a8a8a] bg-[#d8d8d8] px-3 pb-3 pt-4 shadow-[inset_0_1px_0_#f4f4f4]"
        >
          <div class="flex flex-wrap items-start gap-3">
            <div class="space-y-1">
              <Label class="text-[#404040]">查询范围</Label>
              <select
                :value="store.listScope"
                class="h-9 rounded border border-[#909090] bg-white px-3 text-sm shadow-none"
                @change="handleScopeChange"
              >
                <option v-for="option in scopeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="space-y-1">
              <Label class="text-[#404040]">关键字</Label>
              <div class="flex items-center gap-2">
                <Input
                  :model-value="store.keyword"
                  class="h-9 w-72 shadow-none"
                  placeholder="按报警码 / 标题 / 文案检索"
                  @update:model-value="handleKeywordChange"
                  @keyup.enter="applyHistoryFilters"
                />
                <Button class="h-9" @click="applyHistoryFilters">刷新</Button>
              </div>
            </div>

            <div class="space-y-1">
              <Label class="text-[#404040]">批量确认备注</Label>
              <div class="flex items-center gap-2">
                <textarea
                  v-model="store.batchAckNote"
                  class="h-9 w-[360px] resize-none rounded border border-[#909090] bg-white px-3 py-2 text-sm text-[#333333] outline-none focus:border-[#8d4e4e]"
                  placeholder="为当前页可确认项写入统一备注"
                ></textarea>
                <Button
                  class="h-9 min-w-[168px]"
                  :disabled="!store.hasBatchAckTargets || store.isSubmittingBatchAck"
                  @click="handleBatchAck"
                >
                  {{
                    store.isSubmittingBatchAck
                      ? '批量确认中...'
                      : `确认当前页未确认项 (${store.currentBatchAckItems.length})`
                  }}
                </Button>
              </div>
            </div>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-semibold text-[#414141]">区域筛选</span>
              <button
                type="button"
                class="rounded border px-2.5 py-1 text-xs font-semibold transition-colors"
                :class="
                  store.selectedAreaIds.length === 0
                    ? 'border-[#8d4e4e] bg-[#8d4e4e] text-white'
                    : 'border-[#9b9b9b] bg-[#ededed] text-[#4a4a4a] hover:bg-white'
                "
                @click="clearAreaFilters"
              >
                全部区域
              </button>
              <button
                v-for="area in store.visibleAreas"
                :key="area.id"
                type="button"
                class="rounded border px-2.5 py-1 text-xs font-semibold transition-colors"
                :class="
                  store.selectedAreaIds.includes(area.id)
                    ? 'border-[#8d4e4e] bg-[#8d4e4e] text-white'
                    : 'border-[#9b9b9b] bg-[#ededed] text-[#4a4a4a] hover:bg-white'
                "
                @click="toggleAreaFilter(area.id)"
              >
                {{ area.area_name }}
              </button>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-semibold text-[#414141]">等级筛选</span>
              <button
                v-for="severity in severityOptions"
                :key="severity"
                type="button"
                class="rounded border px-2.5 py-1 text-xs font-semibold uppercase transition-colors"
                :class="severityButtonClass(severity)"
                @click="toggleSeverity(severity)"
              >
                {{ severity }}
              </button>
            </div>
          </div>

          <div class="mt-3 grid grid-cols-3 gap-3">
            <article
              class="rounded border border-[#8c8c8c] bg-[#efefef] px-4 py-3 shadow-[inset_0_1px_0_#ffffff]"
            >
              <div class="text-xs uppercase tracking-[0.12em] text-[#7a5858]">Active</div>
              <div class="mt-2 text-[28px] font-bold text-[#2f2f2f]">
                {{ store.summary.total_active }}
              </div>
              <div class="mt-1 text-sm text-[#626262]">当前筛选区域下的活动报警总数</div>
            </article>
            <article
              class="rounded border border-[#8c8c8c] bg-[#efefef] px-4 py-3 shadow-[inset_0_1px_0_#ffffff]"
            >
              <div class="text-xs uppercase tracking-[0.12em] text-[#7a5858]">Unacked</div>
              <div class="mt-2 text-[28px] font-bold text-[#7a1717]">
                {{ store.summary.total_unacked }}
              </div>
              <div class="mt-1 text-sm text-[#626262]">需要人工确认的未确认报警</div>
            </article>
            <article
              class="rounded border border-[#8c8c8c] bg-[#efefef] px-4 py-3 shadow-[inset_0_1px_0_#ffffff]"
            >
              <div class="text-xs uppercase tracking-[0.12em] text-[#7a5858]">Highest</div>
              <div class="mt-2 text-[28px] font-bold text-[#2f2f2f]">
                {{ store.summary.highest_severity ?? 'none' }}
              </div>
              <div class="mt-1 text-sm text-[#626262]">
                {{ batchAckSummaryText || '提交批量确认后会在这里显示本次处理摘要' }}
              </div>
            </article>
          </div>
        </section>

        <section class="grid min-h-0 flex-1 grid-cols-[1.18fr_0.82fr] gap-3 overflow-hidden">
          <div
            class="flex min-h-0 flex-col rounded-[3px] border border-[#8a8a8a] bg-[#d8d8d8] px-3 pb-3 pt-4 shadow-[inset_0_1px_0_#f4f4f4]"
          >
            <div class="mb-3 flex items-center justify-between">
              <div>
                <div class="text-lg font-bold text-[#313131]">报警列表</div>
                <div class="text-sm text-[#666666]">
                  当前页 {{ store.page }}/{{ store.totalPages }}，共 {{ store.total }} 条
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Button
                  variant="outline"
                  class="h-9"
                  :disabled="store.page <= 1"
                  @click="goPrevPage"
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  class="h-9"
                  :disabled="store.page >= store.totalPages"
                  @click="goNextPage"
                >
                  下一页
                </Button>
              </div>
            </div>

            <div class="min-h-0 flex-1 overflow-auto rounded border border-[#8a8a8a] bg-[#efefef]">
              <table class="min-w-full border-collapse text-sm text-[#343434]">
                <thead
                  class="sticky top-0 bg-[#d0d0d0] text-left text-xs uppercase tracking-[0.08em] text-[#555555]"
                >
                  <tr>
                    <th class="border-b border-[#a2a2a2] px-3 py-2">等级</th>
                    <th class="border-b border-[#a2a2a2] px-3 py-2">区域</th>
                    <th class="border-b border-[#a2a2a2] px-3 py-2">标题</th>
                    <th class="border-b border-[#a2a2a2] px-3 py-2">状态</th>
                    <th class="border-b border-[#a2a2a2] px-3 py-2">最近发生</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="store.listItems.length === 0">
                    <td colspan="5" class="h-24 px-3 text-center text-sm text-[#666666]">
                      当前筛选条件下没有报警记录
                    </td>
                  </tr>
                  <tr
                    v-for="item in store.listItems"
                    :key="item.id"
                    class="cursor-pointer border-b border-[#d1d1d1] transition-colors hover:bg-[#f7f7f7]"
                    :class="historyRowClass(item)"
                    @click="handleSelectAlarm(item.id)"
                  >
                    <td class="px-3 py-2 font-semibold uppercase">{{ item.severity }}</td>
                    <td class="px-3 py-2">{{ item.area_name }}</td>
                    <td class="px-3 py-2">
                      <div class="font-semibold text-[#2f2f2f]">{{ item.title }}</div>
                      <div class="text-xs text-[#666666]">
                        {{ item.alarm_code }} / {{ item.source_module }}
                      </div>
                    </td>
                    <td class="px-3 py-2">
                      <div>{{ item.condition_state }} / {{ item.ack_state }}</div>
                      <div class="text-xs text-[#666666]">版本 {{ item.version }}</div>
                    </td>
                    <td class="px-3 py-2 text-xs text-[#535353]">
                      {{ formatDate(item.last_occurred_at) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            class="flex min-h-0 flex-col rounded-[3px] border border-[#8a8a8a] bg-[#d8d8d8] px-3 pb-3 pt-4 shadow-[inset_0_1px_0_#f4f4f4]"
          >
            <div class="mb-3">
              <div class="text-lg font-bold text-[#313131]">报警详情</div>
              <div class="text-sm text-[#666666]">历史页保持拉取式刷新，不接入报警增量 Socket</div>
            </div>

            <div v-if="selectedAlarm" class="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
              <div class="rounded border border-[#8a8a8a] bg-[#efefef] px-4 py-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="text-xl font-bold text-[#2f2f2f]">{{ selectedAlarm.title }}</div>
                    <div class="mt-1 text-sm text-[#555555]">{{ selectedAlarm.message }}</div>
                  </div>
                  <div
                    class="rounded border border-[#9b9b9b] bg-white px-3 py-1 text-xs font-semibold uppercase text-[#5a5a5a]"
                  >
                    {{ selectedAlarm.severity }}
                  </div>
                </div>
                <div class="mt-3 grid grid-cols-2 gap-3 text-sm text-[#4f4f4f]">
                  <div>区域: {{ selectedAlarm.area_name }}</div>
                  <div>
                    状态: {{ selectedAlarm.condition_state }} / {{ selectedAlarm.ack_state }}
                  </div>
                  <div>确认人: {{ selectedAlarm.acked_by_name ?? '未确认' }}</div>
                  <div>确认时间: {{ formatDate(selectedAlarm.acked_at) }}</div>
                  <div>首次发生: {{ formatDate(selectedAlarm.first_occurred_at) }}</div>
                  <div>最近发生: {{ formatDate(selectedAlarm.last_occurred_at) }}</div>
                </div>
              </div>

              <div class="grid min-h-0 flex-1 grid-rows-[0.9fr_1.1fr] gap-3 overflow-hidden">
                <div
                  class="min-h-0 overflow-auto rounded border border-[#8a8a8a] bg-[#efefef] px-4 py-3"
                >
                  <div class="mb-2 text-sm font-semibold text-[#404040]">详情快照</div>
                  <pre class="whitespace-pre-wrap break-all text-xs leading-5 text-[#333333]">{{
                    formattedDetailJson
                  }}</pre>
                </div>

                <div
                  class="min-h-0 overflow-auto rounded border border-[#8a8a8a] bg-[#efefef] px-3 py-3"
                >
                  <div class="mb-2 text-sm font-semibold text-[#404040]">操作日志</div>
                  <div
                    v-if="selectedLogs.length === 0"
                    class="py-6 text-center text-sm text-[#666666]"
                  >
                    当前报警暂无日志
                  </div>
                  <article
                    v-for="log in selectedLogs"
                    :key="log.id"
                    class="mb-2 rounded border border-[#b7b7b7] bg-white px-3 py-2 text-sm text-[#404040] last:mb-0"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <span class="font-semibold uppercase">{{ log.action }}</span>
                      <span class="text-xs text-[#6b6b6b]">{{ formatDate(log.created_at) }}</span>
                    </div>
                    <div class="mt-1 text-xs text-[#666666]">
                      {{ log.operator_name ?? 'system' }} / {{ log.operator_type }}
                    </div>
                    <pre
                      class="mt-2 whitespace-pre-wrap break-all text-xs leading-5 text-[#333333]"
                      >{{ formatJson(log.payload_json) }}</pre
                    >
                  </article>
                </div>
              </div>
            </div>

            <div
              v-else
              class="flex flex-1 items-center justify-center rounded border border-dashed border-[#9f9f9f] bg-[#efefef] text-sm text-[#666666]"
            >
              请选择一条报警查看详情
            </div>
          </div>
        </section>
      </div>

      <div v-else class="mt-3 grid min-h-0 flex-1 grid-cols-[0.34fr_0.66fr] gap-3 overflow-hidden">
        <section
          class="flex min-h-0 flex-col rounded-[3px] border border-[#8a8a8a] bg-[#d8d8d8] px-3 pb-3 pt-4 shadow-[inset_0_1px_0_#f4f4f4]"
        >
          <div class="mb-3 flex items-center justify-between">
            <div>
              <div class="text-lg font-bold text-[#313131]">普通用户目录</div>
              <div class="text-sm text-[#666666]">仅列出 role = user 的账号</div>
            </div>
            <Button variant="outline" class="h-9" @click="refreshUserDirectory">刷新目录</Button>
          </div>

          <div
            class="min-h-0 flex-1 overflow-auto rounded border border-[#8a8a8a] bg-[#efefef] p-2"
          >
            <button
              v-for="user in store.directoryUsers"
              :key="user.id"
              type="button"
              class="mb-2 flex w-full items-start justify-between rounded border px-3 py-3 text-left transition-colors last:mb-0"
              :class="
                store.selectedManagedUserId === user.id
                  ? 'border-[#8d4e4e] bg-[#f5eaea]'
                  : 'border-[#b7b7b7] bg-white hover:bg-[#f7f7f7]'
              "
              @click="handleSelectManagedUser(user.id)"
            >
              <div>
                <div class="font-semibold text-[#303030]">{{ user.username }}</div>
                <div class="text-xs text-[#666666]">{{ user.email }}</div>
              </div>
              <span
                class="rounded border border-[#9c9c9c] bg-[#ececec] px-2 py-1 text-xs uppercase text-[#555555]"
              >
                {{ user.role }}
              </span>
            </button>

            <div
              v-if="store.directoryUsers.length === 0"
              class="py-12 text-center text-sm text-[#666666]"
            >
              当前没有可配置的普通用户
            </div>
          </div>
        </section>

        <section
          class="flex min-h-0 flex-col rounded-[3px] border border-[#8a8a8a] bg-[#d8d8d8] px-3 pb-3 pt-4 shadow-[inset_0_1px_0_#f4f4f4]"
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <div>
              <div class="text-lg font-bold text-[#313131]">授权区域配置</div>
              <div class="text-sm text-[#666666]">
                {{
                  store.selectedManagedUser
                    ? `正在编辑 ${store.selectedManagedUser.username} 的报警区域授权`
                    : '先从左侧目录选择一个普通用户'
                }}
              </div>
            </div>
            <Button
              class="h-9 min-w-[140px]"
              :disabled="!store.canSaveManagedAreas"
              @click="handleSaveManagedAreas"
            >
              {{ store.isSavingManagedAreas ? '保存中...' : '保存区域配置' }}
            </Button>
          </div>

          <div
            v-if="store.selectedManagedUser"
            class="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-3 overflow-hidden"
          >
            <div class="grid grid-cols-[1fr_260px] gap-3">
              <div class="rounded border border-[#8a8a8a] bg-[#efefef] px-4 py-3">
                <div class="text-sm font-semibold text-[#404040]">当前上下文</div>
                <div class="mt-2 grid grid-cols-2 gap-3 text-sm text-[#4f4f4f]">
                  <div>目标用户: {{ store.selectedManagedUser.username }}</div>
                  <div>默认区域: {{ currentManagedDefaultAreaName }}</div>
                  <div>授权区域数: {{ store.draftAreaIds.length }}</div>
                  <div>变更状态: {{ store.hasManagedAreaChanges ? '未保存' : '已同步' }}</div>
                </div>
              </div>

              <div class="rounded border border-[#8a8a8a] bg-[#efefef] px-4 py-3">
                <Label class="text-[#404040]">默认区域</Label>
                <select
                  :value="store.draftDefaultAreaId ?? ''"
                  class="mt-2 h-10 w-full rounded border border-[#909090] bg-white px-3 text-sm"
                  :disabled="store.draftAreaIds.length === 0"
                  @change="handleDefaultAreaChange"
                >
                  <option value="">请选择默认区域</option>
                  <option v-for="area in selectedManagedAreas" :key="area.id" :value="area.id">
                    {{ area.area_name }}
                  </option>
                </select>
              </div>
            </div>

            <div
              class="min-h-0 overflow-auto rounded border border-[#8a8a8a] bg-[#efefef] px-4 py-4"
            >
              <div class="mb-3 text-sm font-semibold text-[#404040]">可授权区域</div>
              <div class="grid grid-cols-3 gap-3">
                <label
                  v-for="area in store.visibleAreas"
                  :key="area.id"
                  class="flex cursor-pointer items-start gap-3 rounded border border-[#b7b7b7] bg-white px-3 py-3 transition-colors hover:bg-[#f7f7f7]"
                  :class="
                    store.draftAreaIds.includes(area.id) ? 'border-[#8d4e4e] bg-[#f7eded]' : ''
                  "
                >
                  <input
                    type="checkbox"
                    class="mt-1 h-4 w-4 accent-[#8d4e4e]"
                    :checked="store.draftAreaIds.includes(area.id)"
                    @change="toggleManagedArea(area.id)"
                  />
                  <div>
                    <div class="font-semibold text-[#303030]">{{ area.area_name }}</div>
                    <div class="text-xs text-[#666666]">
                      {{ area.area_code }} / sort {{ area.sort_order }}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div
            v-else
            class="flex flex-1 items-center justify-center rounded border border-dashed border-[#9f9f9f] bg-[#efefef] text-sm text-[#666666]"
          >
            从左侧目录选择普通用户后即可读取并编辑其区域授权
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { AlarmListItem, AlarmListScope, AlarmSeverity } from '@gt4_web/shared';
import { toast } from 'vue-sonner';
import { getCurrentUser } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminAlarmManagementStore } from '@/stores/adminAlarmManagement';

const store = useAdminAlarmManagementStore();
const currentUserName = computed(() => getCurrentUser()?.username ?? 'admin');
const selectedAlarm = computed(() => store.selectedAlarmDetail?.alarm ?? null);
const selectedLogs = computed(() => store.selectedAlarmDetail?.logs ?? []);
const formattedDetailJson = computed(() => formatJson(selectedAlarm.value?.detail_json ?? {}));
const selectedManagedAreas = computed(() =>
  store.visibleAreas.filter((area) => store.draftAreaIds.includes(area.id)),
);
const currentManagedDefaultAreaName = computed(() => {
  const defaultArea = selectedManagedAreas.value.find(
    (area) => area.id === store.draftDefaultAreaId,
  );
  return defaultArea?.area_name ?? '未设置';
});
const batchAckSummaryText = computed(() => {
  if (!store.lastBatchAckResult) {
    return '';
  }

  const counts = store.lastBatchAckResult.results.reduce(
    (result, item) => {
      result[item.status] += 1;
      return result;
    },
    {
      acked: 0,
      already_acked: 0,
      conflict: 0,
      not_found: 0,
    } as Record<'acked' | 'already_acked' | 'conflict' | 'not_found', number>,
  );

  return `本次提交: 成功 ${counts.acked}，已确认 ${counts.already_acked}，冲突 ${counts.conflict}，不可见/不存在 ${counts.not_found}`;
});

const severityOptions: AlarmSeverity[] = ['critical', 'major', 'minor', 'warning', 'info'];
const scopeOptions: Array<{ label: string; value: AlarmListScope }> = [
  { label: '全部记录', value: 'all' },
  { label: '仅活动报警', value: 'active' },
  { label: '仅历史报警', value: 'history' },
];

onMounted(async () => {
  try {
    await store.initialize();
  } catch (error) {
    toast.error(extractErrorMessage(error, '初始化报警管理页失败'));
  }
});

function formatDate(value: string | null | undefined) {
  if (!value) {
    return '---';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('zh-CN', {
    hour12: false,
  });
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function extractErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function severityButtonClass(severity: AlarmSeverity) {
  return store.severityFilters.includes(severity)
    ? 'border-[#8d4e4e] bg-[#8d4e4e] text-white'
    : 'border-[#9b9b9b] bg-[#ededed] text-[#4a4a4a] hover:bg-white';
}

function historyRowClass(item: AlarmListItem) {
  return [
    store.selectedAlarmId === item.id ? 'bg-[#f4e3e3]' : '',
    item.ack_state === 'unacked' ? 'text-[#691919]' : '',
  ];
}

async function applyHistoryFilters() {
  try {
    await store.refreshHistory();
  } catch (error) {
    toast.error(extractErrorMessage(error, '刷新报警列表失败'));
  }
}

async function handleScopeChange(event: Event) {
  const nextValue = (event.target as HTMLSelectElement).value as AlarmListScope;
  store.setScope(nextValue);
  await applyHistoryFilters();
}

function handleKeywordChange(value: string | number) {
  store.setKeyword(String(value));
}

async function toggleSeverity(severity: AlarmSeverity) {
  store.toggleSeverityFilter(severity);
  await applyHistoryFilters();
}

async function toggleAreaFilter(areaId: number) {
  store.toggleAreaFilter(areaId);
  await applyHistoryFilters();
}

async function clearAreaFilters() {
  store.clearAreaFilters();
  await applyHistoryFilters();
}

async function handleSelectAlarm(alarmId: number) {
  try {
    await store.selectAlarm(alarmId);
  } catch (error) {
    toast.error(extractErrorMessage(error, '加载报警详情失败'));
  }
}

async function goPrevPage() {
  store.setPage(store.page - 1);
  await applyHistoryFilters();
}

async function goNextPage() {
  store.setPage(store.page + 1);
  await applyHistoryFilters();
}

async function handleBatchAck() {
  if (!store.hasBatchAckTargets) {
    toast.message('当前页无可确认报警');
    return;
  }

  try {
    const response = await store.submitBatchAck();
    if (!response) {
      return;
    }

    toast.success(`批量确认完成，成功 ${response.acked_count} / ${response.requested_count}`);
  } catch (error) {
    toast.error(extractErrorMessage(error, '批量确认失败'));
  }
}

async function refreshUserDirectory() {
  try {
    await store.initialize(true);
  } catch (error) {
    toast.error(extractErrorMessage(error, '刷新用户目录失败'));
  }
}

async function handleSelectManagedUser(userId: number) {
  try {
    await store.selectManagedUser(userId);
  } catch (error) {
    toast.error(extractErrorMessage(error, '读取目标用户报警区域失败'));
  }
}

function toggleManagedArea(areaId: number) {
  store.toggleManagedArea(areaId);
}

function handleDefaultAreaChange(event: Event) {
  const nextValue = Number.parseInt((event.target as HTMLSelectElement).value, 10);
  if (Number.isNaN(nextValue) || nextValue <= 0) {
    return;
  }

  store.setManagedDefaultArea(nextValue);
}

async function handleSaveManagedAreas() {
  try {
    await store.saveManagedAreas();
    toast.success('用户报警区域配置已保存');
  } catch (error) {
    toast.error(extractErrorMessage(error, '保存用户报警区域失败'));
  }
}
</script>
