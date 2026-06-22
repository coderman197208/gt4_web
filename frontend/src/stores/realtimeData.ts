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
  const basketPosTubeInfo = ref<TubeInfo[] | null>(null); // 打包区管子信息
  const scrapPosTubeInfo = ref<TubeInfo[] | null>(null); // 废品区管子信息
  const alignPosOn = ref<boolean>(false); // 定位工位有料信号状态
  const weightPosOn = ref<boolean>(false); // 称重工位有料信号状态
  const carvePosOn = ref<boolean>(false); // 刻印工位有料信号状态
  const sprayPosOn = ref<boolean>(false); // 喷涂工位有料信号状态
  const circlePosOn = ref<boolean>(false); // 色环工位有料信号状态
  const scraptrollerPosOn = ref<boolean>(false); // 出废工位有料信号状态
  const lenMeaFinish = ref<boolean>(false); // 测长完成信号状态
  const alignPosRdy = ref<boolean>(false); // 测长工位备妥
  const weightPosRdy = ref<boolean>(false); // 称重工位备妥
  const carvePosRdy = ref<boolean>(false); // 压印工位备妥
  const sprayPosRdy = ref<boolean>(false); // 喷涂工位备妥
  const circlePosRdy = ref<boolean>(false); // 色环工位备妥
  const scraptrollerPosRdy = ref<boolean>(false); // 出料工位备妥
  const wbRelease = ref<boolean>(false); // 步进梁释放信号
  const nbwbRelease = ref<boolean>(false); // 内保步进梁释放信号
  const wbBase = ref<boolean>(false); // 步进梁原位信号
  const l2WbRelease = ref<boolean>(false); // L2步进梁释放信号
  const weightRelease = ref<boolean>(false); // 称重工位释放信号
  const sprayRelease = ref<boolean>(false); // 喷涂工位释放信号
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
      case 'BASKET_POS_TUBE_INFO':
        basketPosTubeInfo.value = value as TubeInfo[];
        console.log('[RealtimeDataStore] basketPosTubeInfo 数据已更新:', basketPosTubeInfo.value);
        break;
      case 'SCRAPT_POS_TUBE_INFO':
        scrapPosTubeInfo.value = value as TubeInfo[];
        console.log('[RealtimeDataStore] scrapPosTubeInfo 数据已更新:', scrapPosTubeInfo.value);
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
      case 'ALIGN_POS_RDY':
        alignPosRdy.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] alignPosRdy 数据已更新:', alignPosRdy.value);
        break;
      case 'WEIGHT_POS_RDY':
        weightPosRdy.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] weightPosRdy 数据已更新:', weightPosRdy.value);
        break;
      case 'CARVE_POS_RDY':
        carvePosRdy.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] carvePosRdy 数据已更新:', carvePosRdy.value);
        break;
      case 'SPRAY_POS_RDY':
        sprayPosRdy.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] sprayPosRdy 数据已更新:', sprayPosRdy.value);
        break;
      case 'CIRCLE_POS_RDY':
        circlePosRdy.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] circlePosRdy 数据已更新:', circlePosRdy.value);
        break;
      case 'SCRAPT_ROLLER_POS_RDY':
        scraptrollerPosRdy.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] scraptrollerPosRdy 数据已更新:', scraptrollerPosRdy.value);
        break;
      case 'WB_RELEASE':
        wbRelease.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] wbRelease 数据已更新:', wbRelease.value);
        break;
      case 'NBWB_RELEASE':
        nbwbRelease.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] nbwbRelease 数据已更新:', nbwbRelease.value);
        break;
      case 'WB_BASE':
        wbBase.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] wbBase 数据已更新:', wbBase.value);
        break;
      case 'L2_WB_RELEASE':
        l2WbRelease.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] l2WbRelease 数据已更新:', l2WbRelease.value);
        break;
      case 'WEIGHT_RELEASE':
        weightRelease.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] weightRelease 数据已更新:', weightRelease.value);
        break;
      case 'SPRAY_RELEASE':
        sprayRelease.value = normalizeBooleanTagValue(value);
        console.log('[RealtimeDataStore] sprayRelease 数据已更新:', sprayRelease.value);
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
    basketPosTubeInfo.value = null;
    scrapPosTubeInfo.value = null;
    alignPosOn.value = false;
    weightPosOn.value = false;
    carvePosOn.value = false;
    sprayPosOn.value = false;
    circlePosOn.value = false;
    scraptrollerPosOn.value = false;
    lenMeaFinish.value = false;
    alignPosRdy.value = false;
    weightPosRdy.value = false;
    carvePosRdy.value = false;
    sprayPosRdy.value = false;
    circlePosRdy.value = false;
    scraptrollerPosRdy.value = false;
    wbRelease.value = false;
    nbwbRelease.value = false;
    wbBase.value = false;
    l2WbRelease.value = false;
    weightRelease.value = false;
    sprayRelease.value = false;
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
    basketPosTubeInfo,
    scrapPosTubeInfo,
    alignPosOn,
    weightPosOn,
    carvePosOn,
    sprayPosOn,
    circlePosOn,
    scraptrollerPosOn,
    lenMeaFinish,
    alignPosRdy,
    weightPosRdy,
    carvePosRdy,
    sprayPosRdy,
    circlePosRdy,
    scraptrollerPosRdy,
    wbRelease,
    nbwbRelease,
    wbBase,
    l2WbRelease,
    weightRelease,
    sprayRelease,
    // 方法
    updateData,
    resetData,
  };
});
