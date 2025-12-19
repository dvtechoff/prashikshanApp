import { api } from './api';
import type {
  Internship,
  InternshipCreateRequest,
  InternshipFilters,
  InternshipUpdateRequest
} from './types';

export const listInternships = async (filters?: InternshipFilters): Promise<Internship[]> => {
  const params: Record<string, string | number | boolean | string[] | undefined> = filters
    ? {
        remote: filters.remote,
        min_credits: filters.minCredits,
        location: filters.location?.trim() || undefined,
        skills: filters.skills?.map((skill) => skill.trim()).filter((skill) => skill.length > 0),
        status: 'OPEN' // Only fetch OPEN internships
      }
    : {
        status: 'OPEN' // Default to OPEN if no filters provided
      };

  const sanitizedParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return true;
    })
  );

  const { data } = await api.get<Internship[]>('/api/v1/internships', {
    params: sanitizedParams
  });

  // Filter out CLOSED internships on client side as well (double protection)
  const openInternships = data.filter((internship: Internship) => internship.status !== 'CLOSED');

  if (filters?.search) {
    const term = filters.search.trim().toLowerCase();
    if (term.length > 0) {
      return openInternships.filter((internship: Internship) => {
        const haystack = [
          internship.title,
          internship.description,
          internship.location,
          internship.skills?.join(' ') ?? ''
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(term);
      });
    }
  }

  return openInternships;
};

export const getInternship = async (id: string): Promise<Internship> => {
  const { data } = await api.get<Internship>(`/api/v1/internships/${id}`);
  return data;
};

export const createInternship = async (
  payload: InternshipCreateRequest
): Promise<Internship> => {
  const { data } = await api.post<Internship>('/api/v1/internships', payload);
  return data;
};

export const updateInternship = async (
  id: string,
  payload: InternshipUpdateRequest
): Promise<Internship> => {
  const { data } = await api.patch<Internship>(`/api/v1/internships/${id}`, payload);
  return data;
};

export const deleteInternship = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/internships/${id}`);
};
