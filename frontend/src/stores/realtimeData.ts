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
  const weightPosTubeInfo = ref<TubeInfo[] | null>(null); // 称重工位管子信息
  const carvePosTubeInfo = ref<TubeInfo[] | null>(null); // 刻印工位管子信息
  const sprayPosTubeInfo = ref<TubeInfo[] | null>(null); // 喷涂工位管子信息
  const circlePosTubeInfo = ref<TubeInfo[] | null>(null); // 色环工位管子信息
  const scraptrollerPosTubeInfo = ref<TubeInfo[] | null>(null); // 出废工位管子信息
  const backbufferPosTubeInfo = ref<TubeInfo[] | null>(null); // 打包前缓冲区管子信息
  const alignPosOn = ref<boolean>(false); // 定位工位有料信号状态
  const weightPosOn = ref<boolean>(false); // 称重工位有料信号状态
  const carvePosOn = ref<boolean>(false); // 刻印工位有料信号状态
  const sprayPosOn = ref<boolean>(false); // 喷涂工位有料信号状态
  const circlePosOn = ref<boolean>(false); // 色环工位有料信号状态
  const scraptrollerPosOn = ref<boolean>(false); // 出废工位有料信号状态
  const lenMeaFinish = ref<boolean>(false); // 测长完成信号状态

  /**
   * 更新指定tag的数据
   * @param tag 标签名称
   * @param value 数据值（已解析的对象或原始类型）
   */
  function updateData(tag: string, value: any): void {
    const normalizedTag = normalizeRealtimeTagName(tag);

    switch (normalizedTag) {
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
      case 'WEIGHT_POS_TUBE_INFO':
        weightPosTubeInfo.value = value as TubeInfo[];
        console.log('[RealtimeDataStore] weightPosTubeInfo 数据已更新:', weightPosTubeInfo.value);
        break;
      case 'CARVE_POS_TUBE_INFO':
        carvePosTubeInfo.value = value as TubeInfo[];
        console.log('[RealtimeDataStore] carvePosTubeInfo 数据已更新:', carvePosTubeInfo.value);
        break;
      case 'SPRAY_POS_TUBE_INFO':
        sprayPosTubeInfo.value = value as TubeInfo[];
        console.log('[RealtimeDataStore] sprayPosTubeInfo 数据已更新:', sprayPosTubeInfo.value);
        break;
      case 'CIRCLE_POS_TUBE_INFO':
        circlePosTubeInfo.value = value as TubeInfo[];
        console.log('[RealtimeDataStore] circlePosTubeInfo 数据已更新:', circlePosTubeInfo.value);
        break;
      case 'SCRAPTROLLER_POS_TUBE_INFO':
        scraptrollerPosTubeInfo.value = value as TubeInfo[];
        console.log(
          '[RealtimeDataStore] scraptrollerPosTubeInfo 数据已更新:',
          scraptrollerPosTubeInfo.value,
        );
        break;
      case 'BACKBUFFER_POS_TUBE_INFO':
        backbufferPosTubeInfo.value = value as TubeInfo[];
        console.log(
          '[RealtimeDataStore] backbufferPosTubeInfo 数据已更新:',
          backbufferPosTubeInfo.value,
        );
        break;
      case 'ALIGN_POS_ON':
        alignPosOn.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] alignPosOn 数据已更新:', alignPosOn.value);
        break;
      case 'WEIGHT_POS_ON':
        weightPosOn.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] weightPosOn 数据已更新:', weightPosOn.value);
        break;
      case 'CARVE_POS_ON':
        carvePosOn.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] carvePosOn 数据已更新:', carvePosOn.value);
        break;
      case 'SPRAY_POS_ON':
        sprayPosOn.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] sprayPosOn 数据已更新:', sprayPosOn.value);
        break;
      case 'CIRCLE_POS_ON':
        circlePosOn.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] circlePosOn 数据已更新:', circlePosOn.value);
        break;
      case 'SCRAPTROLLER_POS_ON':
        scraptrollerPosOn.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] scraptrollerPosOn 数据已更新:', scraptrollerPosOn.value);
        break;
      case 'LEN_MEA_FINISH':
        lenMeaFinish.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] lenMeaFinish 数据已更新:', lenMeaFinish.value);
        break;
      default:
        console.warn('[RealtimeDataStore] 未知的tag:', {
          rawTag: tag,
          normalizedTag,
        });
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
    weightPosTubeInfo.value = null;
    carvePosTubeInfo.value = null;
    sprayPosTubeInfo.value = null;
    circlePosTubeInfo.value = null;
    scraptrollerPosTubeInfo.value = null;
    backbufferPosTubeInfo.value = null;
    alignPosOn.value = false;
    weightPosOn.value = false;
    carvePosOn.value = false;
    sprayPosOn.value = false;
    circlePosOn.value = false;
    scraptrollerPosOn.value = false;
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
    weightPosTubeInfo,
    carvePosTubeInfo,
    sprayPosTubeInfo,
    circlePosTubeInfo,
    scraptrollerPosTubeInfo,
    backbufferPosTubeInfo,
    alignPosOn,
    weightPosOn,
    carvePosOn,
    sprayPosOn,
    circlePosOn,
    scraptrollerPosOn,
    lenMeaFinish,
    // 方法
    updateData,
    resetData,
  };
});
