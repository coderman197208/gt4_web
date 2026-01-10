import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * 创建axios实例
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api', // Vite会将/api代理到JSON Server
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 */
apiClient.interceptors.request.use(
  (config) => {
    // 从localStorage获取token（如果有）
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回响应数据
    return response;
  },
  (error: AxiosError) => {
    // 统一错误处理
    if (error.response) {
      // 服务器响应错误
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('请求参数错误:', data);
          break;
        case 401:
          console.error('未授权，请登录:', data);
          // 可以在这里处理token过期，跳转到登录页
          localStorage.removeItem('auth_token');
          // window.location.href = '/login';
          break;
        case 403:
          console.error('拒绝访问:', data);
          break;
        case 404:
          console.error('请求的资源不存在:', data);
          break;
        case 500:
          console.error('服务器内部错误:', data);
          break;
        default:
          console.error(`请求失败 (${status}):`, data);
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络错误，请检查网络连接');
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * 通用请求方法封装
 */
export const request = {
  /**
   * GET请求
   */
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.get<T>(url, config).then(res => res.data);
  },

  /**
   * POST请求
   */
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.post<T>(url, data, config).then(res => res.data);
  },

  /**
   * PUT请求（全量更新）
   */
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.put<T>(url, data, config).then(res => res.data);
  },

  /**
   * PATCH请求（部分更新）
   */
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.patch<T>(url, data, config).then(res => res.data);
  },

  /**
   * DELETE请求
   */
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.delete<T>(url, config).then(res => res.data);
  },
};

// 导出axios实例，以便在需要时直接使用
export default apiClient;
