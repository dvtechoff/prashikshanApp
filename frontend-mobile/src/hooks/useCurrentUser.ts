import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getCurrentUser, updateCurrentUser } from '@/api/users';
import type { UserResponse, UserUpdateRequest } from '@/types/api';

const CURRENT_USER_QUERY_KEY = ['currentUser'];

export const useCurrentUserQuery = () =>
  useQuery<UserResponse, Error>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

export const useUpdateCurrentUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, UserUpdateRequest>({
    mutationFn: updateCurrentUser,
    onSuccess: (user) => {
      queryClient.setQueryData<UserResponse>(CURRENT_USER_QUERY_KEY, user);
    }
  });
};
