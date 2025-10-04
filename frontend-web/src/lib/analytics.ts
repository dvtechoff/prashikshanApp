import { api } from './api';
import type { MetricsResponse } from './types';

export const getMetrics = async (): Promise<MetricsResponse> => {
  const { data } = await api.get<MetricsResponse>('/api/v1/analytics/metrics');
  return data;
};
