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
  View,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useApplicationList } from '@/hooks/useApplications';
import { useCurrentUserQuery } from '@/hooks/useCurrentUser';
import { useInternshipList } from '@/hooks/useInternships';
import type { ApplicationSummary } from '@/types/api';

type TabType = 'ACTIVE' | 'PAST';
type StatusFilterType = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED';

const statusConfig = {
  APPLIED: { label: 'Applied', color: '#0369a1', background: '#e0f2fe', icon: '●' },
  PENDING: { label: 'Pending', color: '#d97706', background: '#fef3c7', icon: '●' },
  INTERVIEWING: { label: 'Interviewing', color: '#15803d', background: '#dcfce7', icon: '●' },
  APPROVED: { label: 'Approved', color: '#15803d', background: '#dcfce7', icon: '●' },
  REJECTED: { label: 'Rejected', color: '#b91c1c', background: '#fee2e2', icon: '●' }
};

const getStudentInitials = (name: string): string => {
  const words = name.split(' ').filter(w => w.length > 0);
  if (words.length === 0) return '??';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const getCompanyInitials = (title: string): string => {
  const words = title.split(' ').filter(w => w.length > 0);
  if (words.length === 0) return '??';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const getAvatarBackground = (name: string): string => {
  const colors = ['#fef3c7', '#dbeafe', '#e0e7ff', '#fce7f3', '#d1fae5', '#fed7aa'];
  const index = name.length % colors.length;
  return colors[index];
};

// Faculty Application Card - shows student info
const FacultyApplicationCard = ({
  studentName,
  internshipTitle,
  companyName,
  appliedAt,
  status,
  industryStatus,
  onPress
}: {
  studentName: string;
  internshipTitle: string;
  companyName: string;
  appliedAt: string;
  status: string;
  industryStatus: string;
  onPress: () => void;
}) => {
  const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  const initials = getStudentInitials(studentName);
  const avatarBackground = getAvatarBackground(studentName);

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        {/* Student Avatar */}
        <View style={[styles.avatar, { backgroundColor: avatarBackground }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.cardInfo}>
          {/* Student Name */}
          <Text style={styles.studentName} numberOfLines={1}>{studentName}</Text>
          {/* Internship Title */}
          <Text style={styles.internshipTitle} numberOfLines={1}>{internshipTitle}</Text>
          {/* Company Name */}
          <Text style={styles.companyName} numberOfLines={1}>{companyName}</Text>
          {/* Applied Date */}
          <Text style={styles.appliedDate}>
            Applied: {new Date(appliedAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
          </Text>
          {/* Industry Status Indicator (small) */}
          {industryStatus !== 'PENDING' && (
            <Text style={styles.industryStatusHint}>
              Industry: {industryStatus === 'APPROVED' ? '✓ Approved' : industryStatus === 'REJECTED' ? '✗ Rejected' : 'Pending'}
            </Text>
          )}
        </View>

        {/* Status Badge - Faculty Status */}
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.background }]}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>
      </View>

      {/* View Details Button */}
      <Pressable style={styles.viewDetailsButton} onPress={onPress}>
        <Text style={styles.viewDetailsText}>View Details</Text>
        <Ionicons name="arrow-forward" size={16} color="#2563eb" />
      </Pressable>
    </View>
  );
};

// Student Application Card - shows internship info
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
  const logoBackground = getAvatarBackground(internshipTitle);

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');

  const role = currentUser?.role ?? 'STUDENT';
  const isFaculty = role === 'FACULTY';

  const internshipTitleMap = useMemo(() => {
    if (!internships) {
      return {} as Record<string, string>;
    }
    return internships.reduce((acc, item) => {
      acc[item.id] = item.title;
      return acc;
    }, {} as Record<string, string>);
  }, [internships]);

  // Determine overall status for applications
  const getOverallStatus = (industryStatus: string, facultyStatus: string, viewRole: string): string => {
    // Faculty view: show faculty_status directly
    if (viewRole === 'FACULTY') {
      // Return the actual faculty status
      return facultyStatus; // PENDING, APPROVED, or REJECTED
    }
    
    // Student/Industry view: combined status for overall progress
    if (industryStatus === 'REJECTED' || facultyStatus === 'REJECTED') return 'REJECTED';
    if (industryStatus === 'APPROVED' && facultyStatus === 'APPROVED') return 'APPROVED';
    if (industryStatus === 'APPROVED' || facultyStatus === 'APPROVED') return 'INTERVIEWING';
    return 'PENDING';
  };

  const filteredApplications = useMemo(() => {
    if (!data) {
      return [];
    }
    
    let filtered = data.filter((app) => {
      const overallStatus = getOverallStatus(app.industry_status, app.faculty_status, role);
      
      // Tab filtering (only for students)
      if (!isFaculty && activeTab === 'ACTIVE') {
        return overallStatus !== 'REJECTED' && overallStatus !== 'APPROVED';
      } else if (!isFaculty && activeTab === 'PAST') {
        return overallStatus === 'REJECTED' || overallStatus === 'APPROVED';
      }
      
      // Faculty sees all applications (no tab filtering)
      return true;
    });

    // Search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((app) => {
        const internshipTitle = internshipTitleMap[app.internship_id]?.toLowerCase() || '';
        // For faculty, would also search student names here
        return internshipTitle.includes(query);
      });
    }

    // Status filtering
    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => {
        const overallStatus = getOverallStatus(app.industry_status, app.faculty_status, role);
        return overallStatus.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    return filtered;
  }, [data, activeTab, searchQuery, statusFilter, internshipTitleMap, role, isFaculty]);

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
      {/* Faculty: Header with title and notification icon */}
      {isFaculty && (
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </Pressable>
          <Text style={styles.headerTitle}>Internship Applications</Text>
          <View style={{ width: 40 }} />
        </View>
      )}

      {/* Faculty: Search Bar */}
      {isFaculty && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search applications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
        </View>
      )}

      {/* Faculty: Filter Chips */}
      {isFaculty && (
        <View style={styles.filterContainer}>
          <Pressable
            style={[styles.filterChip, statusFilter === 'all' && styles.filterChipActive]}
            onPress={() => setStatusFilter('all')}
          >
            <Text style={[styles.filterChipText, statusFilter === 'all' && styles.filterChipTextActive]}>
              All
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterChip, statusFilter === 'PENDING' && styles.filterChipActive]}
            onPress={() => setStatusFilter('PENDING')}
          >
            <Text style={[styles.filterChipText, statusFilter === 'PENDING' && styles.filterChipTextActive]}>
              Pending
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterChip, statusFilter === 'APPROVED' && styles.filterChipActive]}
            onPress={() => setStatusFilter('APPROVED')}
          >
            <Text style={[styles.filterChipText, statusFilter === 'APPROVED' && styles.filterChipTextActive]}>
              Approved
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterChip, statusFilter === 'REJECTED' && styles.filterChipActive]}
            onPress={() => setStatusFilter('REJECTED')}
          >
            <Text style={[styles.filterChipText, statusFilter === 'REJECTED' && styles.filterChipTextActive]}>
              Rejected
            </Text>
          </Pressable>
        </View>
      )}

      {/* Student: Tabs */}
      {!isFaculty && (
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
      )}

      {/* Applications List */}
      <FlatList
        data={filteredApplications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {isFaculty 
                ? 'No applications found'
                : (activeTab === 'ACTIVE' ? 'No active applications' : 'No past applications')}
            </Text>
            <Text style={styles.emptyDescription}>
              {isFaculty
                ? 'Applications will appear here when students apply'
                : (activeTab === 'ACTIVE'
                  ? 'Apply to internships to see them here'
                  : 'Completed applications will appear here')}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#2563eb" />
        }
        renderItem={({ item }) => {
          const overallStatus = getOverallStatus(item.industry_status, item.faculty_status, role);
          
          if (isFaculty) {
            // Faculty view - show student cards (mock data for now, need student names from backend)
            return (
              <FacultyApplicationCard
                studentName={`Student ${item.student_id.substring(0, 6)}`}
                internshipTitle={internshipTitleMap[item.internship_id] || 'Internship'}
                companyName="Tech Solutions Inc"
                appliedAt={item.applied_at}
                status={overallStatus}
                industryStatus={item.industry_status}
                onPress={() =>
                  router.push({ pathname: '/(app)/applications/[id]', params: { id: item.id } } as never)
                }
              />
            );
          } else {
            // Student view - show internship cards
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
          }
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
  },
  // Faculty-specific styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a'
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b'
  },
  filterChipTextActive: {
    color: '#ffffff'
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a'
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a'
  },
  internshipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 2
  },
  companyName: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2
  },
  appliedDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2
  },
  industryStatusHint: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    fontStyle: 'italic'
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: '#dbeafe',
    borderRadius: 999
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb'
  }
});
