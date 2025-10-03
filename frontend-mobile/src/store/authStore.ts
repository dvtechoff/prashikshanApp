import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { API_URL } from '@/config/env';
import type { TokenResponse } from '@/types/api';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  setTokens: (tokens: TokenResponse) => void;
  signOut: () => void;
  refreshTokens: () => Promise<{ accessToken: string; refreshToken: string } | null>;
}

const initialState: Pick<AuthState, 'accessToken' | 'refreshToken' | 'expiresAt'> = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null
};

const computeExpiry = (expiresInSeconds: number): number => Date.now() + expiresInSeconds * 1000;

const authStoreCreator: StateCreator<AuthState> = (set, get) => ({
  ...initialState,
  setTokens: (tokens: TokenResponse) =>
    set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: computeExpiry(tokens.expires_in)
    }),
  signOut: () => set({ ...initialState }),
  refreshTokens: async () => {
    const refreshToken = get().refreshToken;
    if (!refreshToken) {
      return null;
    }

    const { data: tokens } = await axios.post<TokenResponse>(
      `${API_URL}/api/v1/auth/refresh`,
      {
        refresh_token: refreshToken
      }
    );
    set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: computeExpiry(tokens.expires_in)
    });
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    };
  }
});

export const useAuthStore = create<AuthState>()(
  persist(authStoreCreator, {
    name: 'prashikshan-auth',
    storage: createJSONStorage(() => AsyncStorage)
  })
);

export const authStore = {
  getState: useAuthStore.getState,
  setState: useAuthStore.setState,
  subscribe: useAuthStore.subscribe
};
