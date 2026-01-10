import { request } from './client';
import type { LoginParams, LoginResponse, HealthCheckResponse } from './types';

/**
 * 认证相关API
 */

/**
 * 用户登录
 * @param data 登录参数
 */
export function login(data: LoginParams): Promise<LoginResponse> {
  return request.post<LoginResponse>('/auth/login', data);
}

/**
 * 用户登出
 */
export function logout(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_info');
}

/**
 * 保存登录信息
 * @param token 访问令牌
 * @param user 用户信息
 */
export function saveAuthInfo(token: string, user: any): void {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user_info', JSON.stringify(user));
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): any {
  const userInfo = localStorage.getItem('user_info');
  return userInfo ? JSON.parse(userInfo) : null;
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('auth_token');
}

/**
 * 健康检查
 */
export function healthCheck(): Promise<HealthCheckResponse> {
  return request.get<HealthCheckResponse>('/health');
}
