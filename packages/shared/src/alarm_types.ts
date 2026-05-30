export type AlarmSeverity = 'critical' | 'major' | 'minor' | 'warning' | 'info';

export type AlarmConditionState = 'active' | 'cleared';

export type AlarmAckState = 'unacked' | 'acked';

export type AlarmListScope = 'active' | 'history' | 'all';

export type AlarmUpsertReason = 'raise' | 'clear' | 'ack' | 'reopen' | 'refresh';

export type AlarmLogAction = 'raise' | 'clear' | 'ack';

export interface AlarmArea {
  id: number;
  area_code: string;
  area_name: string;
  sort_order: number;
  enabled: boolean;
}

export interface UserAlarmArea {
  area_id: number;
  area_code: string;
  area_name: string;
  is_default: boolean;
}

export interface UserAlarmAreaContext {
  user_id: number;
  default_area_id: number;
  areas: UserAlarmArea[];
}

export interface AlarmSummaryBySeverity {
  critical: number;
  major: number;
  minor: number;
  warning: number;
  info: number;
}

export interface AlarmSummaryByAreaItem {
  area_id: number;
  area_code: string;
  area_name: string;
  active_count: number;
  unacked_count: number;
}

export interface AlarmSummary {
  server_time: string;
  total_active: number;
  total_unacked: number;
  highest_severity: AlarmSeverity | null;
  by_severity: AlarmSummaryBySeverity;
  by_area: AlarmSummaryByAreaItem[];
}

export interface AlarmSummaryQueryParams {
  area_ids?: string;
}

export interface AlarmListQueryParams {
  scope?: AlarmListScope;
  area_ids?: string;
  severity?: string;
  condition_state?: AlarmConditionState;
  ack_state?: AlarmAckState;
  keyword?: string;
  page?: number;
  page_size?: number;
}

export interface AlarmListItem {
  id: number;
  alarm_code: string;
  area_id: number;
  area_code: string;
  area_name: string;
  severity: AlarmSeverity;
  title: string;
  message: string;
  source_module: string;
  source_key: string;
  condition_state: AlarmConditionState;
  ack_state: AlarmAckState;
  first_occurred_at: string;
  last_occurred_at: string;
  cleared_at: string | null;
  acked_at: string | null;
  acked_by_name: string | null;
  version: number;
}

export interface AlarmDetail extends AlarmListItem {
  detail_json: Record<string, unknown>;
}

export interface AlarmLogItem {
  id: number;
  action: AlarmLogAction;
  operator_type: 'system' | 'user';
  operator_id: number | null;
  operator_name: string | null;
  payload_json: Record<string, unknown>;
  created_at: string;
}

export interface AlarmDetailResponse {
  alarm: AlarmDetail;
  logs: AlarmLogItem[];
}

export interface AlarmListResponse {
  items: AlarmListItem[];
  page: number;
  page_size: number;
  total: number;
}

export interface AckAlarmRequest {
  expected_version: number;
  operator_note?: string;
}

export interface UpdateUserAlarmAreasRequest {
  default_area_id: number;
  area_ids: number[];
}

export interface UpdateUserAlarmAreasResponse {
  user_id: number;
  default_area_id: number;
  area_ids: number[];
}

export interface AckAlarmResponse {
  alarm: Pick<AlarmListItem, 'id' | 'ack_state' | 'acked_at' | 'acked_by_name' | 'version'>;
}

export interface AlarmSnapshotPayload {
  server_time: string;
  summary: Pick<AlarmSummary, 'total_active' | 'total_unacked' | 'highest_severity'>;
  active_items: AlarmListItem[];
}

export interface AlarmUpsertPayload {
  reason: AlarmUpsertReason;
  alarm: AlarmListItem;
}

export type AlarmSummaryPayload = AlarmSummary;

export interface AlarmResyncRequiredPayload {
  reason: string;
}
