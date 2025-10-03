import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';

import { useApplicationList } from '@/hooks/useApplications';
import { useLogbookEntryList } from '@/hooks/useLogbookEntries';
import { useCurrentUserQuery } from '@/hooks/useCurrentUser';
import { useInternshipList } from '@/hooks/useInternships';

const Card = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.card}>{children}</View>
);

export default function CreditsScreen() {
  const { data: applications } = useApplicationList();
  const { data: logbookEntries } = useLogbookEntryList();
  const { data: currentUser } = useCurrentUserQuery();
  const { data: internships } = useInternshipList();

  const role = currentUser?.role ?? 'STUDENT';

  const approvedApplications = applications?.filter(
    (item) => item.industry_status === 'APPROVED' && item.faculty_status === 'APPROVED'
  ).length ?? 0;
  const pendingCredits = applications?.filter(
    (item) => item.faculty_status === 'APPROVED' && item.industry_status === 'PENDING'
  ).length ?? 0;
  const totalHours = logbookEntries?.reduce((sum, entry) => sum + entry.hours, 0) ?? 0;

  const creditEstimate = approvedApplications * 4;
  const hoursProgress = Math.min(100, Math.round((totalHours / 160) * 100));

  if (role === 'FACULTY') {
    const pendingFacultyApprovals = (applications ?? []).filter(
      (item) => item.faculty_status === 'PENDING'
    );
    const awaitingIndustry = (applications ?? []).filter(
      (item) => item.faculty_status === 'APPROVED' && item.industry_status === 'PENDING'
    ).length;
    const awarded = approvedApplications;

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Credit approvals</Text>
        <Text style={styles.subtitle}>
          Review student submissions, confirm NEP credits, and download supporting reports.
        </Text>

        <View style={styles.grid}>
          <Card>
            <Text style={styles.metricValue}>{pendingFacultyApprovals.length}</Text>
            <Text style={styles.metricLabel}>Pending faculty approvals</Text>
          </Card>
          <Card>
            <Text style={styles.metricValue}>{awaitingIndustry}</Text>
            <Text style={styles.metricLabel}>Awaiting industry sign-off</Text>
          </Card>
          <Card>
            <Text style={styles.metricValue}>{awarded}</Text>
            <Text style={styles.metricLabel}>Credits awarded</Text>
          </Card>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Queue</Text>
          <Text style={styles.helperText}>Tap an item to open the application detail screen.</Text>
          {pendingFacultyApprovals.length === 0 ? (
            <Text style={styles.emptyDescription}>No pending credit approvals right now.</Text>
          ) : (
            pendingFacultyApprovals.map((item) => {
              const internshipTitle = internships?.find((intern) => intern.id === item.internship_id)?.title;
              return (
                <Pressable
                  key={item.id}
                  style={styles.rowItem}
                  onPress={() =>
                    router.push({ pathname: '/(app)/applications/[id]', params: { id: item.id } })
                  }
                >
                  <View>
                    <Text style={styles.reportTitle}>{internshipTitle ?? 'Internship application'}</Text>
                    <Text style={styles.reportDescription}>
                      Student #{item.student_id} • Submitted {new Date(item.applied_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.link}>Review</Text>
                </Pressable>
              );
            })
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Reports</Text>
          <Text style={styles.helperText}>
            Download compiled reports to archive approvals or share with programme leadership.
          </Text>
          {['Pending approvals', 'Completed credits', 'All internship reports'].map((report) => (
            <Pressable
              key={report}
              style={styles.reportRow}
              onPress={() =>
                Alert.alert('Download coming soon', `${report} download will open shortly.`)
              }
            >
              <View>
                <Text style={styles.reportTitle}>{report}</Text>
                <Text style={styles.reportDescription}>PDF • generated from logbooks and applications</Text>
              </View>
              <Text style={styles.link}>Download</Text>
            </Pressable>
          ))}
        </Card>
      </ScrollView>
    );
  }

  if (role === 'INDUSTRY') {
    const industryApplications = applications?.filter((item) => item.industry_status === 'PENDING').length ?? 0;
    const activeInterns = (applications ?? []).filter(
      (item) => item.industry_status === 'APPROVED' && item.faculty_status === 'APPROVED'
    ).length;

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Internship compliance</Text>
        <Text style={styles.subtitle}>
          Stay aligned with faculty by tracking which interns still need your confirmation.
        </Text>

        <View style={styles.grid}>
          <Card>
            <Text style={styles.metricValue}>{industryApplications}</Text>
            <Text style={styles.metricLabel}>Decisions pending</Text>
          </Card>
          <Card>
            <Text style={styles.metricValue}>{activeInterns}</Text>
            <Text style={styles.metricLabel}>Interns cleared</Text>
          </Card>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Need action?</Text>
          <Text style={styles.helperText}>
            Faculty award credits after your approval. Review applications to keep students moving.
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push('/(app)/applications' as never)}
          >
            <Text style={styles.primaryButtonText}>Go to applications</Text>
          </Pressable>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Reports</Text>
          <Text style={styles.helperText}>
            Export intern performance summaries to share with your HR or L&D teams.
          </Text>
          <Pressable
            style={styles.reportRow}
            onPress={() => Alert.alert('Export coming soon', 'CSV export will be added shortly.')}
          >
            <View>
              <Text style={styles.reportTitle}>Intern roster</Text>
              <Text style={styles.reportDescription}>CSV • includes contact info and credit status</Text>
            </View>
            <Text style={styles.link}>Export</Text>
          </Pressable>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Credit status</Text>
      <Text style={styles.subtitle}>
        Track your NEP credits and download internship reports for submission.
      </Text>

      <View style={styles.grid}>
        <Card>
          <Text style={styles.metricValue}>{creditEstimate}</Text>
          <Text style={styles.metricLabel}>Estimated credits earned</Text>
        </Card>
        <Card>
          <Text style={styles.metricValue}>{pendingCredits}</Text>
          <Text style={styles.metricLabel}>Credits awaiting approval</Text>
        </Card>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Hours logged</Text>
        <Text style={styles.hoursText}>{totalHours} / 160 hrs required</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${hoursProgress}%` }]} />
        </View>
        <Text style={styles.helperText}>
          Complete 160 hours of internship experience to earn the full credit allotment.
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Reports</Text>
        <Text style={styles.helperText}>Download the latest reports for submission to faculty.</Text>

        {['Weekly summary', 'Mid-term evaluation', 'Final report'].map((report) => (
          <Pressable
            key={report}
            style={styles.reportRow}
            onPress={() => Alert.alert('Download coming soon', `${report} download will open shortly.`)}
          >
            <View>
              <Text style={styles.reportTitle}>{report}</Text>
              <Text style={styles.reportDescription}>PDF • auto-generated from your logbook entries</Text>
            </View>
            <Text style={styles.link}>Download</Text>
          </Pressable>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Approval checklist</Text>
        <View style={styles.checklist}>
          <Text style={styles.checkItem}>• Submit weekly logbook entries with attachments</Text>
          <Text style={styles.checkItem}>• Faculty approves logbook entries and credits</Text>
          <Text style={styles.checkItem}>• Upload final internship report</Text>
          <Text style={styles.checkItem}>• Confirm credits in university portal</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
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
  grid: {
    flexDirection: 'row',
    gap: 16
  },
  card: {
    flex: 1,
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
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a'
  },
  metricLabel: {
    color: '#64748b'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  hoursText: {
    color: '#475569',
    fontWeight: '600'
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    overflow: 'hidden'
  },
  progressFill: {
    height: 8,
    backgroundColor: '#2563eb'
  },
  helperText: {
    color: '#94a3b8',
    fontSize: 13
  },
  emptyDescription: {
    color: '#64748b',
    marginTop: 12
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  reportTitle: {
    fontWeight: '600',
    color: '#0f172a'
  },
  reportDescription: {
    color: '#64748b',
    fontSize: 12
  },
  link: {
    color: '#2563eb',
    fontWeight: '600'
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15
  },
  checklist: {
    gap: 8
  },
  checkItem: {
    color: '#475569'
  }
});
