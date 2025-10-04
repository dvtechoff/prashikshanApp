import { api } from './api';
import type { LoginRequest, TokenResponse, RegisterRequest } from './types';

export const login = async (payload: LoginRequest): Promise<TokenResponse> => {
  const { data } = await api.post<TokenResponse>('/api/v1/auth/login', payload);
  return data;
};

export const register = async (payload: RegisterRequest): Promise<TokenResponse> => {
  const { data } = await api.post<TokenResponse>('/api/v1/auth/register', payload);
  return data;
};

export const refreshToken = async (refreshToken: string): Promise<TokenResponse> => {
  const { data } = await api.post<TokenResponse>('/api/v1/auth/refresh', {
    refresh_token: refreshToken
  });
  return data;
};
