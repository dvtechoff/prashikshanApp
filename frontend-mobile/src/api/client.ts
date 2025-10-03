import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  type AxiosRequestHeaders
} from 'axios';

import { API_URL } from '@/config/env';
import { authStore } from '@/store/authStore';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  headers?: AxiosRequestHeaders;
};

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15_000
});

apiClient.interceptors.request.use((config: RetryableRequestConfig) => {
  const token = authStore.getState().accessToken;
  if (token) {
    const headers: AxiosRequestHeaders = config.headers ?? {};
    headers.Authorization = `Bearer ${token}`;
    config.headers = headers;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const { response, config } = error;
    if (!response) {
      return Promise.reject(error);
    }

    const requestConfig = config as RetryableRequestConfig;

    if (response.status === 401 && requestConfig && !requestConfig._retry) {
      requestConfig._retry = true;
      try {
        const refreshed = await authStore.getState().refreshTokens();
        if (refreshed && requestConfig.headers) {
          requestConfig.headers.Authorization = `Bearer ${refreshed.accessToken}`;
          return apiClient(requestConfig);
        }
      } catch (refreshError) {
        authStore.getState().signOut();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
