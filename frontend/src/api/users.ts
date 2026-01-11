import { request } from './client';
import type { User, CreateUserParams, UpdateUserParams } from '@gt4_web/shared';

/**
 * 用户相关API
 */

/**
 * 获取所有用户
 * @param params 查询参数（支持JSON Server的查询语法）
 */
export function getUsers(params?: Record<string, any>): Promise<User[]> {
  return request.get<User[]>('/users', { params });
}

/**
 * 获取单个用户
 * @param id 用户ID
 */
export function getUserById(id: number): Promise<User> {
  return request.get<User>(`/users/${id}`);
}

/**
 * 创建用户
 * @param data 用户数据
 */
export function createUser(data: CreateUserParams): Promise<User> {
  return request.post<User>('/users', {
    ...data,
    createdAt: new Date().toISOString(),
  });
}

/**
 * 更新用户（全量更新）
 * @param id 用户ID
 * @param data 用户数据
 */
export function updateUser(id: number, data: CreateUserParams): Promise<User> {
  return request.put<User>(`/users/${id}`, data);
}

/**
 * 更新用户（部分更新）
 * @param id 用户ID
 * @param data 要更新的字段
 */
export function patchUser(id: number, data: UpdateUserParams): Promise<User> {
  return request.patch<User>(`/users/${id}`, data);
}

/**
 * 删除用户
 * @param id 用户ID
 */
export function deleteUser(id: number): Promise<void> {
  return request.delete<void>(`/users/${id}`);
}

/**
 * 获取指定用户的所有文章（自定义端点）
 * @param userId 用户ID
 */
export function getUserPosts(userId: number) {
  return request.get(`/users/${userId}/posts`);
}
