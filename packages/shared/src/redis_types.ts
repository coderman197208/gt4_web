/**
 * 前后端共享的类型定义
 */

// ==================== WebSocket 实时数据类型定义 ====================

// Tag1 数据结构（6个字段）
export interface Tag1Data {
  ph: string; // 批号
  lh: string; // 炉号
  czh: string; // 车组号
  tlxh: number; // 拖链序号
  zzwj: number; // 轧制温度（小数）
  zzbh: number; // 轧制编号
}

// Tag2 数据类型（单个数字）
export type Tag2Data = number;

// Tag3 数据类型（6个数字的数组）
export type Tag3Data = number[];

// WebSocket 订阅请求消息
export interface SubscribeRequest {
  tags: string[]; // 要订阅的标签列表，如 ['tag1', 'tag2', 'tag3']
}

// WebSocket 操作命令发送消息（字段名与C++端一致）
export interface CmdPushMessage {
  cmd_name: string; // 操作命令名称
  cmd_para?: Record<string, unknown>; // 命令参数对象，无参数时可省略
}

// WebSocket 数据推送消息
export interface DataPushMessage {
  tag: string; // 标签名称
  value: string; // JSON字符串格式的数据（前端需要解析）
}

// ==================== 以下是操作命令类型定义 ====================
// 这些类型定义了前端发送给后端的操作命令参数结构，对应DataPushMessage的value字段，后端需要根据这些结构解析参数并执行相应的操作

//设定投料支数命令
export interface SetFeedNumCmd {
  feed_num: number; // 投料支数
}

//移动管子命令
//plan:投料虚拟工位
//align:对齐工位
//weight：称重工位
//carve:刻印工位
//spray:喷码工位
//circle:色环工位
//scraptroller:出废辊道工位
//scrapt:废料台架工位
//backbuffer:打包前缓冲区工位
//basket:打包区工位
export interface MoveTubeCmd {
  from: string;
  to: string;
}

// ==================== 以下是生产数据类型定义 ====================

export interface PlanInfo {
  order_no: string; // 合同号
  item_no: string; // 项目号
  roll_no: string; // 轧批号
  melt_no: string; // 炉号
  lot_no: string; // 试批号
  lotno_coupling: string; // 接箍批号
  meltno_coupling: string; // 接箍炉号
  feed_num: number; // 投料支数
  tube_no: number; // 管号
}
