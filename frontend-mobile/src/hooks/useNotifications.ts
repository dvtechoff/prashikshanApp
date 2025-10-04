import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { 
  listNotifications, 
  markNotificationAsRead, 
  createNotification, 
  createBulkNotification 
} from '@/api/notifications';
import type { NotificationPayload, NotificationCreateRequest, NotificationBulkCreateRequest } from '@/types/api';

const LIST_KEY = ['notifications'];

export const useNotificationList = () =>
  useQuery<NotificationPayload[], Error>({
    queryKey: LIST_KEY,
    queryFn: listNotifications,
    staleTime: 1000 * 20
  });

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
    }
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NotificationCreateRequest) => createNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
    }
  });
};

export const useCreateBulkNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NotificationBulkCreateRequest) => createBulkNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
    }
  });
};
