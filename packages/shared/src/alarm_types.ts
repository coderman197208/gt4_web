export type AlarmQueryDays = 1 | 3 | 10 | 30;

export interface AlarmEvent {
  id: string;
  message: string;
  area: string;
  occurredAt: string;
  acknowledgedAt: string | null;
}

export interface AlarmPage {
  items: AlarmEvent[];
  page: number;
  pageSize: 20;
  total: number;
}

export interface AlarmAcknowledgementResponse {
  id: string;
  acknowledgedAt: string;
}

export interface AcknowledgeAlarmsRequest {
  ids: string[];
}

export interface AcknowledgeAlarmsResponse {
  acknowledgedCount: number;
}

export interface AlarmChangeNotification {
  id: string;
}
