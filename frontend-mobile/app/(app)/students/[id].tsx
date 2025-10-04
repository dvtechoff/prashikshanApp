import { useLocalSearchParams, router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { useCurrentUserQuery } from '@/hooks/useCurrentUser';
import { useApplicationList } from '@/hooks/useApplications';
import { useLogbookEntryList } from '@/hooks/useLogbookEntries';
import { useInternshipList } from '@/hooks/useInternships';

export default function StudentProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: currentUser } = useCurrentUserQuery();
  const { data: applications, isLoading: appsLoading } = useApplicationList();
  const { data: logbookEntries, isLoading: logbooksLoading } = useLogbookEntryList();
  const { data: internships } = useInternshipList();

  const role = currentUser?.role;
  const canView = role === 'FACULTY' || role === 'ADMIN';

  // Find student's applications
  const studentApplications = applications?.filter(app => app.student_id === id) ?? [];
  
  // Find student's logbook entries
  const studentLogbooks = logbookEntries?.filter(entry => entry.student_id === id) ?? [];
  
  // Calculate metrics
  const approvedApplications = studentApplications.filter(
    app => app.faculty_status === 'APPROVED' && app.industry_status === 'APPROVED'
  ).length;
  const totalHours = studentLogbooks.reduce((sum, entry) => sum + entry.hours, 0);
  const approvedLogbooks = studentLogbooks.filter(entry => entry.approved).length;
  const creditsEarned = approvedApplications * 4;

  // Get student info from first application (fallback data)
  const studentInfo = studentApplications[0];
  
  if (!canView) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Access denied</Text>
        <Text style={styles.errorDescription}>
          Only faculty and administrators can view student profiles.
        </Text>
        <Pressable style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (appsLoading || logbooksLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.statusText}>Loading student profile…</Text>
      </View>
    );
  }

  if (!studentInfo) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Student not found</Text>
        <Text style={styles.errorDescription}>
          No data available for this student ID.
        </Text>
        <Pressable style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const handleOpenResume = () => {
    if (studentInfo.resume_snapshot_url) {
      Linking.openURL(studentInfo.resume_snapshot_url).catch(() => {
        Alert.alert('Error', 'Could not open resume link.');
      });
    } else {
      Alert.alert('No resume', 'This student has not uploaded a resume yet.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {studentInfo.student_id ? studentInfo.student_id.substring(0, 2).toUpperCase() : 'ST'}
          </Text>
        </View>
        <Text style={styles.studentName}>Student #{id}</Text>
        <Text style={styles.studentId}>ID: {id}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{approvedApplications}</Text>
          <Text style={styles.statLabel}>Approved internships</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalHours}</Text>
          <Text style={styles.statLabel}>Hours logged</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{approvedLogbooks}</Text>
          <Text style={styles.statLabel}>Logbooks approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{creditsEarned}</Text>
          <Text style={styles.statLabel}>Credits earned</Text>
        </View>
      </View>

      {/* Resume */}
      {studentInfo.resume_snapshot_url && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resume</Text>
          <Pressable style={styles.resumeButton} onPress={handleOpenResume}>
            <View>
              <Text style={styles.resumeTitle}>View student resume</Text>
              <Text style={styles.resumeUrl}>{studentInfo.resume_snapshot_url}</Text>
            </View>
            <Text style={styles.link}>Open</Text>
          </Pressable>
        </View>
      )}

      {/* Application History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application history</Text>
        {studentApplications.length === 0 ? (
          <Text style={styles.emptyText}>No applications yet</Text>
        ) : (
          studentApplications.map((app) => {
            const internship = internships?.find(i => i.id === app.internship_id);
            return (
              <Pressable
                key={app.id}
                style={styles.listItem}
                onPress={() => router.push(`/(app)/applications/${app.id}` as never)}
              >
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>
                    {internship?.title ?? 'Internship Application'}
                  </Text>
                  <Text style={styles.listItemDate}>
                    Applied {new Date(app.applied_at).toLocaleDateString()}
                  </Text>
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Faculty:</Text>
                    <Text style={[
                      styles.statusBadge,
                      app.faculty_status === 'APPROVED' && styles.statusApproved,
                      app.faculty_status === 'REJECTED' && styles.statusRejected,
                      app.faculty_status === 'PENDING' && styles.statusPending
                    ]}>
                      {app.faculty_status}
                    </Text>
                    <Text style={styles.statusLabel}>Industry:</Text>
                    <Text style={[
                      styles.statusBadge,
                      app.industry_status === 'APPROVED' && styles.statusApproved,
                      app.industry_status === 'REJECTED' && styles.statusRejected,
                      app.industry_status === 'PENDING' && styles.statusPending
                    ]}>
                      {app.industry_status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            );
          })
        )}
      </View>

      {/* Logbook Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Logbook submissions</Text>
        <View style={styles.logbookSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total entries</Text>
            <Text style={styles.summaryValue}>{studentLogbooks.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Approved</Text>
            <Text style={styles.summaryValue}>{approvedLogbooks}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={styles.summaryValue}>{studentLogbooks.length - approvedLogbooks}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total hours</Text>
            <Text style={styles.summaryValue}>{totalHours}</Text>
          </View>
        </View>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push('/(app)/logbook' as never)}
        >
          <Text style={styles.secondaryButtonText}>View all logbook entries</Text>
        </Pressable>
      </View>
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
    padding: 24,
    gap: 16,
    backgroundColor: '#f8fafc'
  },
  statusText: {
    color: '#475569',
    fontSize: 15
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center'
  },
  errorDescription: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center'
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
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
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff'
  },
  studentName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a'
  },
  studentId: {
    fontSize: 14,
    color: '#64748b'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  statCard: {
    flexBasis: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563eb'
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center'
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
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
  resumeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  resumeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a'
  },
  resumeUrl: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  link: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '600'
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 8
  },
  listItemContent: {
    flex: 1,
    gap: 6
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a'
  },
  listItemDate: {
    fontSize: 13,
    color: '#64748b'
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap'
  },
  statusLabel: {
    fontSize: 12,
    color: '#64748b'
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusApproved: {
    backgroundColor: '#dcfce7',
    color: '#15803d'
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
    color: '#dc2626'
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#b45309'
  },
  chevron: {
    fontSize: 24,
    color: '#cbd5e1',
    marginLeft: 8
  },
  logbookSummary: {
    gap: 12
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b'
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a'
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600'
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '600'
  }
});
