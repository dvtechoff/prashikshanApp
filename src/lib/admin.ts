import api from './api';

export interface User {
  id: number;
  email: string;
  role: 'STUDENT' | 'FACULTY' | 'INDUSTRY' | 'ADMIN';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile?: {
    name: string;
    phone: string | null;
  } | null;
  industry_profile?: {
    company_name: string;
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
    const { data } = await api.get<User[]>('/admin/users', { params });
    return data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: number) => {
    const { data } = await api.get<User>(`/admin/users/${userId}`);
    return data;
  },

  /**
   * Activate a user account
   */
  activateUser: async (userId: number) => {
    const { data } = await api.patch<User>(`/admin/users/${userId}/activate`);
    return data;
  },

  /**
   * Deactivate a user account
   */
  deactivateUser: async (userId: number) => {
    const { data } = await api.patch<User>(`/admin/users/${userId}/deactivate`);
    return data;
  },

  /**
   * Permanently delete a user
   */
  deleteUser: async (userId: number) => {
    await api.delete(`/admin/users/${userId}`);
  },
};
