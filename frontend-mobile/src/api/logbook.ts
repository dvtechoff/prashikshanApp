import { apiClient } from './client';

import type {
  LogbookEntry,
  LogbookEntryCreateRequest,
  LogbookEntryUpdateRequest
} from '@/types/api';

export interface LogbookQueryParams {
  application_id?: string;
}

export const listLogbookEntries = async (
  params?: LogbookQueryParams
): Promise<LogbookEntry[]> => {
  const { data } = await apiClient.get<LogbookEntry[]>('/api/v1/logbook-entries', {
    params
  });
  return data;
};

export const getLogbookEntry = async (id: string): Promise<LogbookEntry> => {
  const { data } = await apiClient.get<LogbookEntry>(`/api/v1/logbook-entries/${id}`);
  return data;
};

export const createLogbookEntry = async (
  payload: LogbookEntryCreateRequest
): Promise<LogbookEntry> => {
  const { data } = await apiClient.post<LogbookEntry>('/api/v1/logbook-entries', payload);
  return data;
};

export const updateLogbookEntry = async (
  id: string,
  payload: LogbookEntryUpdateRequest
): Promise<LogbookEntry> => {
  const { data } = await apiClient.patch<LogbookEntry>(`/api/v1/logbook-entries/${id}`, payload);
  return data;
};
