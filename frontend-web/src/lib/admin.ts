import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'FACULTY' | 'INDUSTRY' | 'ADMIN';
  phone?: string | null;
  university?: string | null;
  college_id?: string | null;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  profile?: {
    user_id: string;
    college?: string | null;
    enrollment_no?: string | null;
    course?: string | null;
    year?: string | null;
    designation?: string | null;
    department?: string | null;
    faculty_id?: string | null;
    skills?: any | null;
    resume_url?: string | null;
    verified: boolean;
  } | null;
  industry_profile?: {
    user_id: string;
    company_name: string;
    industry_type?: string | null;
    contact_person?: string | null;
    website?: string | null;
    verified: boolean;
  } | null;
}

export interface ListUsersParams {
  role?: 'STUDENT' | 'FACULTY' | 'INDUSTRY' | 'ADMIN';
  is_active?: boolean;
  skip?: number;
  limit?: number;
}

export const adminApi = {
  /**
   * List all users with optional filters
   */
  listUsers: async (params?: ListUsersParams) => {
    const { data } = await api.get<User[]>('/api/v1/admin/users', { params });
    return data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string) => {
    const { data } = await api.get<User>(`/api/v1/admin/users/${userId}`);
    return data;
  },

  /**
   * Activate a user account
   */
  activateUser: async (userId: string) => {
    const { data } = await api.patch<User>(`/api/v1/admin/users/${userId}/activate`);
    return data;
  },

  /**
   * Deactivate a user account
   */
  deactivateUser: async (userId: string) => {
    const { data } = await api.patch<User>(`/api/v1/admin/users/${userId}/deactivate`);
    return data;
  },

  /**
   * Permanently delete a user
   */
  deleteUser: async (userId: string) => {
    await api.delete(`/api/v1/admin/users/${userId}`);
  },
};
