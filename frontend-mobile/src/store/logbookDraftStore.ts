import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LogbookAttachment } from '@/types/api';

export type DraftSyncStatus = 'pending' | 'syncing' | 'error';

export interface LogbookDraft {
  id: string;
  applicationId: string;
  entryDate: string;
  hours: number;
  description: string;
  attachments: LogbookAttachment[];
  createdAt: string;
  status: DraftSyncStatus;
  lastError?: string | null;
}

interface LogbookDraftState {
  drafts: LogbookDraft[];
  addDraft: (draft: Omit<LogbookDraft, 'id' | 'status' | 'createdAt' | 'lastError'>) => LogbookDraft;
  removeDraft: (id: string) => void;
  markSyncing: (id: string) => void;
  markError: (id: string, message: string) => void;
  markSynced: (id: string) => void;
  reset: () => void;
}

const createDraft = (
  input: Omit<LogbookDraft, 'id' | 'status' | 'createdAt' | 'lastError'>
): LogbookDraft => {
  const { attachments = [], ...rest } = input;
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
    attachments,
    ...rest
  };
};

export const useLogbookDraftStore = create<LogbookDraftState>()(
  persist(
    (set) => ({
      drafts: [],
      addDraft: (input) => {
        const draft = createDraft(input);
        set((state) => ({ drafts: [...state.drafts, draft] }));
        return draft;
      },
      removeDraft: (id) => set((state) => ({ drafts: state.drafts.filter((draft) => draft.id !== id) })),
      markSyncing: (id) =>
        set((state) => ({
          drafts: state.drafts.map((draft) =>
            draft.id === id ? { ...draft, status: 'syncing', lastError: null } : draft
          )
        })),
      markError: (id, message) =>
        set((state) => ({
          drafts: state.drafts.map((draft) =>
            draft.id === id ? { ...draft, status: 'error', lastError: message } : draft
          )
        })),
      markSynced: (id) =>
        set((state) => ({ drafts: state.drafts.filter((draft) => draft.id !== id) })),
      reset: () => set({ drafts: [] })
    }),
    {
      name: 'prashikshan-logbook-drafts',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
