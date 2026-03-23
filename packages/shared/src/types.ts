/**
 * 前后端共享的类型定义
 */

// 通用API响应包装
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页请求参数
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// 分页响应数据
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// 用户类型
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

// 文章类型
export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
  published: boolean;
}

// 评论类型
export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
}

// 登录请求参数
export interface LoginParams {
  username: string;
  password: string;
}

// 登录响应数据
export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

// 健康检查响应
export interface HealthCheckResponse {
  status: string;
  message: string;
  timestamp: string;
}

// 创建用户参数
export type CreateUserParams = Omit<User, 'id' | 'createdAt'>;

// 更新用户参数
export type UpdateUserParams = Partial<CreateUserParams>;

// 创建文章参数
export type CreatePostParams = Omit<Post, 'id' | 'createdAt'>;

// 更新文章参数
export type UpdatePostParams = Partial<CreatePostParams>;

// 创建评论参数
export type CreateCommentParams = Omit<Comment, 'id' | 'createdAt'>;

// 更新评论参数
export type UpdateCommentParams = Partial<CreateCommentParams>;

// ==================== 生产参数设定类型定义 ====================

// 生产参数（对应 parameter_set 表）
export interface ParameterSet {
  order_no: string | null;
  item_no: string | null;
  diameter: number | null;
  thickness: number | null;
  direction_code: string | null;
  bundle_type: string | null;
  bundle_number: number | null;
  produce_job_point: string | null;
  order_weight: number | null;
  lot_no: string | null;
  roll_no: string | null;
  melt_no: string | null;
  melt_no_coupling: string | null;
  lot_no_coupling: string | null;
  flow_no: number | null;
  feed_number: number | null;
  length_coupling: number | null;
  weight_coupling: number | null;
  weight_packging: number | null;
  length_enable: number | null;
  weight_enable: number | null;
  circle_enable: number | null;
  carve_enable: number | null;
  spray_enable: number | null;
  waste_length_enable: number | null;
  waste_weight_enable: number | null;
  gun1: number | null;
  gun2: number | null;
  gun3: number | null;
  gun4: number | null;
  gun5: number | null;
  gun_clear: number | null;
  circle_time: number | null;
  spray_length_type: number | null;
  spray_weight_type: number | null;
  spray_length_precision: number | null;
  spray_weight_precision: number | null;
  weight_limit_max: number | null;
  weight_limit_min: number | null;
  bundle_first_type: number | null;
  bundle_flow_no: number | null;
  spray_year_count: number | null;
  label_count: number | null;
  length_limit_max: number | null;
  length_limit_min: number | null;
  label_length_type: number | null;
  label_weight_type: number | null;
  label_type: number | null;
  tube_no: number | null;
  qrcode_spray_enable: number | null;
  weight_per_meter: number | null;
  weight_ew: number | null;
}

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
  value: string; // JSON字符串形式的数据（前端需要解析）
}
