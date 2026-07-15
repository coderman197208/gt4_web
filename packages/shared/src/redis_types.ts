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

// WebSocket 数据推送消息
export interface DataPushMessage {
  tag: string; // 标签名称
  hasValue?: boolean; // false 表示本次仅通知事件发生，不附带 Redis 值
  value?: string; // JSON字符串格式的数据（前端需要解析）
}

// ==================== 以下是操作命令类型定义 ====================
// 这些类型定义了前端发送给后端的操作命令参数结构，对应DataPushMessage的value字段，后端需要根据这些结构解析参数并执行相应的操作

//设定投料支数命令
// export interface SetFeedNumCmd {
//   feed_num: number; // 投料支数
// }

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

// 修改管子信息命令
export interface ModifyTubeCmd {
  seq_no: number; // 序列号，确保管子的唯一性和顺序
  position_name: string; // 工位名称
  order_no: string; // 合同号
  item_no: string; // 项目号
  roll_no: string; // 轧批号
  melt_no: string; // 炉号
  lot_no: string; // 试批号
  tube_no: number; // 管号
  flow_no: number; // 流水号
  length: number; // 长度(米)
  weight: number; // 重量(KG)
  length_ok: boolean; // 长度合格
  weight_ok: boolean; // 重量合格
  lotno_coupling: string; // 接箍批号
  meltno_coupling: string; // 接箍炉号
}

// 删除管子命令
export interface DeleteTubeCmd {
  seq_no: number; // 管子在当前工位的顺序号，0表示第一个管子，1表示第二个管子，以此类推，-1代表全部删除
  position_name: string; // 工位名称
}

// 新增管子命令
export interface AddTubeCmd {
  seq_no: number; // 在此位置前插入管子，0表示第一个位置，1表示第二个位置，以此类推，-1代表在末尾添加
  position_name: string; // 工位名称
}

// 设置当前合同命令
export interface SetCurrentContractCmd {
  order_no: string; // 合同号
  item_no: string; // 项目号
}

export interface RequestOrderDataCmd {
  order_no: string; // 合同号
  item_no: string; // 项目号
}

// 标签打印事件/命令
export interface TagPrintEvent {
  order_no: string; // 合同号
  item_no: string; // 项目号
  bundle_no: string; // 捆号
  count: number; // 打印数量
}

export interface ApiBundleDataEvent {
  flag: 'D' | 'I' | 'U'; // 操作标志：删除/新增/修改
  order_no: string; // 合同号
  item_no: string; // 项目号
  bundle_no: string; // 管捆号
}

export type UserCommandPayload =
  | MoveTubeCmd
  | ModifyTubeCmd
  | DeleteTubeCmd
  | AddTubeCmd
  | SetCurrentContractCmd
  | RequestOrderDataCmd
  | TagPrintEvent
  | ApiBundleDataEvent
  | string
  | number
  | Record<string, unknown>;

// WebSocket 操作命令发送消息（字段名与C++端一致）
export interface CmdPushMessage {
  cmd_name: string; // 操作命令名称
  cmd_para?: UserCommandPayload; // 命令参数，可为对象、字符串或数字；无参数时可省略
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

export interface TubeInfo {
  order_no: string; // 合同号
  item_no: string; // 项目号
  roll_no: string; // 轧批号
  melt_no: string; // 炉号
  lot_no: string; // 试批号
  tube_no: number; // 管号
  flow_no: number; // 流水号
  length: number; // 长度(米)
  weight: number; // 重量(KG)
  length_ok: boolean; // 长度合格
  weight_ok: boolean; // 重量合格
  lotno_coupling: string; // 接箍批号
  meltno_coupling: string; // 接箍炉号
}

export interface YieldStatistics {
  order_no: string;
  item_no: string;
  melt_no: string;
  lot_no: string;
  diameter: number;
  thickness: number;
  order_weight: number;
  order_length: number;
  order_count: number;
  order_weight_correct: number;
  order_length_correct: number;
  order_count_correct: number;
  lot_weight: number;
  lot_length: number;
  lot_count: number;
  shift_weight: number;
  shift_length: number;
  shift_count: number;
}
