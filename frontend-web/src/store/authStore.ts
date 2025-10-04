import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse, TokenResponse } from '@/lib/types';

interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  setUser: (user: UserResponse | null) => void;
  setTokens: (tokens: TokenResponse) => void;
  logout: () => void;
}

const computeExpiry = (expiresInSeconds: number): number => Date.now() + expiresInSeconds * 1000;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user && !!get().accessToken 
      }),
      
      setTokens: (tokens: TokenResponse) => {
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: computeExpiry(tokens.expires_in),
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ 
          user: null, 
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false 
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
