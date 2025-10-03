import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { useLogbookDraftActions, useLogbookEntryList } from '@/hooks/useLogbookEntries';
import { useCurrentUserQuery } from '@/hooks/useCurrentUser';

const formatDate = (date: string) => new Date(date).toLocaleDateString();

export default function LogbookScreen() {
  const { data: currentUser } = useCurrentUserQuery();
  const { data, isLoading, isRefetching, refetch } = useLogbookEntryList();
  const { drafts, syncDraft, removeDraft } = useLogbookDraftActions();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterApproval, setFilterApproval] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');

  const role = currentUser?.role ?? 'STUDENT';
  const isFaculty = role === 'FACULTY';
  const isStudent = role === 'STUDENT';
  const isIndustry = role === 'INDUSTRY';

  const pendingFacultyApprovals = useMemo(() => {
    if (!data) {
      return 0;
    }
    return data.filter((entry) => !entry.approved).length;
  }, [data]);

  const handleCreate = () => {
    router.push('/(app)/logbook/new' as never);
  };

  const combinedList = useMemo(() => {
    const entries = data ?? [];
    const mappedDrafts = drafts.map((draft) => ({
      type: 'DRAFT' as const,
      id: draft.id,
      entryDate: draft.entryDate,
      hours: draft.hours,
      description: draft.description,
      status: draft.status,
      applicationId: draft.applicationId,
      lastError: draft.lastError ?? undefined
    }));
    const mappedEntries = entries.map((entry) => ({
      type: 'SYNCED' as const,
      id: entry.id,
      entryDate: entry.entry_date,
      hours: entry.hours,
      description: entry.description,
      approved: entry.approved,
      applicationId: entry.application_id
    }));

    let combined = [...mappedDrafts, ...mappedEntries];

    // Faculty filtering
    if (isFaculty) {
      if (filterApproval !== 'ALL') {
        combined = combined.filter((item) => {
          if (item.type === 'DRAFT') {
            return false;
          }
          return item.approved === (filterApproval === 'APPROVED');
        });
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        combined = combined.filter((item) =>
          item.description.toLowerCase().includes(query)
        );
      }
    }

    return combined.sort((a, b) =>
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    );
  }, [data, drafts, filterApproval, isFaculty, searchQuery]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isFaculty ? 'Student logbooks' : 'Your logbook entries'}
        </Text>
        <Text style={styles.subtitle}>
          {isFaculty
            ? pendingFacultyApprovals
              ? `${pendingFacultyApprovals} entry${pendingFacultyApprovals > 1 ? 'ies' : ''} awaiting approval.`
              : 'Everything reviewed. Great job!'
            : isIndustry
            ? 'Monitor intern submissions and coordinate with faculty for approvals.'
            : 'Capture your weekly internship progress and hours.'}
        </Text>
      </View>

      {isStudent && (
        <Pressable style={styles.primaryButton} onPress={handleCreate}>
          <Text style={styles.primaryButtonText}>New logbook entry</Text>
        </Pressable>
      )}

      {isStudent && drafts.length > 0 && (
        <View style={styles.draftBanner}>
          <Text style={styles.draftTitle}>Offline drafts</Text>
          <Text style={styles.draftBody}>
            {drafts.length} draft{drafts.length > 1 ? 's are' : ' is'} waiting to sync.
          </Text>
        </View>
      )}

      {isFaculty && (
        <View style={styles.filterSection}>
          <TextInput
            placeholder="Search logbook descriptions"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          <View style={styles.filterRow}>
            {(['ALL', 'PENDING', 'APPROVED'] as const).map((status) => (
              <Pressable
                key={status}
                style={[styles.filterChip, filterApproval === status && styles.filterChipActive]}
                onPress={() => setFilterApproval(status)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterApproval === status && styles.filterChipTextActive
                  ]}
                >
                  {status}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Fetching entries…</Text>
        </View>
      ) : (
        <FlatList
          data={combinedList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#2563eb" />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No logbook entries yet</Text>
              <Text style={styles.emptyDescription}>
                {isFaculty
                  ? 'Students will appear here when they submit entries for review.'
                  : 'Create your first entry to track internship progress.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            if (item.type === 'DRAFT') {
              return (
                <View style={[styles.card, styles.draftCard]}>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardTitle}>Draft — {formatDate(item.entryDate)}</Text>
                    <Text style={styles.draftStatus}>{item.status.toUpperCase()}</Text>
                  </View>
                  <Text numberOfLines={3} style={styles.cardDescription}>
                    {item.description}
                  </Text>
                  {item.lastError && <Text style={styles.errorText}>{item.lastError}</Text>}
                  <View style={styles.cardActions}>
                    <Pressable style={styles.secondaryButton} onPress={() => removeDraft(item.id)}>
                      <Text style={styles.secondaryButtonText}>Delete</Text>
                    </Pressable>
                    <Pressable style={styles.primaryButtonSmall} onPress={() => syncDraft(item.id)}>
                      <Text style={styles.primaryButtonText}>Sync now</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }

            return (
              <Pressable
                style={styles.card}
                onPress={() =>
                  router.push({ pathname: '/(app)/logbook/[id]', params: { id: item.id } } as never)
                }
              >
                <View style={styles.cardRow}>
                  <Text style={styles.cardTitle}>{formatDate(item.entryDate)}</Text>
                  <Text style={[styles.statusBadge, item.approved ? styles.statusApproved : styles.statusPending]}>
                    {item.approved ? 'Approved' : 'Pending'}
                  </Text>
                </View>
                <Text numberOfLines={2} style={styles.cardDescription}>
                  {item.description}
                </Text>
                <Text style={styles.hoursText}>{item.hours} hour{item.hours !== 1 ? 's' : ''}</Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    padding: 20,
    gap: 6
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    color: '#475569'
  },
  primaryButton: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600'
  },
  draftBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    padding: 16,
    gap: 4
  },
  draftTitle: {
    fontWeight: '700',
    color: '#5b21b6'
  },
  draftBody: {
    color: '#6b7280'
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    gap: 10,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  draftCard: {
    borderWidth: 1,
    borderColor: '#c4b5fd'
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a'
  },
  cardDescription: {
    color: '#475569'
  },
  hoursText: {
    color: '#334155',
    fontWeight: '600'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '700'
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#b45309'
  },
  statusApproved: {
    backgroundColor: '#dcfce7',
    color: '#15803d'
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#94a3b8'
  },
  secondaryButtonText: {
    color: '#1e293b',
    fontWeight: '600'
  },
  primaryButtonSmall: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10
  },
  draftStatus: {
    color: '#6b21a8',
    fontWeight: '700'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12
  },
  loadingText: {
    color: '#475569'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 12
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  emptyDescription: {
    color: '#64748b',
    textAlign: 'center'
  },
  errorText: {
    color: '#dc2626'
  },
  filterSection: {
    padding: 16,
    gap: 12,
  },
  searchInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  }
});
