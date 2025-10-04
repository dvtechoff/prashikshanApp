import axios from 'axios';

import { apiClient } from './client';

import type { NotificationPayload, NotificationCreateRequest, NotificationBulkCreateRequest } from '@/types/api';

export const listNotifications = async (): Promise<NotificationPayload[]> => {
  try {
    const { data } = await apiClient.get<NotificationPayload[]>('/api/v1/notifications');
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    await apiClient.patch(`/api/v1/notifications/${id}`, { read: true });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return;
    }
    throw error;
  }
};

export const createNotification = async (payload: NotificationCreateRequest): Promise<NotificationPayload> => {
  const { data } = await apiClient.post<NotificationPayload>('/api/v1/notifications', payload);
  return data;
};

export const createBulkNotification = async (payload: NotificationBulkCreateRequest): Promise<NotificationPayload[]> => {
  const { data } = await apiClient.post<NotificationPayload[]>('/api/v1/notifications/bulk', payload);
  return data;
};
