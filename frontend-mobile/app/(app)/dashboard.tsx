import { useMemo } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useApplicationList } from '@/hooks/useApplications';
import { useLogbookEntryList } from '@/hooks/useLogbookEntries';
import { useNotificationList } from '@/hooks/useNotifications';
import { useInternshipList } from '@/hooks/useInternships';
import { useCurrentUserQuery } from '@/hooks/useCurrentUser';

const formatDate = (isoDate: string) => new Date(isoDate).toLocaleDateString();

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const QuickLink = ({ title, description, href }: { title: string; description: string; href: string }) => (
  <Pressable
    accessibilityRole="button"
    onPress={() => router.push(href as never)}
    style={({ pressed }) => [styles.quickLink, pressed && styles.quickLinkPressed]}
  >
    <Text style={styles.quickLinkTitle}>{title}</Text>
    <Text style={styles.quickLinkDescription}>{description}</Text>
  </Pressable>
);

export default function DashboardScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useCurrentUserQuery();
  const { data: applications } = useApplicationList();
  const { data: logbookEntries } = useLogbookEntryList();
  const { data: notifications } = useNotificationList();
  const { data: internships } = useInternshipList();

  const joinedDate = useMemo(() => (data ? formatDate(data.created_at) : null), [data]);

  const role = data?.role ?? 'STUDENT';

  // ============== STUDENT DASHBOARD DATA ==============
  if (role === 'STUDENT') {
    const profile = data?.profile;
    const unreadNotifications = (notifications ?? []).filter((n) => !n.read);
    const totalApplications = applications?.length ?? 0;
    
    // Application status breakdown
    const appliedCount = totalApplications;
    const inReviewCount = (applications ?? []).filter(
      (app) => app.industry_status === 'PENDING' || app.faculty_status === 'PENDING'
    ).length;
    const acceptedCount = (applications ?? []).filter(
      (app) => app.industry_status === 'APPROVED' && app.faculty_status === 'APPROVED'
    ).length;
    const rejectedCount = (applications ?? []).filter(
      (app) => app.industry_status === 'REJECTED' || app.faculty_status === 'REJECTED'
    ).length;

    // Logbook data
    const totalHours = logbookEntries?.reduce((sum, entry) => sum + entry.hours, 0) ?? 0;
    const pendingLogbookCount = (logbookEntries ?? []).filter((entry) => !entry.approved).length;
    const approvedLogbookCount = (logbookEntries ?? []).filter((entry) => entry.approved).length;

    // Credits calculation
    const creditsEarned = acceptedCount * 4; // 4 credits per accepted internship
    const creditsRequired = 20; // Example target
    const creditProgress = Math.min((creditsEarned / creditsRequired) * 100, 100);

    // Profile completion
    const hasResume = profile?.resume_url != null;
    const hasSkills = profile?.skills?.skills && profile.skills.skills.length > 0;
    const isVerified = profile?.verified ?? false;
    const profileFields = [
      profile?.course != null,
      profile?.year != null,
      profile?.enrollment_no != null,
      hasResume,
      hasSkills
    ];
    const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

    return (
      <ScrollView contentContainerStyle={styles.container}>
        {/* Greeting Header */}
        <View style={styles.greetingHeader}>
          <Text style={styles.greetingTitle}>Welcome back, {data?.name.split(' ')[0]} 👋</Text>
          <Text style={styles.greetingSubtitle}>Here's a quick look at your internship journey.</Text>
        </View>

        {/* Header: Profile Summary */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
              <Ionicons name="person" size={40} color="#94a3b8" />
            </View>
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{data?.name}</Text>
            <Text style={styles.profileDetails}>
              {profile?.course ?? 'Course not set'} • Year {profile?.year ?? 'N/A'}
            </Text>
            <View style={styles.profileCompletion}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${profileCompletion}%` }]} />
              </View>
              <Text style={styles.progressText}>{profileCompletion}% Complete</Text>
            </View>
          </View>
          <Pressable
            style={styles.editProfileButton}
            onPress={() => router.push('/(app)/profile')}
          >
            <Ionicons name="create-outline" size={20} color="#2563eb" />
          </Pressable>
        </View>

        {/* Recommended Internships */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <Pressable onPress={() => router.push('/(app)/internships')}>
              <Text style={styles.sectionLink}>View All</Text>
            </Pressable>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendedScroll}
          >
            {internships && internships.length > 0 ? (
              internships.slice(0, 5).map((internship) => (
                <Pressable
                  key={internship.id}
                  style={styles.recommendedCard}
                  onPress={() => router.push(`/(app)/internships/${internship.id}` as any)}
                >
                  <View style={styles.recommendedHeader}>
                    <View style={styles.recommendedIcon}>
                      <Ionicons name="business" size={20} color="#2563eb" />
                    </View>
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedBadgeText}>New</Text>
                    </View>
                  </View>
                  <Text style={styles.recommendedTitle} numberOfLines={2}>
                    {internship.title}
                  </Text>
                  <Text style={styles.recommendedCompany} numberOfLines={1}>
                    {internship.location ?? 'Remote'}
                  </Text>
                  <View style={styles.recommendedFooter}>
                    <View style={styles.recommendedTag}>
                      <Ionicons name="location" size={12} color="#64748b" />
                      <Text style={styles.recommendedTagText}>
                        {internship.remote ? 'Remote' : internship.location ?? 'On-site'}
                      </Text>
                    </View>
                    <View style={styles.recommendedTag}>
                      <Ionicons name="time" size={12} color="#64748b" />
                      <Text style={styles.recommendedTagText}>
                        {internship.duration_weeks ? `${internship.duration_weeks} weeks` : 'Flexible'}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))
            ) : (
              <View style={styles.recommendedEmpty}>
                <Ionicons name="search-outline" size={32} color="#cbd5e1" />
                <Text style={styles.recommendedEmptyText}>No internships available</Text>
                <Pressable
                  style={styles.recommendedEmptyButton}
                  onPress={() => router.push('/(app)/internships')}
                >
                  <Text style={styles.recommendedEmptyButtonText}>Browse All</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Logbook & Hours */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Logbook & Hours</Text>
            <Pressable onPress={() => router.push('/(app)/logbook/new')}>
              <Text style={styles.sectionLink}>+ Add Entry</Text>
            </Pressable>
          </View>
          <View style={styles.logbookSummary}>
            <View style={styles.logbookItem}>
              <Ionicons name="time-outline" size={20} color="#64748b" />
              <Text style={styles.logbookText}>
                <Text style={styles.logbookValue}>{totalHours}</Text> total hours logged
              </Text>
            </View>
            <View style={styles.logbookItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
              <Text style={styles.logbookText}>
                <Text style={styles.logbookValue}>{approvedLogbookCount}</Text> entries approved
              </Text>
            </View>
            {pendingLogbookCount > 0 && (
              <View style={[styles.logbookItem, styles.pendingAlert]}>
                <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                <Text style={styles.logbookText}>
                  <Text style={styles.logbookValue}>{pendingLogbookCount}</Text> pending faculty approval
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Credits & Reports */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Credits & Reports</Text>
            <Pressable onPress={() => router.push('/(app)/credits')}>
              <Text style={styles.sectionLink}>View Details</Text>
            </Pressable>
          </View>
          <View style={styles.creditsContainer}>
            <View style={styles.creditsInfo}>
              <Text style={styles.creditsText}>
                <Text style={styles.creditsValue}>{creditsEarned}</Text> / {creditsRequired} credits earned
              </Text>
              <View style={styles.creditsProgressBar}>
                <View style={[styles.creditsProgressFill, { width: `${creditProgress}%` }]} />
              </View>
            </View>
            <Pressable
              style={styles.downloadButton}
              onPress={() => router.push('/(app)/credits')}
            >
              <Ionicons name="download-outline" size={18} color="#2563eb" />
              <Text style={styles.downloadButtonText}>Download</Text>
            </Pressable>
          </View>
        </View>

        {/* Notifications / Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            <Pressable onPress={() => router.push('/(app)/notifications')}>
              <Text style={styles.sectionLink}>View All</Text>
            </Pressable>
          </View>
          {unreadNotifications.length > 0 ? (
            <View style={styles.notificationsList}>
              {unreadNotifications.slice(0, 2).map((notif) => (
                <Pressable
                  key={notif.id}
                  style={styles.notificationItem}
                  onPress={() => router.push('/(app)/notifications')}
                >
                  <View style={styles.notificationDot} />
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notif.title}</Text>
                    {notif.body && (
                      <Text style={styles.notificationBody} numberOfLines={1}>
                        {notif.body}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No new notifications</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <Pressable
              style={styles.quickActionButton}
              onPress={() => router.push('/(app)/internships')}
            >
              <Ionicons name="search" size={24} color="#2563eb" />
              <Text style={styles.quickActionText}>Apply for Internship</Text>
            </Pressable>

            <Pressable
              style={styles.quickActionButton}
              onPress={() => router.push('/(app)/logbook/new')}
            >
              <Ionicons name="add-circle" size={24} color="#10b981" />
              <Text style={styles.quickActionText}>Add Logbook Entry</Text>
            </Pressable>

            <Pressable
              style={styles.quickActionButton}
              onPress={() => router.push('/(app)/profile')}
            >
              <Ionicons name="cloud-upload" size={24} color="#f59e0b" />
              <Text style={styles.quickActionText}>Update Resume</Text>
            </Pressable>

            <Pressable
              style={styles.quickActionButton}
              onPress={() => router.push('/(app)/credits')}
            >
              <Ionicons name="document-text" size={24} color="#8b5cf6" />
              <Text style={styles.quickActionText}>View Reports</Text>
            </Pressable>

            <Pressable
              style={styles.quickActionButton}
              onPress={() => router.push('/(app)/skill-readiness')}
            >
              <Ionicons name="school" size={24} color="#ec4899" />
              <Text style={styles.quickActionText}>Skill Readiness</Text>
            </Pressable>

            <Pressable
              style={styles.quickActionButton}
              onPress={() => router.push('/(app)/analytics')}
            >
              <Ionicons name="stats-chart" size={24} color="#06b6d4" />
              <Text style={styles.quickActionText}>View Analytics</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  // ============== FACULTY/INDUSTRY DASHBOARDS (Unchanged) ==============
  const stats = useMemo(() => {
    const unread = (notifications ?? []).filter((item) => !item.read).length;
    const pendingApplications = (applications ?? []).filter(
      (item) => item.industry_status === 'PENDING' || item.faculty_status === 'PENDING'
    ).length;
    const approvedApplications = (applications ?? []).filter(
      (item) => item.industry_status === 'APPROVED' && item.faculty_status === 'APPROVED'
    ).length;
    const pendingLogbooks = (logbookEntries ?? []).filter((entry) => !entry.approved).length;

    if (role === 'FACULTY') {
      return [
        { label: 'Pending reviews', value: pendingLogbooks },
        { label: 'Applications to approve', value: pendingApplications },
        { label: 'Total advisees', value: applications?.length ?? 0 }
      ];
    }

    if (role === 'INDUSTRY') {
      return [
        { label: 'Active postings', value: internships?.length ?? 0 },
        { label: 'Applicants', value: applications?.length ?? 0 },
        { label: 'Unread alerts', value: unread }
      ];
    }

    const totalHours = logbookEntries?.reduce((sum, entry) => sum + entry.hours, 0) ?? 0;
    const estimatedCredits = approvedApplications * 4;

    return [
      { label: 'Applications', value: applications?.length ?? 0 },
      { label: 'Hours logged', value: totalHours },
      { label: 'Credits earned', value: estimatedCredits },
      { label: 'Unread alerts', value: unread }
    ];
  }, [applications, logbookEntries, notifications, role, internships]);

  const quickLinks = useMemo(() => {
    if (role === 'FACULTY') {
      return [
        {
          title: 'Review applications',
          description: 'Approve or reject internship applications with feedback.',
          href: '/(app)/applications'
        },
        {
          title: 'Approve logbooks',
          description: 'Review student logbook submissions and share comments.',
          href: '/(app)/logbook'
        },
        {
          title: 'Credit sign-offs',
          description: 'Update NEP credit approvals and track pending students.',
          href: '/(app)/credits'
        },
        {
          title: 'Download reports',
          description: 'Access internship summaries and PDF reports.',
          href: '/(app)/credits'
        },
        {
          title: 'Analytics dashboard',
          description: 'Monitor participation trends across your advisees.',
          href: '/(app)/analytics'
        }
      ];
    }

    if (role === 'INDUSTRY') {
      return [
        {
          title: 'Manage postings',
          description: 'Create new internships or update existing listings.',
          href: '/(app)/internships'
        },
        {
          title: 'Review applicants',
          description: 'See student profiles, resumes, and respond quickly.',
          href: '/(app)/applications'
        },
        {
          title: 'Intern progress',
          description: 'Track logbook updates shared by interns.',
          href: '/(app)/logbook'
        },
        {
          title: 'Insights',
          description: 'Understand internship performance and engagement.',
          href: '/(app)/analytics'
        }
      ];
    }

    return [
      {
        title: 'Browse internships',
        description: 'Find new opportunities that match your skills.',
        href: '/(app)/internships'
      },
      {
        title: 'Track applications',
        description: 'See where each application stands.',
        href: '/(app)/applications'
      },
      {
        title: 'Update logbook',
        description: 'Keep your weekly progress up to date.',
        href: '/(app)/logbook'
      },
      {
        title: 'Track credits',
        description: 'Download reports and monitor credit completion.',
        href: '/(app)/credits'
      },
      {
        title: 'Skill readiness modules',
        description: 'Complete prep modules before joining an internship.',
        href: '/(app)/skill-readiness'
      },
      {
        title: 'View analytics',
        description: 'Explore participation across internships.',
        href: '/(app)/analytics'
      }
    ];
  }, [role]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.statusText}>Loading your dashboard…</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>We couldn’t load your profile</Text>
        <Text style={styles.errorMessage}>{error?.message ?? 'Please try again shortly.'}</Text>
        <Pressable style={styles.primaryButton} onPress={() => refetch()}>
          {isRefetching ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Retry</Text>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome back, {data.name.split(' ')[0]} 👋</Text>
        <Text style={styles.subtitle}>Here’s a quick look at your internship journey.</Text>
      </View>

      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your profile</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{data.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{data.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.badge}>{data.role}</Text>
        </View>
        {joinedDate && (
          <View style={styles.row}>
            <Text style={styles.label}>Joined</Text>
            <Text style={styles.value}>{joinedDate}</Text>
          </View>
        )}
      </View>

      <View style={styles.quickLinks}>
        <Text style={styles.quickLinksTitle}>Quick actions</Text>
        {quickLinks.map((link) => (
          <QuickLink key={link.title} {...link} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
    gap: 20,
    paddingBottom: 40
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
    gap: 16
  },
  // Student Dashboard - Greeting Header
  greetingHeader: {
    gap: 6,
    marginBottom: 4
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a'
  },
  greetingSubtitle: {
    fontSize: 15,
    color: '#64748b'
  },
  // Profile Header
  profileHeader: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  profileImageContainer: {
    position: 'relative'
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32
  },
  profileImagePlaceholder: {
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    width: 20,
    height: 20
  },
  profileInfo: {
    flex: 1,
    gap: 4
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a'
  },
  profileDetails: {
    fontSize: 14,
    color: '#64748b'
  },
  profileCompletion: {
    gap: 4,
    marginTop: 4
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 3
  },
  progressText: {
    fontSize: 12,
    color: '#64748b'
  },
  editProfileButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#eff6ff'
  },
  // Recommended Internships
  recommendedScroll: {
    paddingRight: 20,
    gap: 12
  },
  recommendedCard: {
    width: 260,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  recommendedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  recommendedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  recommendedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  recommendedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a'
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 4
  },
  recommendedCompany: {
    fontSize: 14,
    color: '#64748b'
  },
  recommendedFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8
  },
  recommendedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  recommendedTagText: {
    fontSize: 12,
    color: '#64748b'
  },
  recommendedEmpty: {
    width: 260,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    borderStyle: 'dashed'
  },
  recommendedEmptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center'
  },
  recommendedEmptyButton: {
    backgroundColor: '#eff6ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 4
  },
  recommendedEmptyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb'
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  statCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a'
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center'
  },
  // Section
  section: {
    gap: 12
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a'
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb'
  },
  // Application Status
  applicationStatusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  statusItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: 6
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  statusCount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a'
  },
  statusLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center'
  },
  // Logbook
  logbookSummary: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  logbookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  logbookText: {
    fontSize: 14,
    color: '#64748b'
  },
  logbookValue: {
    fontWeight: '700',
    color: '#0f172a'
  },
  pendingAlert: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 10,
    marginTop: 4
  },
  // Credits
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  creditsInfo: {
    flex: 1,
    gap: 8
  },
  creditsText: {
    fontSize: 14,
    color: '#64748b'
  },
  creditsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a'
  },
  creditsProgressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  creditsProgressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb'
  },
  // Notifications
  notificationsList: {
    gap: 8
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6'
  },
  notificationContent: {
    flex: 1,
    gap: 2
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a'
  },
  notificationBody: {
    fontSize: 13,
    color: '#64748b'
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12
  },
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  quickActionButton: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center'
  },
  // Faculty/Industry Dashboard (Original styles)
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: 16,
    color: '#475569'
  },
  header: {
    gap: 8
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: 15,
    color: '#475569'
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a'
  },
  badge: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontWeight: '600',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5f5'
  },
  secondaryButtonText: {
    color: '#1e293b',
    fontSize: 15,
    fontWeight: '600'
  },
  statusText: {
    fontSize: 15,
    color: '#475569'
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: 15,
    color: '#dc2626',
    textAlign: 'center'
  },
  quickLinks: {
    gap: 12
  },
  quickLinksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  quickLink: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    gap: 6
  },
  quickLinkPressed: {
    opacity: 0.85
  },
  quickLinkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b'
  },
  quickLinkDescription: {
    fontSize: 14,
    color: '#64748b'
  }
});
