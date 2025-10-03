import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { login, register } from '@/api/auth';
import type { LoginRequest, RegisterRequest, TokenResponse } from '@/types/api';
import { useAuthStore, type AuthState } from '@/store/authStore';
import { useLogbookDraftStore } from '@/store/logbookDraftStore';

export const useAuthStatus = () => {
  const state = useAuthStore((store: AuthState) => ({
    accessToken: store.accessToken,
    expiresAt: store.expiresAt
  }));

  return useMemo(() => {
    if (!state.accessToken || !state.expiresAt) {
      return { isAuthenticated: false, expiresAt: null } as const;
    }

    const isExpired = state.expiresAt <= Date.now();
    return { isAuthenticated: !isExpired, expiresAt: state.expiresAt } as const;
  }, [state.accessToken, state.expiresAt]);
};

export const useLoginMutation = () => {
  const setTokens = useAuthStore((store: AuthState) => store.setTokens);

  return useMutation<TokenResponse, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: (tokens: TokenResponse) => {
      setTokens(tokens);
    }
  });
};

export const useRegisterMutation = () => {
  const setTokens = useAuthStore((store: AuthState) => store.setTokens);

  return useMutation<TokenResponse, Error, RegisterRequest>({
    mutationFn: async (payload) => {
      await register(payload);
      return login({ email: payload.email, password: payload.password });
    },
    onSuccess: (tokens: TokenResponse) => {
      setTokens(tokens);
    }
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  const signOutStore = useAuthStore((store: AuthState) => store.signOut);

  return useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    useLogbookDraftStore.getState().reset();
    signOutStore();
  }, [queryClient, signOutStore]);
};
