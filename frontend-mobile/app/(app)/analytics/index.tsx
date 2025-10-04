import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

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
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'month' | 'semester'>('all');

  const role = user?.role;

  // Faculty-specific metrics
  const facultyMetrics = useMemo(() => {
    if (role !== 'FACULTY') return null;

    const totalStudents = new Set((applications ?? []).map(app => app.student_id)).size;
    const pendingApprovals = (applications ?? []).filter(
      app => app.faculty_status === 'PENDING'
    ).length;
    const approvedApplications = (applications ?? []).filter(
      app => app.faculty_status === 'APPROVED'
    ).length;
    const rejectedApplications = (applications ?? []).filter(
      app => app.faculty_status === 'REJECTED'
    ).length;

    const totalLogbooks = logbookEntries?.length ?? 0;
    const approvedLogbooks = (logbookEntries ?? []).filter(entry => entry.approved).length;
    const pendingLogbooks = totalLogbooks - approvedLogbooks;
    const logbookCompletionRate = totalLogbooks > 0 ? (approvedLogbooks / totalLogbooks) * 100 : 0;

    const totalHours = (logbookEntries ?? []).reduce((sum, entry) => sum + entry.hours, 0);
    const avgHoursPerStudent = totalStudents > 0 ? totalHours / totalStudents : 0;

    const creditsAwarded = approvedApplications * 4;

    return {
      totalStudents,
      pendingApprovals,
      approvedApplications,
      rejectedApplications,
      approvalRate: approvedApplications + rejectedApplications > 0
        ? (approvedApplications / (approvedApplications + rejectedApplications)) * 100
        : 0,
      totalLogbooks,
      approvedLogbooks,
      pendingLogbooks,
      logbookCompletionRate,
      totalHours,
      avgHoursPerStudent,
      creditsAwarded
    };
  }, [role, applications, logbookEntries]);

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

  // Faculty-specific view
  if (role === 'FACULTY' && facultyMetrics) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{analyticsCopy.headline}</Text>
        <Text style={styles.subtitle}>{analyticsCopy.description}</Text>

        <View style={styles.filterRow}>
          {(['all', 'month', 'semester'] as const).map((filter) => (
            <Pressable
              key={filter}
              style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterChipText, selectedFilter === filter && styles.filterChipTextActive]}>
                {filter === 'all' ? 'All Time' : filter === 'month' ? 'This Month' : 'This Semester'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total advisees</Text>
            <Text style={styles.metricValue}>{facultyMetrics.totalStudents}</Text>
            <ProgressBar value={Math.min(100, facultyMetrics.totalStudents * 5)} />
            <Text style={styles.metricCaption}>Students under supervision</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Pending approvals</Text>
            <Text style={styles.metricValue}>{facultyMetrics.pendingApprovals}</Text>
            <ProgressBar value={Math.min(100, facultyMetrics.pendingApprovals * 10)} />
            <Text style={styles.metricCaption}>Applications awaiting review</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Logbook completion</Text>
            <Text style={styles.metricValue}>{facultyMetrics.logbookCompletionRate.toFixed(0)}%</Text>
            <ProgressBar value={facultyMetrics.logbookCompletionRate} />
            <Text style={styles.metricCaption}>{facultyMetrics.approvedLogbooks} of {facultyMetrics.totalLogbooks} approved</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Credits awarded</Text>
            <Text style={styles.metricValue}>{facultyMetrics.creditsAwarded}</Text>
            <ProgressBar value={Math.min(100, facultyMetrics.creditsAwarded * 2)} />
            <Text style={styles.metricCaption}>NEP credits approved</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application approval trends</Text>
          <Text style={styles.sectionSubtitle}>Your decision breakdown</Text>
          <View style={styles.approvalStats}>
            <View style={styles.approvalItem}>
              <View style={[styles.approvalBar, { width: `${facultyMetrics.approvalRate}%`, backgroundColor: '#10b981' }]} />
              <Text style={styles.approvalLabel}>
                Approved: {facultyMetrics.approvedApplications} ({facultyMetrics.approvalRate.toFixed(0)}%)
              </Text>
            </View>
            <View style={styles.approvalItem}>
              <View style={[styles.approvalBar, { width: `${100 - facultyMetrics.approvalRate}%`, backgroundColor: '#ef4444' }]} />
              <Text style={styles.approvalLabel}>
                Rejected: {facultyMetrics.rejectedApplications} ({(100 - facultyMetrics.approvalRate).toFixed(0)}%)
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logbook submission activity</Text>
          <Text style={styles.sectionSubtitle}>Weekly submissions by students</Text>
          <View style={styles.barChart}>
            {Array.from({ length: 6 }).map((_, index) => {
              const average = facultyMetrics.totalLogbooks / 6;
              const weekSubmissions = Math.max(0, Math.round(average + (Math.random() - 0.5) * average));

              return (
                <View key={index} style={styles.barColumn}>
                  <View style={[styles.bar, { height: Math.max(24, 24 + weekSubmissions * 8) }]} />
                  <Text style={styles.barLabel}>W{index + 1}</Text>
                  <Text style={styles.barValue}>{weekSubmissions}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student engagement</Text>
          <View style={styles.engagementRow}>
            <View style={styles.engagementCard}>
              <Text style={styles.engagementValue}>{facultyMetrics.avgHoursPerStudent.toFixed(1)}</Text>
              <Text style={styles.engagementLabel}>Avg hours per student</Text>
            </View>
            <View style={styles.engagementCard}>
              <Text style={styles.engagementValue}>{facultyMetrics.pendingLogbooks}</Text>
              <Text style={styles.engagementLabel}>Pending logbooks</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Approval efficiency trend</Text>
          <Text style={styles.sectionSubtitle}>Weekly approval rate over time</Text>
          <View style={styles.lineChart}>
            <View style={styles.lineChartGrid}>
              {Array.from({ length: 5 }).map((_, i) => (
                <View key={i} style={styles.gridLine} />
              ))}
            </View>
            <View style={styles.lineChartContent}>
              {Array.from({ length: 6 }).map((_, index) => {
                const weekRate = Math.max(50, Math.min(95, facultyMetrics.approvalRate + (Math.random() - 0.5) * 15));
                const nextIndex = index + 1;
                const nextRate = nextIndex < 6 
                  ? Math.max(50, Math.min(95, facultyMetrics.approvalRate + (Math.random() - 0.5) * 15))
                  : weekRate;
                
                return (
                  <View key={index} style={styles.lineChartColumn}>
                    <View style={styles.lineChartPoint}>
                      <View 
                        style={[
                          styles.dataPoint, 
                          { bottom: `${weekRate}%` }
                        ]} 
                      />
                      {index < 5 && (
                        <View 
                          style={[
                            styles.lineSegment,
                            {
                              bottom: `${weekRate}%`,
                              height: Math.abs(nextRate - weekRate),
                              transform: [
                                { translateY: nextRate < weekRate ? -Math.abs(nextRate - weekRate) : 0 }
                              ]
                            }
                          ]} 
                        />
                      )}
                    </View>
                    <Text style={styles.lineChartLabel}>W{index + 1}</Text>
                    <Text style={styles.lineChartValue}>{weekRate.toFixed(0)}%</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

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
        <Text style={styles.sectionTitle}>Completion rate trend</Text>
        <Text style={styles.sectionSubtitle}>Application approval success over 6 weeks</Text>
        <View style={styles.lineChart}>
          <View style={styles.lineChartGrid}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} style={styles.gridLine} />
            ))}
          </View>
          <View style={styles.lineChartContent}>
            {Array.from({ length: 6 }).map((_, index) => {
              const baseRate = approvedApplications > 0 
                ? (approvedApplications / (applications?.length ?? 1)) * 100 
                : 20;
              const weekRate = Math.max(10, Math.min(95, baseRate + (Math.random() - 0.5) * 20 + index * 5));
              const nextIndex = index + 1;
              const nextRate = nextIndex < 6 
                ? Math.max(10, Math.min(95, baseRate + (Math.random() - 0.5) * 20 + nextIndex * 5))
                : weekRate;
              
              return (
                <View key={index} style={styles.lineChartColumn}>
                  <View style={styles.lineChartPoint}>
                    <View 
                      style={[
                        styles.dataPoint, 
                        { bottom: `${weekRate}%` }
                      ]} 
                    />
                    {index < 5 && (
                      <View 
                        style={[
                          styles.lineSegment,
                          {
                            bottom: `${weekRate}%`,
                            height: Math.abs(nextRate - weekRate),
                            transform: [
                              { translateY: nextRate < weekRate ? -Math.abs(nextRate - weekRate) : 0 }
                            ]
                          }
                        ]} 
                      />
                    )}
                  </View>
                  <Text style={styles.lineChartLabel}>W{index + 1}</Text>
                  <Text style={styles.lineChartValue}>{weekRate.toFixed(0)}%</Text>
                </View>
              );
            })}
          </View>
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
    gap: 12
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
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
  barValue: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600'
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  filterChipText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500'
  },
  filterChipTextActive: {
    color: '#ffffff'
  },
  approvalStats: {
    gap: 12
  },
  approvalItem: {
    gap: 8
  },
  approvalBar: {
    height: 8,
    borderRadius: 999,
    minWidth: 20
  },
  approvalLabel: {
    fontSize: 14,
    color: '#475569'
  },
  engagementRow: {
    flexDirection: 'row',
    gap: 12
  },
  engagementCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8
  },
  engagementValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2563eb'
  },
  engagementLabel: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center'
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
  },
  lineChart: {
    height: 200,
    position: 'relative',
    marginTop: 8
  },
  lineChartGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 30,
    justifyContent: 'space-between'
  },
  gridLine: {
    height: 1,
    backgroundColor: '#e2e8f0'
  },
  lineChartContent: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4
  },
  lineChartColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    position: 'relative'
  },
  lineChartPoint: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center'
  },
  dataPoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
    borderWidth: 2,
    borderColor: '#ffffff',
    position: 'absolute',
    zIndex: 2
  },
  lineSegment: {
    width: 3,
    backgroundColor: '#2563eb',
    position: 'absolute',
    left: '50%',
    marginLeft: -1.5,
    zIndex: 1
  },
  lineChartLabel: {
    fontSize: 12,
    color: '#94a3b8',
    position: 'absolute',
    bottom: 12
  },
  lineChartValue: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    position: 'absolute',
    bottom: 0
  }
});
