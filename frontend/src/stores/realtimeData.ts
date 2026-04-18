/**
 * Pinia Store: 实时数据管理
 * 管理从WebSocket推送的实时数据
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Tag1Data, Tag2Data, Tag3Data, PlanInfo, TubeInfo } from '@gt4_web/shared';

function normalizeBooleanTagValue(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();
    return normalizedValue === 'true' || normalizedValue === '1' || normalizedValue === 'on';
  }

  return Boolean(value);
}

function normalizeRealtimeTagName(tag: string): string {
  return tag.trim();
}

export const useRealtimeDataStore = defineStore('realtimeData', () => {
  // 状态定义
  const tag1 = ref<Tag1Data | null>(null);
  const tag2 = ref<Tag2Data | null>(null);
  const tag3 = ref<Tag3Data | null>(null);
  const planInfo = ref<PlanInfo | null>(null);
  const alignPosTubeInfo = ref<TubeInfo[] | null>(null); // 定位工位管子信息
  const alignPosOn = ref<boolean>(false); // 定位工位有料信号状态
  const lenMeaFinish = ref<boolean>(false); // 测长完成信号状态

  /**
   * 更新指定tag的数据
   * @param tag 标签名称
   * @param value 数据值（已解析的对象或原始类型）
   */
  function updateData(tag: string, value: any): void {
    // const normalizedTag = normalizeRealtimeTagName(tag);

    switch (tag) {
      case 'tag1':
        tag1.value = value as Tag1Data;
        console.log('[RealtimeDataStore] tag1 数据已更新:', tag1.value);
        break;
      case 'tag2':
        tag2.value = value as Tag2Data;
        console.log('[RealtimeDataStore] tag2 数据已更新:', tag2.value);
        break;
      case 'tag3':
        tag3.value = value as Tag3Data;
        console.log('[RealtimeDataStore] tag3 数据已更新:', tag3.value);
        break;
      case 'PlanInfo':
        planInfo.value = value as PlanInfo;
        console.log('[RealtimeDataStore] planInfo 数据已更新:', planInfo.value);
        break;
      case 'ALIGN_POS_TUBE_INFO':
        alignPosTubeInfo.value = value as TubeInfo[];
        console.log('[RealtimeDataStore] alignPosTubeInfo 数据已更新:', alignPosTubeInfo.value);
        break;
      case 'ALIGN_POS_ON':
        alignPosOn.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] alignPosOn 数据已更新:', alignPosOn.value);
        break;
      case 'LEN_MEA_FINISH':
        lenMeaFinish.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] lenMeaFinish 数据已更新:', lenMeaFinish.value);
        break;
      default:
        console.warn(`[RealtimeDataStore] 未知的tag: ${JSON.stringify(tag)}`);
        break;
    }
  }

  /**
   * 重置所有数据为null
   */
  function resetData(): void {
    tag1.value = null;
    tag2.value = null;
    tag3.value = null;
    planInfo.value = null;
    alignPosTubeInfo.value = null;
    alignPosOn.value = false;
    lenMeaFinish.value = false;
    console.log('[RealtimeDataStore] 所有数据已重置');
  }

  return {
    // 测试数据
    tag1,
    tag2,
    tag3,
    // 实际数据
    planInfo,
    alignPosTubeInfo,
    alignPosOn,
    lenMeaFinish,
    // 方法
    updateData,
    resetData,
  };
});
