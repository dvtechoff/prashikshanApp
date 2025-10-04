import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createLogbookEntry,
  getLogbookEntry,
  listLogbookEntries,
  updateLogbookEntry,
  type LogbookQueryParams
} from '@/api/logbook';
import type { LogbookEntry, LogbookEntryCreateRequest, LogbookEntryUpdateRequest } from '@/types/api';
import { useLogbookDraftStore } from '@/store/logbookDraftStore';

const listKey = (params?: LogbookQueryParams) => ['logbookEntries', params ?? {}];
const detailKey = (id?: string) => ['logbookEntries', id];

export const useLogbookEntryList = (params?: LogbookQueryParams) =>
  useQuery<LogbookEntry[], Error>({
    queryKey: listKey(params),
    queryFn: () => listLogbookEntries(params),
    staleTime: 1000 * 30
  });

export const useLogbookEntryDetail = (id?: string) =>
  useQuery<LogbookEntry, Error>({
    queryKey: detailKey(id),
    queryFn: () => getLogbookEntry(id as string),
    enabled: Boolean(id)
  });

export const useCreateLogbookEntry = () => {
  const queryClient = useQueryClient();
  const addDraft = useLogbookDraftStore((state) => state.addDraft);

  const mutation = useMutation({
    mutationFn: createLogbookEntry,
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: listKey() });
      queryClient.invalidateQueries({ queryKey: listKey({ application_id: entry.application_id }) });
      queryClient.invalidateQueries({ queryKey: detailKey(entry.id) });
    }
  });

  const submit = useCallback(
    async (payload: LogbookEntryCreateRequest) => {
      try {
        const entry = await mutation.mutateAsync(payload);
        return { status: 'synced' as const, entry };
      } catch (error) {
        const draft = addDraft({
          applicationId: payload.application_id,
          entryDate: payload.entry_date,
          hours: payload.hours,
          description: payload.description,
          attachments: payload.attachments ?? []
        });
        return { status: 'draft' as const, draft, error };
      }
    },
    [addDraft, mutation]
  );

  return {
    submit,
    ...mutation
  };
};

export const useLogbookDraftActions = () => {
  const {
    drafts,
    markSyncing,
    markSynced,
    markError,
    removeDraft
  } = useLogbookDraftStore((state) => ({
    drafts: state.drafts,
    markSyncing: state.markSyncing,
    markSynced: state.markSynced,
    markError: state.markError,
    removeDraft: state.removeDraft
  }));
  const queryClient = useQueryClient();

  const syncDraft = useCallback(
    async (id: string) => {
      const draft = drafts.find((item) => item.id === id);
      if (!draft) {
        return;
      }
      markSyncing(id);
      try {
        const entry = await createLogbookEntry({
          application_id: draft.applicationId,
          entry_date: draft.entryDate,
          hours: draft.hours,
          description: draft.description,
          attachments: draft.attachments
        });
        markSynced(id);
        queryClient.invalidateQueries({ queryKey: listKey() });
        queryClient.invalidateQueries({ queryKey: listKey({ application_id: draft.applicationId }) });
        queryClient.invalidateQueries({ queryKey: detailKey(entry.id) });
      } catch (error) {
        markError(id, error instanceof Error ? error.message : 'Failed to sync draft');
        throw error;
      }
    },
    [drafts, markError, markSynced, markSyncing, queryClient]
  );

  return {
    drafts,
    syncDraft,
    removeDraft
  };
};

export const useUpdateLogbookEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: LogbookEntryUpdateRequest }) =>
      updateLogbookEntry(id, payload),
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: listKey() });
      queryClient.invalidateQueries({ queryKey: listKey({ application_id: entry.application_id }) });
      queryClient.setQueryData(detailKey(entry.id), entry);
    }
  });
};
