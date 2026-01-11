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
