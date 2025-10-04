import { useMemo } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useCurrentUserQuery } from '@/hooks/useCurrentUser';
import { useApplicationList } from '@/hooks/useApplications';
import { useLogbookEntryList } from '@/hooks/useLogbookEntries';
import { useNotificationList } from '@/hooks/useNotifications';
import { useSignOut } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const { data, isLoading } = useCurrentUserQuery();
  const signOut = useSignOut();
  
  const { data: applications } = useApplicationList();
  const { data: logbookEntries } = useLogbookEntryList();
  const { data: notifications } = useNotificationList();

  const stats = useMemo(() => {
    if (data?.role !== 'STUDENT') return null;
    
    const unreadNotifications = (notifications ?? []).filter((n) => !n.read);
    const totalApplications = applications?.length ?? 0;
    const totalHours = logbookEntries?.reduce((sum, entry) => sum + entry.hours, 0) ?? 0;
    const acceptedCount = (applications ?? []).filter(
      (app) => app.industry_status === 'APPROVED' && app.faculty_status === 'APPROVED'
    ).length;
    const creditsEarned = acceptedCount * 4;
    
    return {
      applications: totalApplications,
      hours: totalHours,
      credits: creditsEarned,
      unread: unreadNotifications.length
    };
  }, [data?.role, applications, logbookEntries, notifications]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.statusText}>Loading your profile…</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Unable to load profile details.</Text>
        <Text style={styles.errorDescription}>
          Please pull down to refresh or try again later.
        </Text>
      </View>
    );
  }

  // Get display name from profile
  const getDisplayInfo = () => {
    if (data.role === 'STUDENT') {
      return {
        name: data.name,
        subtitle: `${data.profile?.course || 'Course Not Set'} • ${data.profile?.year || 'Year Not Set'}`,
        additionalInfo: data.profile?.college || 'College Not Set'
      };
    } else if (data.role === 'FACULTY') {
      return {
        name: data.name,
        subtitle: data.profile?.designation || 'Designation Not Set',
        additionalInfo: data.profile?.department || 'Department Not Set'
      };
    } else {
      return {
        name: data.industry_profile?.contact_person_name || data.name,
        subtitle: data.industry_profile?.designation || 'Designation Not Set',
        additionalInfo: data.industry_profile?.company_name || 'Company Not Set'
      };
    }
  };

  const displayInfo = getDisplayInfo();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>View and manage your account</Text>

      {/* User Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{data.name.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{displayInfo.name}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleText}>{data.role}</Text>
          </View>
          <Text style={styles.profileSubtitle}>{displayInfo.subtitle}</Text>
          <Text style={styles.profileDetail}>{displayInfo.additionalInfo}</Text>
          <Text style={styles.profileEmail}>{data.email}</Text>
        </View>
      </View>

      {/* Stats Section - Only for Students */}
      {data.role === 'STUDENT' && stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Activity</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="document-text" size={24} color="#2563eb" style={styles.statIcon} />
              <Text style={styles.statValue}>{stats.applications}</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color="#059669" style={styles.statIcon} />
              <Text style={styles.statValue}>{stats.hours}</Text>
              <Text style={styles.statLabel}>Hours Logged</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color="#d97706" style={styles.statIcon} />
              <Text style={styles.statValue}>{stats.credits}</Text>
              <Text style={styles.statLabel}>Credits Earned</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="notifications" size={24} color="#dc2626" style={styles.statIcon} />
              <Text style={styles.statValue}>{stats.unread}</Text>
              <Text style={styles.statLabel}>Unread Alerts</Text>
            </View>
          </View>
        </View>
      )}

      {/* Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/(app)/profile/edit')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="create-outline" size={24} color="#2563eb" />
            </View>
            <Text style={styles.actionLabel}>Edit Profile</Text>
          </Pressable>

          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/(app)/dashboard')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="speedometer-outline" size={24} color="#2563eb" />
            </View>
            <Text style={styles.actionLabel}>Dashboard</Text>
          </Pressable>

          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/(app)/applications')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="document-text-outline" size={24} color="#d97706" />
            </View>
            <Text style={styles.actionLabel}>Applications</Text>
          </Pressable>

          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/(app)/notifications')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="notifications-outline" size={24} color="#dc2626" />
            </View>
            <Text style={styles.actionLabel}>Notifications</Text>
          </Pressable>

          {(data.role === 'STUDENT' || data.role === 'INDUSTRY') && (
            <Pressable 
              style={styles.actionButton}
              onPress={() => router.push('/(app)/internships')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="briefcase-outline" size={24} color="#059669" />
              </View>
              <Text style={styles.actionLabel}>Internships</Text>
            </Pressable>
          )}

          {(data.role === 'STUDENT' || data.role === 'FACULTY') && (
            <Pressable 
              style={styles.actionButton}
              onPress={() => router.push('/(app)/logbook')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="book-outline" size={24} color="#d97706" />
              </View>
              <Text style={styles.actionLabel}>Logbook</Text>
            </Pressable>
          )}

          {(data.role === 'STUDENT' || data.role === 'FACULTY' || data.role === 'INDUSTRY' || data.role === 'ADMIN') && (
            <Pressable 
              style={styles.actionButton}
              onPress={() => router.push('/(app)/analytics')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#e0e7ff' }]}>
                <Ionicons name="analytics-outline" size={24} color="#4f46e5" />
              </View>
              <Text style={styles.actionLabel}>Analytics</Text>
            </Pressable>
          )}

          {data.role === 'STUDENT' && (
            <>
              <Pressable 
                style={styles.actionButton}
                onPress={() => router.push('/(app)/credits')}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="ribbon-outline" size={24} color="#d97706" />
                </View>
                <Text style={styles.actionLabel}>Credits</Text>
              </Pressable>

              <Pressable 
                style={styles.actionButton}
                onPress={() => router.push('/(app)/skill-readiness')}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: '#dcfce7' }]}>
                  <Ionicons name="school-outline" size={24} color="#059669" />
                </View>
                <Text style={styles.actionLabel}>Skill Readiness</Text>
              </Pressable>
            </>
          )}

          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/(app)/settings')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="settings-outline" size={24} color="#7c3aed" />
            </View>
            <Text style={styles.actionLabel}>Settings</Text>
          </Pressable>
        </View>
      </View>

      {/* Sign Out Button */}
      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
    backgroundColor: '#f8fafc'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: '#f8fafc'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    color: '#475569'
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2
  },
  avatarContainer: {
    marginBottom: 8
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff'
  },
  profileInfo: {
    alignItems: 'center',
    gap: 6
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a'
  },
  roleTag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    textTransform: 'uppercase'
  },
  profileSubtitle: {
    fontSize: 16,
    color: '#475569',
    marginTop: 4
  },
  profileDetail: {
    fontSize: 14,
    color: '#64748b'
  },
  profileEmail: {
    fontSize: 14,
    color: '#94a3b8'
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8
  },
  statIcon: {
    marginBottom: 4
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a'
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center'
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
    width: '30%'
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionLabel: {
    fontSize: 13,
    color: '#334155',
    textAlign: 'center'
  },
  signOutButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  signOutButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b'
  },
  statusText: {
    color: '#475569'
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center'
  },
  errorDescription: {
    color: '#dc2626',
    textAlign: 'center'
  }
});
