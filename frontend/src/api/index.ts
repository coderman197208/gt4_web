/**
 * API模块统一导出
 *
 * @example
 * // 导入所有API
 * import * as api from '@/api';
 *
 * // 使用API
 * const users = await api.getUsers();
 * const post = await api.createPost({ title: 'Hello', ... });
 *
 * @example
 * // 按需导入
 * import { getUsers, createPost, login } from '@/api';
 */

// 导出类型定义
export * from '@gt4_web/shared';

// 导出API客户端
export { default as apiClient, request } from './client';

// 导出用户相关API
export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser,
  getUserPosts,
} from './users';

// 导出文章相关API
export {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  patchPost,
  deletePost,
  publishPost,
  unpublishPost,
} from './posts';

// 导出评论相关API
export {
  getComments,
  getCommentById,
  createComment,
  updateComment,
  patchComment,
  deleteComment,
  getPostComments,
  getUserComments,
} from './comments';

// 导出认证相关API
export { login, logout, saveAuthInfo, getCurrentUser, isAuthenticated, healthCheck } from './auth';

// 导出生产参数相关API
export { getParameterSet, saveParameterSet, formToApi, apiToForm } from './parameterSet';
export type { ParameterSetForm } from './parameterSet';

// 导出合同数据相关API
export { getOrderNos, getItemNos, getOrderData, updateOrderData, createOrderData } from './orderData';
