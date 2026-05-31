import { request } from './client';
import type {
  AckAlarmRequest,
  AckAlarmResponse,
  AlarmArea,
  AlarmBatchAckRequest,
  AlarmBatchAckResponse,
  AlarmDetailResponse,
  AlarmListQueryParams,
  AlarmListResponse,
  AlarmManagementUserDirectoryItem,
  ManagedUserAlarmAreaContext,
  AlarmSummary,
  AlarmSummaryQueryParams,
  UpdateUserAlarmAreasRequest,
  UpdateUserAlarmAreasResponse,
  UserAlarmAreaContext,
} from '@gt4_web/shared';

export function getMyAlarmAreas(): Promise<UserAlarmAreaContext> {
  return request.get<UserAlarmAreaContext>('/users/me/alarm-areas');
}

export function getAlarmAreas(): Promise<AlarmArea[]> {
  return request.get<AlarmArea[]>('/alarm-areas');
}

export function updateUserAlarmAreas(
  userId: number,
  payload: UpdateUserAlarmAreasRequest,
): Promise<UpdateUserAlarmAreasResponse> {
  return request.put<UpdateUserAlarmAreasResponse>(`/users/${userId}/alarm-areas`, payload);
}

export function getAlarmManagementUsers(): Promise<AlarmManagementUserDirectoryItem[]> {
  return request.get<AlarmManagementUserDirectoryItem[]>('/admin/alarm-users');
}

export function getManagedUserAlarmAreas(userId: number): Promise<ManagedUserAlarmAreaContext> {
  return request.get<ManagedUserAlarmAreaContext>(`/users/${userId}/alarm-areas`);
}

export function saveManagedUserAlarmAreas(
  userId: number,
  payload: UpdateUserAlarmAreasRequest,
): Promise<UpdateUserAlarmAreasResponse> {
  return request.put<UpdateUserAlarmAreasResponse>(`/users/${userId}/alarm-areas`, payload);
}

export function getAlarmSummary(params: AlarmSummaryQueryParams = {}): Promise<AlarmSummary> {
  return request.get<AlarmSummary>('/alarms/summary', { params });
}

export function getAlarms(params: AlarmListQueryParams = {}): Promise<AlarmListResponse> {
  return request.get<AlarmListResponse>('/alarms', { params });
}

export function getAlarmDetail(alarmId: number): Promise<AlarmDetailResponse> {
  return request.get<AlarmDetailResponse>(`/alarms/${alarmId}`);
}

export function ackAlarm(alarmId: number, payload: AckAlarmRequest): Promise<AckAlarmResponse> {
  return request.post<AckAlarmResponse>(`/alarms/${alarmId}/ack`, payload);
}

export function batchAckAlarms(payload: AlarmBatchAckRequest): Promise<AlarmBatchAckResponse> {
  return request.post<AlarmBatchAckResponse>('/admin/alarms/batch-ack', payload);
}
