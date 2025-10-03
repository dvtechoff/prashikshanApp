import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useApplicationList } from '@/hooks/useApplications';
import { useCurrentUserQuery } from '@/hooks/useCurrentUser';
import { useInternshipList } from '@/hooks/useInternships';
import { useLogbookEntryList } from '@/hooks/useLogbookEntries';

const ProgressBar = ({ value }: { value: number }) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressFill, { width: `${Math.min(100, value)}%` }]} />
  </View>
);

export default function AnalyticsScreen() {
  const { data: user } = useCurrentUserQuery();
  const { data: internships } = useInternshipList();
  const { data: applications } = useApplicationList();
  const { data: logbookEntries } = useLogbookEntryList();

  const totalInternships = internships?.length ?? 0;
  const approvedApplications = applications?.filter((app) => app.industry_status === 'APPROVED' && app.faculty_status === 'APPROVED').length ?? 0;
  const pendingApplications = applications?.filter((app) => app.industry_status === 'PENDING' || app.faculty_status === 'PENDING').length ?? 0;
  const totalHours = logbookEntries?.reduce((sum, entry) => sum + entry.hours, 0) ?? 0;

  const analyticsCopy = useMemo(() => {
    switch (user?.role) {
      case 'FACULTY':
        return {
          headline: 'Faculty overview',
          description: 'Monitor internship participation and approvals for your advisees.'
        };
      case 'INDUSTRY':
        return {
          headline: 'Industry insights',
          description: 'Track application momentum and intern engagement across your programs.'
        };
      default:
        return {
          headline: 'Student analytics',
          description: 'Stay on top of your internship progress and credit milestones.'
        };
    }
  }, [user?.role]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{analyticsCopy.headline}</Text>
      <Text style={styles.subtitle}>{analyticsCopy.description}</Text>

      <View style={styles.grid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Internships open</Text>
          <Text style={styles.metricValue}>{totalInternships}</Text>
          <ProgressBar value={Math.min(100, totalInternships * 10)} />
          <Text style={styles.metricCaption}>Active opportunities published</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Applications approved</Text>
          <Text style={styles.metricValue}>{approvedApplications}</Text>
          <ProgressBar value={approvedApplications * 15} />
          <Text style={styles.metricCaption}>Students cleared for credits</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Applications pending</Text>
          <Text style={styles.metricValue}>{pendingApplications}</Text>
          <ProgressBar value={pendingApplications * 20} />
          <Text style={styles.metricCaption}>Awaiting faculty / industry review</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Hours logged</Text>
          <Text style={styles.metricValue}>{totalHours}</Text>
          <ProgressBar value={Math.min(100, totalHours)} />
          <Text style={styles.metricCaption}>Total internship commitment tracked</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Participation trend</Text>
        <Text style={styles.sectionSubtitle}>Weekly logbook activity</Text>
        <View style={styles.barChart}>
          {Array.from({ length: 6 }).map((_, index) => {
            const average = totalHours / 6;
            const weekHours = Math.max(0, Math.round(average - index * 1.5));

            return (
              <View key={index} style={styles.barColumn}>
                <View style={[styles.bar, { height: 24 + weekHours * 6 }]} />
                <Text style={styles.barLabel}>W{index + 1}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Focus areas</Text>
        <Text style={styles.sectionSubtitle}>Skills with highest demand</Text>
        <View style={styles.skillList}>
          {(internships ?? [])
            .flatMap((item) => item.skills ?? [])
            .slice(0, 6)
            .map((skill) => (
              <View key={skill} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          {(internships ?? []).length === 0 && (
            <Text style={styles.emptySkillText}>Publish internships to unlock skill insights.</Text>
          )}
        </View>
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
    flexWrap: 'wrap',
    gap: 16
  },
  metricCard: {
    flexBasis: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  metricLabel: {
    fontSize: 13,
    color: '#64748b'
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a'
  },
  metricCaption: {
    fontSize: 12,
    color: '#94a3b8'
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
  sectionSubtitle: {
    color: '#64748b'
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  barColumn: {
    alignItems: 'center',
    gap: 6,
    flex: 1
  },
  bar: {
    width: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1'
  },
  barLabel: {
    fontSize: 12,
    color: '#94a3b8'
  },
  skillList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  skillChip: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  skillText: {
    color: '#0369a1',
    fontWeight: '600'
  },
  emptySkillText: {
    color: '#94a3b8'
  }
});
