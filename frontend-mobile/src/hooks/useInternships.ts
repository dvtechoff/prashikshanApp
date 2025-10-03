import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createInternship, getInternship, listInternships, updateInternship } from '@/api/internships';
import type {
  Internship,
  InternshipCreateRequest,
  InternshipFilters,
  InternshipUpdateRequest
} from '@/types/api';

const listKey = (filters?: InternshipFilters) => ['internships', { filters }];

export const useInternshipList = (filters?: InternshipFilters) => {
  return useQuery<Internship[], Error>({
    queryKey: listKey(filters),
    queryFn: () => listInternships(filters),
    staleTime: 1000 * 60,
    placeholderData: (previousData) => previousData ?? []
  });
};

export const useInternshipDetail = (id?: string) => {
  return useQuery<Internship, Error>({
    queryKey: ['internships', id],
    queryFn: () => getInternship(id as string),
    enabled: Boolean(id)
  });
};

export const useCreateInternship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InternshipCreateRequest) => createInternship(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
    }
  });
};

export const useUpdateInternship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: InternshipUpdateRequest }) =>
      updateInternship(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
      queryClient.invalidateQueries({ queryKey: ['internships', variables.id] });
    }
  });
};

export const useInternshipFilters = (internships: Internship[], search?: string) =>
  useMemo(() => {
    if (!search) {
      return internships;
    }
    const term = search.trim().toLowerCase();
    if (!term) {
      return internships;
    }
    return internships.filter((internship) => {
      const haystack = [
        internship.title,
        internship.description ?? '',
        internship.location ?? '',
        internship.skills?.join(' ') ?? ''
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [internships, search]);
