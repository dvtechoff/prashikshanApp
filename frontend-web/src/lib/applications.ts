import { api } from './api';
import type {
  ApplicationCreateRequest,
  ApplicationDetail,
  ApplicationSummary,
  ApplicationUpdateRequest
} from './types';

export const listApplications = async (): Promise<ApplicationSummary[]> => {
  const { data } = await api.get<ApplicationSummary[]>('/api/v1/applications');
  return data;
};

export const getApplication = async (id: string): Promise<ApplicationDetail> => {
  const { data } = await api.get<ApplicationDetail>(`/api/v1/applications/${id}`);
  return data;
};

export const applyForInternship = async (
  payload: ApplicationCreateRequest
): Promise<ApplicationSummary> => {
  const { data } = await api.post<ApplicationSummary>('/api/v1/applications', payload);
  return data;
};

export const updateApplication = async (
  id: string,
  payload: ApplicationUpdateRequest
): Promise<ApplicationSummary> => {
  const { data} = await api.patch<ApplicationSummary>(
    `/api/v1/applications/${id}`,
    payload
  );
  return data;
};
