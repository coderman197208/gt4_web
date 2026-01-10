import { request } from './client';
import type { Post, CreatePostParams, UpdatePostParams } from './types';

/**
 * 文章相关API
 */

/**
 * 获取所有文章
 * @param params 查询参数（支持JSON Server的查询语法）
 * @example
 * // 获取已发布的文章
 * getPosts({ published: true })
 * 
 * // 分页查询
 * getPosts({ _page: 1, _limit: 10 })
 * 
 * // 排序
 * getPosts({ _sort: 'createdAt', _order: 'desc' })
 * 
 * // 包含评论
 * getPosts({ _embed: 'comments' })
 */
export function getPosts(params?: Record<string, any>): Promise<Post[]> {
  return request.get<Post[]>('/posts', { params });
}

/**
 * 获取单个文章
 * @param id 文章ID
 * @param params 查询参数（如 _embed=comments 包含评论）
 */
export function getPostById(id: number, params?: Record<string, any>): Promise<Post> {
  return request.get<Post>(`/posts/${id}`, { params });
}

/**
 * 创建文章
 * @param data 文章数据
 */
export function createPost(data: CreatePostParams): Promise<Post> {
  return request.post<Post>('/posts', {
    ...data,
    createdAt: new Date().toISOString(),
  });
}

/**
 * 更新文章（全量更新）
 * @param id 文章ID
 * @param data 文章数据
 */
export function updatePost(id: number, data: CreatePostParams): Promise<Post> {
  return request.put<Post>(`/posts/${id}`, data);
}

/**
 * 更新文章（部分更新）
 * @param id 文章ID
 * @param data 要更新的字段
 */
export function patchPost(id: number, data: UpdatePostParams): Promise<Post> {
  return request.patch<Post>(`/posts/${id}`, data);
}

/**
 * 删除文章
 * @param id 文章ID
 */
export function deletePost(id: number): Promise<void> {
  return request.delete<void>(`/posts/${id}`);
}

/**
 * 发布文章（快捷方法）
 * @param id 文章ID
 */
export function publishPost(id: number): Promise<Post> {
  return patchPost(id, { published: true });
}

/**
 * 取消发布文章（快捷方法）
 * @param id 文章ID
 */
export function unpublishPost(id: number): Promise<Post> {
  return patchPost(id, { published: false });
}
