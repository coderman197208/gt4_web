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
  wall_thickness: number | null;
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
  weight_packaging: number | null;
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

// ==================== 合同数据类型定义 ====================

// 合同数据（对应 api_order_data_t 表）
export interface OrderData {
  order_no: string;
  item_no: string;
  roll_no: string | null;
  diameter: number | null;
  wall_thickness: number | null;
  prod_code: string | null;
  prod_cname: string | null;
  heat_treat_code: string | null;
  heat_treat_text: string | null;
  std_sg_code: string | null;
  std_text: string | null;
  sg_text: string | null;
  mat_no: string | null;
  mat_text: string | null;
  thread_type_code: string | null;
  thread_type_sign: string | null;
  end_type_code: string | null;
  end_type_sign: string | null;
  coupling_type_code: string | null;
  coupling_type_sign: string | null;
  thread_face_treat_mode_code: string | null;
  thread_face_treat_mode: string | null;
  length_from: number | null;
  length_to: number | null;
  order_unit_code: string | null;
  order_unit: string | null;
  order_qty: number | null;
  order_tube: number | null;
  order_weight: number | null;
  fixed_order_weight: number | null;
  unfixed_order_weight: number | null;
  delivery_tolerance_code: string | null;
  delivery_tolerance_unit: string | null;
  delivery_tolerance_from: number | null;
  delivery_tolerance_to: number | null;
  short_rate: number | null;
  short_from: number | null;
  short_to: number | null;
  single_bundle_weight_max: number | null;
  single_bundle_tube_max: number | null;
  oil_code: string | null;
  oil_type: string | null;
  stamp_req: string | null;
  stencil_req: string | null;
  label_req_1: string | null;
  label_req_2: string | null;
  label_req_3: string | null;
  label_req_4: string | null;
  label_req_5: string | null;
  label_req_6: string | null;
  label_req_7: string | null;
  label_req_8: string | null;
  qual_special_req: string | null;
  produce_special_req: string | null;
  std_pressure_mpa: number | null;
  std_pressure_psi: number | null;
  stabilivolt_time_min: number | null;
  anneal_flag: string | null;
  weight_per_meter: number | null;
  weight_ew: number | null;
  theory_weight_eng: number | null;
  order_no_old: string | null;
  color_circle: string | null;
  color_circle_pos: string | null;
  finish_number: number | null;
  finish_length: number | null;
  finish_weight: number | null;
  finish_number_sh: number | null;
  finish_length_sh: number | null;
  finish_weight_sh: number | null;
  last_flow_no: number | null;
  stencil_req_manual: string | null;
  label_req_1_manual: string | null;
  label_req_2_manual: string | null;
  label_req_3_manual: string | null;
  label_req_4_manual: string | null;
  label_req_5_manual: string | null;
  label_req_6_manual: string | null;
  label_req_7_manual: string | null;
  label_req_8_manual: string | null;
  colour: string | null;
  toc: string | null;
  select_flag: string | null;
  order_qty_l2: number | null;
  rolling_diameter: number | null;
  rolling_thickness: number | null;
  weight_mode_code: string | null;
  weight_mode_text: string | null;
  p_weight_tolerance_ul: number | null;
  p_weight_tolerance_ll: number | null;
  weight_req_flatside_wpe: number | null;
  control_lenght_ul: number | null;
  control_lenght_ll: number | null;
  label_length_type: number | null;
  label_weight_type: number | null;
  label_type: number | null;
  height: number | null;
  end_type: string | null;
  coupling_type: string | null;
  mic_no: string | null;
  diameter_down_ctrl: number | null;
  diameter_up_ctrl: number | null;
  wal_thick_down_ctrl: number | null;
  wal_thick_up_ctrl: number | null;
  height_down_ctrl: number | null;
  height_up_ctrlv: number | null;
  length_grade_code: string | null;
  length_grade: string | null;
  thread_type: string | null;
  stamp_req_1_manual: string | null;
  stamp_req_2_manual: string | null;
  stamp_req_3_manual: string | null;
  stamp_req_4_manual: string | null;
  stamp_req_5_manual: string | null;
  stamp_req_6_manual: string | null;
  stamp_req_7_manual: string | null;
  stamp_req_8_manual: string | null;
}
