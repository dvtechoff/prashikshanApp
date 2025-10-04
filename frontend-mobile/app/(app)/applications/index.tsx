import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useApplicationList, useUpdateApplication } from '@/hooks/useApplications';
import { useCurrentUserQuery } from '@/hooks/useCurrentUser';
import { useInternshipList } from '@/hooks/useInternships';
import type { ApplicationSummary } from '@/types/api';
import { getErrorMessage } from '@/utils/error';

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

// Faculty/Industry Application Card - shows student info
const FacultyApplicationCard = ({
  studentName,
  internshipTitle,
  companyName,
  appliedAt,
  status,
  industryStatus,
  secondaryLabel = 'Industry',
  onPress
}: {
  studentName: string;
  internshipTitle: string;
  companyName: string;
  appliedAt: string;
  status: string;
  industryStatus: string;
  secondaryLabel?: string;
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
          {/* Secondary Status Indicator (small) - Shows Industry status for Faculty, Faculty status for Industry */}
          {industryStatus !== 'PENDING' && (
            <Text style={styles.industryStatusHint}>
              {secondaryLabel}: {industryStatus === 'APPROVED' ? '✓ Approved' : industryStatus === 'REJECTED' ? '✗ Rejected' : 'Pending'}
            </Text>
          )}
        </View>

        {/* Status Badge - Primary Status (Faculty/Industry depending on role) */}
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

// Industry Application Card - shows student info with inline approve/reject buttons
const IndustryApplicationCard = ({
  studentName,
  major,
  status,
  applicationId,
  onApprove,
  onReject,
  onPress
}: {
  studentName: string;
  major: string;
  status: string;
  applicationId: string;
  onApprove: () => void;
  onReject: () => void;
  onPress: () => void;
}) => {
  const initials = getStudentInitials(studentName);
  const avatarBackground = getAvatarBackground(studentName);
  const isPending = status === 'PENDING';

  return (
    <Pressable style={styles.industryCard} onPress={onPress}>
      <View style={styles.industryCardContent}>
        {/* Student Avatar */}
        <View style={[styles.industryAvatar, { backgroundColor: avatarBackground }]}>
          <Text style={styles.industryAvatarText}>{initials}</Text>
        </View>

        <View style={styles.industryCardInfo}>
          {/* Student Name */}
          <Text style={styles.industryStudentName} numberOfLines={1}>{studentName}</Text>
          {/* Major/Department */}
          <Text style={styles.industryMajor} numberOfLines={1}>{major}</Text>
        </View>

        {/* Action Buttons */}
        {isPending ? (
          <View style={styles.industryActions}>
            <Pressable 
              style={styles.rejectButtonSmall} 
              onPress={(e) => {
                e.stopPropagation();
                onReject();
              }}
            >
              <Ionicons name="close" size={20} color="#dc2626" />
            </Pressable>
            <Pressable 
              style={styles.approveButtonSmall}
              onPress={(e) => {
                e.stopPropagation();
                onApprove();
              }}
            >
              <Ionicons name="checkmark" size={20} color="#16a34a" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.industryStatusIcon}>
            {status === 'APPROVED' ? (
              <Ionicons name="checkmark-circle" size={28} color="#16a34a" />
            ) : (
              <Ionicons name="close-circle" size={28} color="#dc2626" />
            )}
          </View>
        )}
      </View>
    </Pressable>
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
  const { internshipId, internshipTitle } = useLocalSearchParams<{ internshipId?: string; internshipTitle?: string }>();
  const { data: currentUser } = useCurrentUserQuery();
  const { data, isLoading, isRefetching, refetch } = useApplicationList();
  const { data: internships } = useInternshipList();
  const updateMutation = useUpdateApplication();
  const [activeTab, setActiveTab] = useState<TabType>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');

  const role = currentUser?.role ?? 'STUDENT';
  const isFaculty = role === 'FACULTY';
  const isIndustry = role === 'INDUSTRY';
  const isApprover = isFaculty || isIndustry; // Both faculty and industry can approve/reject

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
    // REJECTION TAKES PRIORITY: If either party rejects, show REJECTED for everyone
    if (industryStatus === 'REJECTED' || facultyStatus === 'REJECTED') {
      return 'REJECTED';
    }
    
    // Faculty view: show faculty_status directly (unless rejected above)
    if (viewRole === 'FACULTY') {
      return facultyStatus; // PENDING or APPROVED
    }
    
    // Industry view: show industry_status directly (unless rejected above)
    if (viewRole === 'INDUSTRY') {
      return industryStatus; // PENDING or APPROVED
    }
    
    // Student view: combined status for overall progress
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
      
      // INDUSTRY: Only show applications that have been APPROVED by faculty
      if (isIndustry) {
        const facultyApproved = app.faculty_status === 'APPROVED';
        const industryRejected = app.industry_status === 'REJECTED';
        if (!facultyApproved && !industryRejected) {
          return false;
        }
      }
      
      // Filter by specific internship if provided
      if (internshipId && app.internship_id !== internshipId) {
        return false;
      }
      
      // Tab filtering (only for students)
      if (!isApprover && activeTab === 'ACTIVE') {
        return overallStatus !== 'REJECTED' && overallStatus !== 'APPROVED';
      } else if (!isApprover && activeTab === 'PAST') {
        return overallStatus === 'REJECTED' || overallStatus === 'APPROVED';
      }
      
      // Faculty/Industry sees all applications (no tab filtering)
      return true;
    });

    // Search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((app) => {
        const internshipTitle = internshipTitleMap[app.internship_id]?.toLowerCase() || '';
        // For faculty/industry, would also search student names here
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
  }, [data, activeTab, searchQuery, statusFilter, internshipTitleMap, role, isApprover, internshipId, isIndustry]);

  // Grouped applications for Industry (Shortlisted, Approved, and Rejected sections)
  const groupedApplications = useMemo(() => {
    if (!isIndustry) return null;
    
    const shortlisted = filteredApplications.filter(app => app.industry_status === 'PENDING');
    const approved = filteredApplications.filter(app => app.industry_status === 'APPROVED');
    const rejected = filteredApplications.filter(app => app.industry_status === 'REJECTED');
    
    return { shortlisted, approved, rejected };
  }, [filteredApplications, isIndustry]);

  // Handler functions for Industry approve/reject
  const handleApprove = async (applicationId: string) => {
    try {
      await updateMutation.mutateAsync({
        id: applicationId,
        payload: { industry_status: 'APPROVED' }
      });
      refetch();
    } catch (err) {
      Alert.alert('Update failed', getErrorMessage(err));
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      await updateMutation.mutateAsync({
        id: applicationId,
        payload: { industry_status: 'REJECTED' }
      });
      refetch();
    } catch (err) {
      Alert.alert('Update failed', getErrorMessage(err));
    }
  };

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
      {/* Faculty/Industry: Header with title and notification icon */}
      {isApprover && (
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {isFaculty ? 'Internship Applications' : 'Student Applications'}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      )}

      {/* Internship Filter Indicator */}
      {internshipId && internshipTitle && (
        <View style={styles.filterIndicator}>
          <View style={styles.filterIndicatorContent}>
            <Ionicons name="funnel" size={16} color="#2563eb" />
            <Text style={styles.filterIndicatorText}>
              Showing applications for: <Text style={styles.filterIndicatorBold}>{internshipTitle}</Text>
            </Text>
          </View>
          <Pressable
            style={styles.clearFilterButton}
            onPress={() => router.push('/(app)/applications')}
          >
            <Ionicons name="close-circle" size={20} color="#64748b" />
          </Pressable>
        </View>
      )}

      {/* Faculty/Industry: Search Bar */}
      {isApprover && (
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

      {/* Faculty/Industry: Filter Chips */}
      {isApprover && (
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
      {!isApprover && (
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
      {isIndustry ? (
        /* Industry: Grouped sections with ScrollView */
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#2563eb" />
          }
        >
          {/* Shortlisted Students Section */}
          {groupedApplications && groupedApplications.shortlisted.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeaderText}>Shortlisted Students</Text>
              {groupedApplications.shortlisted.map((item) => (
                <IndustryApplicationCard
                  key={item.id}
                  studentName={item.student?.name || `Student ${item.student_id.substring(0, 6)}`}
                  major={item.internship?.title || internshipTitleMap[item.internship_id] || 'Internship'}
                  status={item.industry_status}
                  applicationId={item.id}
                  onApprove={() => handleApprove(item.id)}
                  onReject={() => handleReject(item.id)}
                  onPress={() =>
                    router.push({ pathname: '/(app)/applications/[id]', params: { id: item.id } } as never)
                  }
                />
              ))}
            </View>
          )}

          {/* Approved Students Section */}
          {groupedApplications && groupedApplications.approved.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeaderText}>Approved Students</Text>
              {groupedApplications.approved.map((item) => (
                <IndustryApplicationCard
                  key={item.id}
                  studentName={item.student?.name || `Student ${item.student_id.substring(0, 6)}`}
                  major={item.internship?.title || internshipTitleMap[item.internship_id] || 'Internship'}
                  status={item.industry_status}
                  applicationId={item.id}
                  onApprove={() => handleApprove(item.id)}
                  onReject={() => handleReject(item.id)}
                  onPress={() =>
                    router.push({ pathname: '/(app)/applications/[id]', params: { id: item.id } } as never)
                  }
                />
              ))}
            </View>
          )}

          {/* Rejected Students Section */}
          {groupedApplications && groupedApplications.rejected.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeaderText}>Rejected Students</Text>
              {groupedApplications.rejected.map((item) => (
                <IndustryApplicationCard
                  key={item.id}
                  studentName={item.student?.name || `Student ${item.student_id.substring(0, 6)}`}
                  major={item.internship?.title || internshipTitleMap[item.internship_id] || 'Internship'}
                  status={item.industry_status}
                  applicationId={item.id}
                  onApprove={() => handleApprove(item.id)}
                  onReject={() => handleReject(item.id)}
                  onPress={() =>
                    router.push({ pathname: '/(app)/applications/[id]', params: { id: item.id } } as never)
                  }
                />
              ))}
            </View>
          )}

          {/* Empty State */}
          {(!groupedApplications || 
            (groupedApplications.shortlisted.length === 0 && 
             groupedApplications.approved.length === 0 && 
             groupedApplications.rejected.length === 0)) && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No applications found</Text>
              <Text style={styles.emptyDescription}>Applications will appear here when students apply</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        /* Faculty/Student: FlatList */
        <FlatList
          data={filteredApplications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {isApprover 
                  ? 'No applications found'
                  : (activeTab === 'ACTIVE' ? 'No active applications' : 'No past applications')}
              </Text>
              <Text style={styles.emptyDescription}>
                {isApprover
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
              // Faculty view - show detailed student cards
              const secondaryStatus = item.industry_status;
              const secondaryLabel = 'Industry';
              
              return (
                <FacultyApplicationCard
                  studentName={`Student ${item.student_id.substring(0, 6)}`}
                  internshipTitle={internshipTitleMap[item.internship_id] || 'Internship'}
                  companyName="Tech Solutions Inc"
                  appliedAt={item.applied_at}
                  status={overallStatus}
                  industryStatus={secondaryStatus}
                  secondaryLabel={secondaryLabel}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  filterIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#bfdbfe',
    gap: 12
  },
  filterIndicatorContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  filterIndicatorText: {
    fontSize: 14,
    color: '#475569',
    flex: 1
  },
  filterIndicatorBold: {
    fontWeight: '700',
    color: '#1e40af'
  },
  clearFilterButton: {
    padding: 4
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
  },
  // Industry-specific card styles
  industryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  industryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  industryAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  industryAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  industryCardInfo: {
    flex: 1,
    gap: 4
  },
  industryStudentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a'
  },
  industryMajor: {
    fontSize: 13,
    color: '#64748b'
  },
  industryActions: {
    flexDirection: 'row',
    gap: 8
  },
  rejectButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  approveButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  industryStatusIcon: {
    marginLeft: 8
  },
  // Section styles for Industry grouped view
  section: {
    marginBottom: 24
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    paddingHorizontal: 4
  }
});
