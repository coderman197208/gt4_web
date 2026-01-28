import { request } from './client';
import type { Comment, CreateCommentParams, UpdateCommentParams } from '@gt4_web/shared';

/**
 * 评论相关API
 */

/**
 * 获取所有评论
 * @param params 查询参数（支持JSON Server的查询语法）
 * @example
 * // 获取特定文章的评论
 * getComments({ postId: 1 })
 *
 * // 包含文章信息
 * getComments({ _expand: 'post' })
 *
 * // 包含用户信息
 * getComments({ _expand: 'user' })
 */
export function getComments(params?: Record<string, any>): Promise<Comment[]> {
  return request.get<Comment[]>('/comments', { params });
}

/**
 * 获取单个评论
 * @param id 评论ID
 */
export function getCommentById(id: number): Promise<Comment> {
  return request.get<Comment>(`/comments/${id}`);
}

/**
 * 创建评论
 * @param data 评论数据
 */
export function createComment(data: CreateCommentParams): Promise<Comment> {
  return request.post<Comment>('/comments', {
    ...data,
    createdAt: new Date().toISOString(),
  });
}

/**
 * 更新评论（全量更新）
 * @param id 评论ID
 * @param data 评论数据
 */
export function updateComment(id: number, data: CreateCommentParams): Promise<Comment> {
  return request.put<Comment>(`/comments/${id}`, data);
}

/**
 * 更新评论（部分更新）
 * @param id 评论ID
 * @param data 要更新的字段
 */
export function patchComment(id: number, data: UpdateCommentParams): Promise<Comment> {
  return request.patch<Comment>(`/comments/${id}`, data);
}

/**
 * 删除评论
 * @param id 评论ID
 */
export function deleteComment(id: number): Promise<void> {
  return request.delete<void>(`/comments/${id}`);
}

/**
 * 获取文章的所有评论
 * @param postId 文章ID
 */
export function getPostComments(postId: number): Promise<Comment[]> {
  return getComments({ postId });
}

/**
 * 获取用户的所有评论
 * @param userId 用户ID
 */
export function getUserComments(userId: number): Promise<Comment[]> {
  return getComments({ userId });
}
