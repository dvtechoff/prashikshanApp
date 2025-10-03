import { useMemo } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { useApplicationList } from '@/hooks/useApplications';
import { useCurrentUserQuery } from '@/hooks/useCurrentUser';
import { useInternshipList } from '@/hooks/useInternships';

const statusColor = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return { background: '#dcfce7', text: '#15803d' };
    case 'REJECTED':
      return { background: '#fee2e2', text: '#b91c1c' };
    default:
      return { background: '#e0f2fe', text: '#0369a1' };
  }
};

const ApplicationCard = ({
  internshipTitle,
  appliedAt,
  industryStatus,
  facultyStatus,
  onPress
}: {
  internshipTitle?: string;
  appliedAt: string;
  industryStatus: string;
  facultyStatus: string;
  onPress: () => void;
}) => {
  const industryPalette = statusColor(industryStatus);
  const facultyPalette = statusColor(facultyStatus);
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{internshipTitle ?? 'Internship application'}</Text>
      <Text style={styles.cardMeta}>Applied on {new Date(appliedAt).toLocaleDateString()}</Text>
      <View style={styles.badgeRow}>
        <View style={[styles.statusBadge, { backgroundColor: industryPalette.background }]}>
          <Text style={[styles.statusText, { color: industryPalette.text }]}>Industry: {industryStatus}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: facultyPalette.background }]}>
          <Text style={[styles.statusText, { color: facultyPalette.text }]}>Faculty: {facultyStatus}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default function ApplicationsScreen() {
  const { data: currentUser } = useCurrentUserQuery();
  const { data, isLoading, isRefetching, refetch } = useApplicationList();
  const { data: internships } = useInternshipList();

  const role = currentUser?.role ?? 'STUDENT';

  const pendingCount = useMemo(() => {
    if (!data) {
      return 0;
    }
    return data.filter((item) => item.industry_status === 'PENDING' || item.faculty_status === 'PENDING').length;
  }, [data]);

  const internshipTitleMap = useMemo(() => {
    if (!internships) {
      return {} as Record<string, string>;
    }
    return internships.reduce((acc, item) => {
      acc[item.id] = item.title;
      return acc;
    }, {} as Record<string, string>);
  }, [internships]);

  const headerText = useMemo(() => {
    switch (role) {
      case 'FACULTY':
        return {
          title: 'Student applications awaiting review',
          subtitle: pendingCount
            ? `${pendingCount} application${pendingCount > 1 ? 's' : ''} need your review.`
            : 'All caught up! No applications pending.'
        };
      case 'INDUSTRY':
        return {
          title: 'Applications for your internships',
          subtitle: pendingCount
            ? `You have ${pendingCount} applicants to review.`
            : 'No applications awaiting decision.'
        };
      default:
        return {
          title: 'Your internship applications',
          subtitle: pendingCount
            ? `${pendingCount} application${pendingCount > 1 ? 's are' : ' is'} still under review.`
            : 'Stay tuned for updates from faculty and industry mentors.'
        };
    }
  }, [pendingCount, role]);

  const handleCreate = () => {
    router.push('/(app)/applications/new' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{headerText.title}</Text>
        <Text style={styles.subtitle}>{headerText.subtitle}</Text>
      </View>

      {role === 'STUDENT' && (
        <Pressable style={styles.primaryButton} onPress={handleCreate}>
          <Text style={styles.primaryButtonText}>Apply to a new internship</Text>
        </Pressable>
      )}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading applications…</Text>
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No applications yet</Text>
              <Text style={styles.emptyDescription}>
                {role === 'STUDENT'
                  ? 'Browse internships and submit your first application.'
                  : 'Invite students to apply or check back later.'}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#2563eb" />
          }
          renderItem={({ item }) => (
            <ApplicationCard
              internshipTitle={internshipTitleMap[item.internship_id]}
              appliedAt={item.applied_at}
              industryStatus={item.industry_status}
              facultyStatus={item.faculty_status}
              onPress={() =>
                router.push({ pathname: '/(app)/applications/[id]', params: { id: item.id } } as never)
              }
            />
          )}
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
    gap: 4
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: 15,
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
    fontSize: 15,
    fontWeight: '600'
  },
  list: {
    padding: 20,
    gap: 16
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  cardMeta: {
    color: '#64748b'
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10
  },
  statusBadge: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600'
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
    gap: 10,
    paddingVertical: 60,
    paddingHorizontal: 20
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  emptyDescription: {
    color: '#64748b',
    textAlign: 'center'
  }
});
