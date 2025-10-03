export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export type UserRole = 'STUDENT' | 'FACULTY' | 'INDUSTRY' | 'ADMIN';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  college_id: string | null;
  created_at: string;
}

export interface UserUpdateRequest {
  name?: string | null;
  college_id?: string | null;
}
