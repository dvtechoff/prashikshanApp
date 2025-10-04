import { useMemo, useState } from 'react';
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

type TabType = 'ACTIVE' | 'PAST';

const statusConfig = {
  APPLIED: { label: 'Applied', color: '#0369a1', background: '#e0f2fe', icon: '●' },
  PENDING: { label: 'Applied', color: '#0369a1', background: '#e0f2fe', icon: '●' },
  INTERVIEWING: { label: 'Interviewing', color: '#15803d', background: '#dcfce7', icon: '●' },
  APPROVED: { label: 'Accepted', color: '#15803d', background: '#dcfce7', icon: '●' },
  REJECTED: { label: 'Rejected', color: '#b91c1c', background: '#fee2e2', icon: '●' }
};

const getCompanyInitials = (title: string): string => {
  const words = title.split(' ').filter(w => w.length > 0);
  if (words.length === 0) return '??';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const getLogoBackground = (title: string): string => {
  const colors = ['#fef3c7', '#dbeafe', '#e0e7ff', '#fce7f3', '#d1fae5'];
  const index = title.length % colors.length;
  return colors[index];
};

const ApplicationCard = ({
  internshipTitle,
  appliedAt,
  status,
  onPress
}: {
  internshipTitle: string;
  appliedAt: string;
  status: string;
  onPress: () => void;
}) => {
  const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.APPLIED;
  const initials = getCompanyInitials(internshipTitle);
  const logoBackground = getLogoBackground(internshipTitle);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={[styles.logo, { backgroundColor: logoBackground }]}>
          <Text style={styles.logoText}>{initials}</Text>
        </View>
        
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{internshipTitle}</Text>
          <Text style={styles.cardMeta}>Applied on {new Date(appliedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusInfo.background }]}>
          <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default function ApplicationsScreen() {
  const { data: currentUser } = useCurrentUserQuery();
  const { data, isLoading, isRefetching, refetch } = useApplicationList();
  const { data: internships } = useInternshipList();
  const [activeTab, setActiveTab] = useState<TabType>('ACTIVE');

  const role = currentUser?.role ?? 'STUDENT';

  const internshipTitleMap = useMemo(() => {
    if (!internships) {
      return {} as Record<string, string>;
    }
    return internships.reduce((acc, item) => {
      acc[item.id] = item.title;
      return acc;
    }, {} as Record<string, string>);
  }, [internships]);

  // Determine overall status for student applications
  const getOverallStatus = (industryStatus: string, facultyStatus: string): string => {
    if (industryStatus === 'REJECTED' || facultyStatus === 'REJECTED') return 'REJECTED';
    if (industryStatus === 'APPROVED' && facultyStatus === 'APPROVED') return 'APPROVED';
    if (industryStatus === 'APPROVED' || facultyStatus === 'APPROVED') return 'INTERVIEWING';
    return 'APPLIED';
  };

  const filteredApplications = useMemo(() => {
    if (!data) {
      return [];
    }
    
    return data.filter((app) => {
      const overallStatus = getOverallStatus(app.industry_status, app.faculty_status);
      
      if (activeTab === 'ACTIVE') {
        return overallStatus !== 'REJECTED' && overallStatus !== 'APPROVED';
      } else {
        return overallStatus === 'REJECTED' || overallStatus === 'APPROVED';
      }
    });
  }, [data, activeTab]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading applications…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'ACTIVE' && styles.tabActive]}
          onPress={() => setActiveTab('ACTIVE')}
        >
          <Text style={[styles.tabText, activeTab === 'ACTIVE' && styles.tabTextActive]}>
            Active
          </Text>
          {activeTab === 'ACTIVE' && <View style={styles.tabIndicator} />}
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'PAST' && styles.tabActive]}
          onPress={() => setActiveTab('PAST')}
        >
          <Text style={[styles.tabText, activeTab === 'PAST' && styles.tabTextActive]}>
            Past
          </Text>
          {activeTab === 'PAST' && <View style={styles.tabIndicator} />}
        </Pressable>
      </View>

      {/* Applications List */}
      <FlatList
        data={filteredApplications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {activeTab === 'ACTIVE' ? 'No active applications' : 'No past applications'}
            </Text>
            <Text style={styles.emptyDescription}>
              {activeTab === 'ACTIVE'
                ? 'Apply to internships to see them here'
                : 'Completed applications will appear here'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#2563eb" />
        }
        renderItem={({ item }) => {
          const overallStatus = getOverallStatus(item.industry_status, item.faculty_status);
          return (
            <ApplicationCard
              internshipTitle={internshipTitleMap[item.internship_id] || 'Internship'}
              appliedAt={item.applied_at}
              status={overallStatus}
              onPress={() =>
                router.push({ pathname: '/(app)/applications/[id]', params: { id: item.id } } as never)
              }
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff'
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative'
  },
  tabActive: {
    // Active tab styling handled by indicator
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748b'
  },
  tabTextActive: {
    color: '#0f172a',
    fontWeight: '600'
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#2563eb'
  },
  list: {
    padding: 16,
    gap: 12
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a'
  },
  cardInfo: {
    flex: 1,
    gap: 4
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a'
  },
  cardMeta: {
    fontSize: 13,
    color: '#64748b'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    gap: 4
  },
  statusIcon: {
    fontSize: 8,
    lineHeight: 8
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
    color: '#475569',
    fontSize: 15
  },
  emptyState: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 80,
    paddingHorizontal: 20
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  emptyDescription: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center'
  }
});
