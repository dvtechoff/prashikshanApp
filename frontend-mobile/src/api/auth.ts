import { apiClient } from './client';

import type {
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
  TokenResponse,
  UserResponse
} from '@/types/api';

export const login = async (payload: LoginRequest): Promise<TokenResponse> => {
  const { data } = await apiClient.post<TokenResponse>('/api/v1/auth/login', payload);
  return data;
};

export const refreshTokens = async (payload: RefreshRequest): Promise<TokenResponse> => {
  const { data } = await apiClient.post<TokenResponse>('/api/v1/auth/refresh', payload);
  return data;
};

export const register = async (payload: RegisterRequest): Promise<UserResponse> => {
  const { data } = await apiClient.post<UserResponse>('/api/v1/auth/register', payload);
  return data;
};
