import { useMemo } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { useApplicationList } from '@/hooks/useApplications';
import { useLogbookEntryList } from '@/hooks/useLogbookEntries';
import { useNotificationList } from '@/hooks/useNotifications';
import { useInternshipList } from '@/hooks/useInternships';
import { useSignOut } from '@/hooks/useAuth';
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
  const signOut = useSignOut();

  const joinedDate = useMemo(() => (data ? formatDate(data.created_at) : null), [data]);

  const role = data?.role ?? 'STUDENT';

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

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

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
        <Pressable style={styles.secondaryButton} onPress={handleSignOut}>
          <Text style={styles.secondaryButtonText}>Sign out</Text>
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

      <Pressable style={styles.primaryButton} onPress={handleSignOut}>
        <Text style={styles.primaryButtonText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
    gap: 24
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
    gap: 16
  },
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
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1d4ed8',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 4
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff'
  },
  statLabel: {
    fontSize: 13,
    color: '#cbd5f5',
    textTransform: 'uppercase'
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
