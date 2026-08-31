import type {
  AcknowledgeAlarmsResponse,
  AlarmAcknowledgementResponse,
  AlarmEvent,
  AlarmPage,
  AlarmQueryDays,
} from '@gt4_web/shared';
import { request } from './client';

export function getLatestAlarms(): Promise<AlarmEvent[]> {
  return request.get<AlarmEvent[]>('/alarms/latest');
}

export function getAlarms(days: AlarmQueryDays, page: number): Promise<AlarmPage> {
  return request.get<AlarmPage>('/alarms', { params: { days, page } });
}

export function acknowledgeAlarm(id: string): Promise<AlarmAcknowledgementResponse> {
  return request.patch<AlarmAcknowledgementResponse>(`/alarms/${id}/acknowledgement`);
}

export function acknowledgeAlarms(ids: string[]): Promise<AcknowledgeAlarmsResponse> {
  return request.post<AcknowledgeAlarmsResponse>('/alarms/acknowledgements', { ids });
}
