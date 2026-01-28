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
