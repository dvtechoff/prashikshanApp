import { apiClient } from './client';

import type {
  ApplicationCreateRequest,
  ApplicationDetail,
  ApplicationSummary,
  ApplicationUpdateRequest
} from '@/types/api';

export const listApplications = async (): Promise<ApplicationSummary[]> => {
  const { data } = await apiClient.get<ApplicationSummary[]>('/api/v1/applications');
  return data;
};

export const getApplication = async (id: string): Promise<ApplicationDetail> => {
  const { data } = await apiClient.get<ApplicationDetail>(`/api/v1/applications/${id}`);
  return data;
};

export const applyForInternship = async (
  payload: ApplicationCreateRequest
): Promise<ApplicationSummary> => {
  const { data } = await apiClient.post<ApplicationSummary>('/api/v1/applications', payload);
  return data;
};

export const updateApplication = async (
  id: string,
  payload: ApplicationUpdateRequest
): Promise<ApplicationSummary> => {
  const { data } = await apiClient.patch<ApplicationSummary>(
    `/api/v1/applications/${id}`,
    payload
  );
  return data;
};
