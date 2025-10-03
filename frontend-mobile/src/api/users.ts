import { apiClient } from './client';

import type { UserResponse, UserUpdateRequest } from '@/types/api';

export const getCurrentUser = async (): Promise<UserResponse> => {
  const { data } = await apiClient.get<UserResponse>('/api/v1/users/me');
  return data;
};

export const updateCurrentUser = async (payload: UserUpdateRequest): Promise<UserResponse> => {
  const { data } = await apiClient.patch<UserResponse>('/api/v1/users/me', payload);
  return data;
};
