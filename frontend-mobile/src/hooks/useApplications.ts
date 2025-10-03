import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  applyForInternship,
  getApplication,
  listApplications,
  updateApplication
} from '@/api/applications';
import type {
  ApplicationCreateRequest,
  ApplicationDetail,
  ApplicationSummary,
  ApplicationUpdateRequest
} from '@/types/api';

const LIST_KEY = ['applications'];
const DETAIL_KEY = (id?: string) => ['applications', id];

export const useApplicationList = () =>
  useQuery<ApplicationSummary[], Error>({
    queryKey: LIST_KEY,
    queryFn: listApplications,
    staleTime: 1000 * 30
  });

export const useApplicationDetail = (id?: string) =>
  useQuery<ApplicationDetail, Error>({
    queryKey: DETAIL_KEY(id),
    queryFn: () => getApplication(id as string),
    enabled: Boolean(id)
  });

export const useApplyForInternship = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: applyForInternship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
    }
  });

  const submit = useCallback(
    async (payload: ApplicationCreateRequest) => {
      const result = await mutation.mutateAsync(payload);
      await queryClient.invalidateQueries({ queryKey: DETAIL_KEY(result.id) });
      return result;
    },
    [mutation, queryClient]
  );

  return {
    submit,
    ...mutation
  };
};

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ApplicationUpdateRequest }) =>
      updateApplication(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
      queryClient.invalidateQueries({ queryKey: DETAIL_KEY(data.id) });
    }
  });

  return mutation;
};
