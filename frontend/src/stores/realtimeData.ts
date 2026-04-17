/**
 * Pinia Store: 实时数据管理
 * 管理从WebSocket推送的tag1、tag2、tag3数据
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Tag1Data, Tag2Data, Tag3Data, PlanInfo } from '@gt4_web/shared';

export const useRealtimeDataStore = defineStore('realtimeData', () => {
  // 状态定义
  const tag1 = ref<Tag1Data | null>(null);
  const tag2 = ref<Tag2Data | null>(null);
  const tag3 = ref<Tag3Data | null>(null);
  const planInfo = ref<PlanInfo | null>(null);
  const alignPosTubeInfo = ref<PlanInfo[] | null>(null); // 定位工位管子信息，假设结构与 PlanInfo 相同

  /**
   * 更新指定tag的数据
   * @param tag 标签名称
   * @param value 数据值（已解析的对象或原始类型）
   */
  function updateData(tag: string, value: any): void {
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
        // 这里假设 ALIGN_POS_TUBE_INFO 的数据结构与 PlanInfo 相同，如果不同需要定义新的类型并进行类型断言
        alignPosTubeInfo.value = value as PlanInfo[];
        console.log('[RealtimeDataStore] alignPosTubeInfo 数据已更新:', alignPosTubeInfo.value);
        break;
      default:
        console.warn(`[RealtimeDataStore] 未知的tag: ${tag}`);
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
    console.log('[RealtimeDataStore] 所有数据已重置');
  }

  return {
    // 状态
    tag1,
    tag2,
    tag3,
    planInfo,
    alignPosTubeInfo,
    // 方法
    updateData,
    resetData,
  };
});
