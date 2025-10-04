import { api } from './api';
import type { UserResponse, UserUpdateRequest } from './types';

export const getCurrentUser = async (): Promise<UserResponse> => {
  const { data } = await api.get<UserResponse>('/api/v1/users/me');
  return data;
};

export const updateCurrentUser = async (payload: UserUpdateRequest): Promise<UserResponse> => {
  const { data } = await api.patch<UserResponse>('/api/v1/users/me', payload);
  return data;
};
