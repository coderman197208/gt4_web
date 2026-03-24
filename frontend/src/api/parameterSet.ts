import { request } from './client';
import type { ParameterSet } from '@gt4_web/shared';

// 表单中的允许/禁止、公制/英制、固定/自由等字段的映射
const ENABLE_MAP: Record<string, number> = { allow: 1, deny: 0 };
const FORMAT_MAP: Record<string, number> = { metric: 0, imperial: 1 };
const LABEL_TYPE_MAP: Record<string, number> = { fixed: 0, free: 1 };

const ENABLE_MAP_REV: Record<number, string> = { 1: 'allow', 0: 'deny' };
const FORMAT_MAP_REV: Record<number, string> = { 0: 'metric', 1: 'imperial' };
const LABEL_TYPE_MAP_REV: Record<number, string> = { 0: 'fixed', 1: 'free' };

// 前端表单数据类型
export interface ParameterSetForm {
  order_no: string;
  item_no: string;
  diameter: string;
  wall_thickness: string;
  direction_code: string;
  bundle_type: string;
  bundle_number: string;
  produce_job_point: string;
  order_weight: string;
  lot_no: string;
  roll_no: string;
  melt_no: string;
  melt_no_coupling: string;
  lot_no_coupling: string;
  flow_no: string;
  feed_number: string;
  length_coupling: string;
  weight_coupling: string;
  weight_packaging: string;
  length_enable: string;
  weight_enable: string;
  circle_enable: string;
  carve_enable: string;
  spray_enable: string;
  waste_length_enable: string;
  waste_weight_enable: string;
  gun1: boolean;
  gun2: boolean;
  gun3: boolean;
  gun4: boolean;
  gun5: boolean;
  gun_clear: string;
  circle_time: string;
  spray_length_type: string;
  spray_weight_type: string;
  spray_length_precision: string;
  spray_weight_precision: string;
  weight_limit_max: string;
  weight_limit_min: string;
  bundle_first_type: string;
  bundle_flow_no: string;
  spray_year_count: string;
  label_count: string;
  length_limit_max: string;
  length_limit_min: string;
  label_length_type: string;
  label_weight_type: string;
  label_type: string;
  tube_no: string;
  qrcode_spray_enable: string;
  weight_per_meter: string;
  weight_ew: string;
}

// 辅助函数：字符串转数字，空字符串返回 null
function toNum(val: string): number | null {
  if (val === '' || val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function toStr(val: string): string | null {
  return val === '' ? null : val;
}

// 管捆号首位选项映射：下拉选项 -> 数据库值
const BUNDLE_FIRST_MAP: Record<string, number> = { '1：油管': 1, '2：套管': 2 };
const BUNDLE_FIRST_MAP_REV: Record<number, string> = { 1: '1：油管', 2: '2：套管' };

// 喷印刻印<年>选项映射
const SPRAY_YEAR_MAP: Record<string, number> = { '1位': 1, '2位': 2, '2位(含季默认1位)': 3 };
const SPRAY_YEAR_MAP_REV: Record<number, string> = { 1: '1位', 2: '2位', 3: '2位(含季默认1位)' };

// 表单数据 -> API请求数据
export function formToApi(form: ParameterSetForm): ParameterSet {
  return {
    order_no: toStr(form.order_no),
    item_no: toStr(form.item_no),
    diameter: toNum(form.diameter),
    wall_thickness: toNum(form.wall_thickness),
    direction_code: toStr(form.direction_code),
    bundle_type: toStr(form.bundle_type),
    bundle_number: toNum(form.bundle_number),
    produce_job_point: toStr(form.produce_job_point),
    order_weight: toNum(form.order_weight),
    lot_no: toStr(form.lot_no),
    roll_no: toStr(form.roll_no),
    melt_no: toStr(form.melt_no),
    melt_no_coupling: toStr(form.melt_no_coupling),
    lot_no_coupling: toStr(form.lot_no_coupling),
    flow_no: toNum(form.flow_no),
    feed_number: toNum(form.feed_number),
    length_coupling: toNum(form.length_coupling),
    weight_coupling: toNum(form.weight_coupling),
    weight_packaging: toNum(form.weight_packaging),
    length_enable: ENABLE_MAP[form.length_enable] ?? null,
    weight_enable: ENABLE_MAP[form.weight_enable] ?? null,
    circle_enable: ENABLE_MAP[form.circle_enable] ?? null,
    carve_enable: ENABLE_MAP[form.carve_enable] ?? null,
    spray_enable: ENABLE_MAP[form.spray_enable] ?? null,
    waste_length_enable: ENABLE_MAP[form.waste_length_enable] ?? null,
    waste_weight_enable: ENABLE_MAP[form.waste_weight_enable] ?? null,
    gun1: form.gun1 ? 1 : 0,
    gun2: form.gun2 ? 1 : 0,
    gun3: form.gun3 ? 1 : 0,
    gun4: form.gun4 ? 1 : 0,
    gun5: form.gun5 ? 1 : 0,
    gun_clear: toNum(form.gun_clear),
    circle_time: toNum(form.circle_time),
    spray_length_type: FORMAT_MAP[form.spray_length_type] ?? null,
    spray_weight_type: FORMAT_MAP[form.spray_weight_type] ?? null,
    spray_length_precision: toNum(form.spray_length_precision),
    spray_weight_precision: toNum(form.spray_weight_precision),
    weight_limit_max: toNum(form.weight_limit_max),
    weight_limit_min: toNum(form.weight_limit_min),
    bundle_first_type: BUNDLE_FIRST_MAP[form.bundle_first_type] ?? null,
    bundle_flow_no: toNum(form.bundle_flow_no),
    spray_year_count: SPRAY_YEAR_MAP[form.spray_year_count] ?? null,
    label_count: toNum(form.label_count),
    length_limit_max: toNum(form.length_limit_max),
    length_limit_min: toNum(form.length_limit_min),
    label_length_type: FORMAT_MAP[form.label_length_type] ?? null,
    label_weight_type: FORMAT_MAP[form.label_weight_type] ?? null,
    label_type: LABEL_TYPE_MAP[form.label_type] ?? null,
    tube_no: toNum(form.tube_no),
    qrcode_spray_enable: ENABLE_MAP[form.qrcode_spray_enable] ?? null,
    weight_per_meter: toNum(form.weight_per_meter),
    weight_ew: toNum(form.weight_ew),
  };
}

// API响应数据 -> 表单数据
export function apiToForm(data: ParameterSet): ParameterSetForm {
  return {
    order_no: data.order_no ?? '',
    item_no: data.item_no ?? '',
    diameter: data.diameter != null ? String(data.diameter) : '',
    wall_thickness: data.wall_thickness != null ? String(data.wall_thickness) : '',
    direction_code: data.direction_code ?? '',
    bundle_type: data.bundle_type ?? '',
    bundle_number: data.bundle_number != null ? String(data.bundle_number) : '',
    produce_job_point: data.produce_job_point ?? '',
    order_weight: data.order_weight != null ? String(data.order_weight) : '',
    lot_no: data.lot_no ?? '',
    roll_no: data.roll_no ?? '',
    melt_no: data.melt_no ?? '',
    melt_no_coupling: data.melt_no_coupling ?? '',
    lot_no_coupling: data.lot_no_coupling ?? '',
    flow_no: data.flow_no != null ? String(data.flow_no) : '',
    feed_number: data.feed_number != null ? String(data.feed_number) : '',
    length_coupling: data.length_coupling != null ? String(data.length_coupling) : '',
    weight_coupling: data.weight_coupling != null ? String(data.weight_coupling) : '',
    weight_packaging: data.weight_packaging != null ? String(data.weight_packaging) : '',
    length_enable: ENABLE_MAP_REV[data.length_enable ?? 0] ?? 'deny',
    weight_enable: ENABLE_MAP_REV[data.weight_enable ?? 0] ?? 'deny',
    circle_enable: ENABLE_MAP_REV[data.circle_enable ?? 0] ?? 'deny',
    carve_enable: ENABLE_MAP_REV[data.carve_enable ?? 0] ?? 'deny',
    spray_enable: ENABLE_MAP_REV[data.spray_enable ?? 0] ?? 'deny',
    waste_length_enable: ENABLE_MAP_REV[data.waste_length_enable ?? 0] ?? 'deny',
    waste_weight_enable: ENABLE_MAP_REV[data.waste_weight_enable ?? 0] ?? 'deny',
    gun1: data.gun1 === 1,
    gun2: data.gun2 === 1,
    gun3: data.gun3 === 1,
    gun4: data.gun4 === 1,
    gun5: data.gun5 === 1,
    gun_clear: data.gun_clear != null ? String(data.gun_clear) : '',
    circle_time: data.circle_time != null ? String(data.circle_time) : '',
    spray_length_type: FORMAT_MAP_REV[data.spray_length_type ?? 0] ?? 'metric',
    spray_weight_type: FORMAT_MAP_REV[data.spray_weight_type ?? 0] ?? 'metric',
    spray_length_precision:
      data.spray_length_precision != null ? String(data.spray_length_precision) : '',
    spray_weight_precision:
      data.spray_weight_precision != null ? String(data.spray_weight_precision) : '',
    weight_limit_max: data.weight_limit_max != null ? String(data.weight_limit_max) : '',
    weight_limit_min: data.weight_limit_min != null ? String(data.weight_limit_min) : '',
    bundle_first_type: BUNDLE_FIRST_MAP_REV[data.bundle_first_type ?? 0] ?? '',
    bundle_flow_no: data.bundle_flow_no != null ? String(data.bundle_flow_no) : '',
    spray_year_count: SPRAY_YEAR_MAP_REV[data.spray_year_count ?? 0] ?? '',
    label_count: data.label_count != null ? String(data.label_count) : '',
    length_limit_max: data.length_limit_max != null ? String(data.length_limit_max) : '',
    length_limit_min: data.length_limit_min != null ? String(data.length_limit_min) : '',
    label_length_type: FORMAT_MAP_REV[data.label_length_type ?? 0] ?? 'metric',
    label_weight_type: FORMAT_MAP_REV[data.label_weight_type ?? 0] ?? 'metric',
    label_type: LABEL_TYPE_MAP_REV[data.label_type ?? 0] ?? 'fixed',
    tube_no: data.tube_no != null ? String(data.tube_no) : '',
    qrcode_spray_enable: ENABLE_MAP_REV[data.qrcode_spray_enable ?? 0] ?? 'deny',
    weight_per_meter: data.weight_per_meter != null ? String(data.weight_per_meter) : '',
    weight_ew: data.weight_ew != null ? String(data.weight_ew) : '',
  };
}

// 查询生产参数
export function getParameterSet() {
  return request.get<ParameterSet>('/parameter-set');
}

// 保存生产参数
export function saveParameterSet(data: ParameterSet) {
  return request.post<{ message: string }>('/parameter-set', data);
}
