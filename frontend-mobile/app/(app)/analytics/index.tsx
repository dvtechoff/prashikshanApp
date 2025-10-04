import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useApplicationList } from '@/hooks/useApplications';
import { useCurrentUserQuery } from '@/hooks/useCurrentUser';
import { useInternshipList } from '@/hooks/useInternships';
import { useLogbookEntryList } from '@/hooks/useLogbookEntries';

const StatCard = ({ 
  icon, 
  iconColor, 
  iconBg, 
  value, 
  label 
}: { 
  icon: any; 
  iconColor: string; 
  iconBg: string; 
  value: string | number; 
  label: string;
}) => (
  <View style={styles.statCard}>
    <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
      {icon}
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ProgressItem = ({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: number; 
  color: string;
}) => (
  <View style={styles.progressItem}>
    <View style={styles.progressHeader}>
      <Text style={styles.progressLabel}>{label}</Text>
      <Text style={styles.progressValue}>{value}%</Text>
    </View>
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
  </View>
);

const SkillItem = ({ 
  icon, 
  iconBg, 
  iconColor, 
  name, 
  percentage 
}: { 
  icon: any; 
  iconBg: string; 
  iconColor: string; 
  name: string; 
  percentage: number;
}) => (
  <View style={styles.skillItem}>
    <View style={[styles.skillIcon, { backgroundColor: iconBg }]}>
      {icon}
    </View>
    <Text style={styles.skillName}>{name}</Text>
    <Text style={[styles.skillPercentage, { color: iconColor }]}>{percentage}%</Text>
  </View>
);

export default function AnalyticsScreen() {
  const { data: user } = useCurrentUserQuery();
  const { data: internships } = useInternshipList();
  const { data: applications } = useApplicationList();
  const { data: logbookEntries } = useLogbookEntryList();

  const role = user?.role;

  // Faculty-specific metrics
  const facultyMetrics = useMemo(() => {
    if (role !== 'FACULTY') return null;

    const totalStudents = new Set((applications ?? []).map(app => app.student_id)).size;
    const industryPartners = new Set((internships ?? []).map(int => int.posted_by)).size;

    const totalApplications = applications?.length ?? 0;

    /**
     * INTERNSHIP TRACKING LOGIC:
     * 
     * 1. ENROLLED: Student has been approved by BOTH faculty AND industry
     *    - application.faculty_status === 'APPROVED'
     *    - application.industry_status === 'APPROVED'
     *    - Student is officially enrolled and can start the internship
     * 
     * 2. COMPLETED: Student has finished the internship requirements
     *    - Must be enrolled first (both approvals)
     *    - Has submitted logbook entries
     *    - Internship duration has passed OR
     *    - Has accumulated required hours based on duration
     *    - All logbook entries are approved by faculty
     * 
     * 3. IN PROGRESS: Student is currently doing the internship
     *    - Must be enrolled (both approvals)
     *    - Has started submitting logbook entries (at least one entry)
     *    - Has NOT yet completed all requirements
     *    - May have some pending logbook approvals
     */

    // Get all enrolled applications (approved by both faculty and industry)
    const enrolledApplications = (applications ?? []).filter(
      app => app.faculty_status === 'APPROVED' && app.industry_status === 'APPROVED'
    );

    // Track internship status for each enrolled application
    const internshipStatuses = enrolledApplications.map(app => {
      // Get the internship details
      const internship = (internships ?? []).find(int => int.id === app.internship_id);
      
      // Get all logbook entries for this application
      const appLogbooks = (logbookEntries ?? []).filter(entry => entry.application_id === app.id);
      
      // Calculate if internship is completed
      const hasLogbookEntries = appLogbooks.length > 0;
      const allLogbooksApproved = appLogbooks.length > 0 && appLogbooks.every(entry => entry.approved);
      
      // Calculate total hours worked
      const totalHoursWorked = appLogbooks.reduce((sum, entry) => sum + entry.hours, 0);
      
      // Estimate required hours (assuming 40 hours per week for duration_weeks)
      const requiredHours = (internship?.duration_weeks ?? 8) * 40;
      
      // Check if internship end date has passed
      let hasEndDatePassed = false;
      if (internship?.start_date && internship?.duration_weeks) {
        const startDate = new Date(internship.start_date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (internship.duration_weeks * 7));
        hasEndDatePassed = new Date() > endDate;
      }
      
      // Determine status
      let status: 'enrolled' | 'in_progress' | 'completed';
      
      if (allLogbooksApproved && (totalHoursWorked >= requiredHours || hasEndDatePassed)) {
        // Completed: All logbooks approved AND (met hour requirement OR duration passed)
        status = 'completed';
      } else if (hasLogbookEntries) {
        // In Progress: Has started working (has logbook entries)
        status = 'in_progress';
      } else {
        // Enrolled: Approved but not yet started working
        status = 'enrolled';
      }
      
      return {
        applicationId: app.id,
        studentId: app.student_id,
        status,
        totalHoursWorked,
        requiredHours,
        logbookCount: appLogbooks.length,
        approvedLogbookCount: appLogbooks.filter(entry => entry.approved).length
      };
    });

    // Count each status
    const enrolledCount = internshipStatuses.filter(s => s.status === 'enrolled').length;
    const inProgressCount = internshipStatuses.filter(s => s.status === 'in_progress').length;
    const completedCount = internshipStatuses.filter(s => s.status === 'completed').length;

    // Calculate percentages based on total enrolled students
    const totalEnrolled = enrolledApplications.length;
    const enrolledPercentage = totalEnrolled > 0 ? (enrolledCount / totalEnrolled) * 100 : 0;
    const inProgressPercentage = totalEnrolled > 0 ? (inProgressCount / totalEnrolled) * 100 : 0;
    const completedPercentage = totalEnrolled > 0 ? (completedCount / totalEnrolled) * 100 : 0;

    // Calculate top skills based on internship postings and applications
    const skillDemand: Record<string, { internshipCount: number; applicationCount: number }> = {};
    
    (internships ?? []).forEach((internship) => {
      const internshipApplications = (applications ?? []).filter(app => app.internship_id === internship.id);
      
      (internship.skills ?? []).forEach((skill) => {
        if (!skillDemand[skill]) {
          skillDemand[skill] = { internshipCount: 0, applicationCount: 0 };
        }
        skillDemand[skill].internshipCount += 1;
        skillDemand[skill].applicationCount += internshipApplications.length;
      });
    });

    // Calculate demand score (weighted: 60% application count, 40% internship count)
    const skillsWithScores = Object.entries(skillDemand).map(([skill, data]) => {
      const maxApplications = Math.max(...Object.values(skillDemand).map(d => d.applicationCount), 1);
      const maxInternships = Math.max(...Object.values(skillDemand).map(d => d.internshipCount), 1);
      
      const normalizedApplications = (data.applicationCount / maxApplications) * 100;
      const normalizedInternships = (data.internshipCount / maxInternships) * 100;
      
      const demandScore = (normalizedApplications * 0.6) + (normalizedInternships * 0.4);
      
      return {
        skill,
        score: Math.round(demandScore),
        internshipCount: data.internshipCount,
        applicationCount: data.applicationCount
      };
    });

    // Sort by demand score and get top 3
    const topSkills = skillsWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return {
      totalStudents,
      industryPartners,
      enrolledPercentage: Math.round(enrolledPercentage),
      completedPercentage: Math.round(completedPercentage),
      inProgressPercentage: Math.round(inProgressPercentage),
      enrolledCount,
      inProgressCount,
      completedCount,
      totalEnrolled,
      topSkills,
      internshipStatuses
    };
  }, [role, applications, logbookEntries, internships]);

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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable style={styles.menuButton}>
              <Ionicons name="menu" size={24} color="#0f172a" />
            </Pressable>
            <Text style={styles.headerTitle}>Analytics Dashboard</Text>
          </View>
          <Pressable style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#0f172a" />
          </Pressable>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <StatCard
            icon={<Ionicons name="people" size={24} color="#3b82f6" />}
            iconColor="#3b82f6"
            iconBg="#dbeafe"
            value={facultyMetrics.totalStudents.toLocaleString()}
            label="Total Students"
          />
          <StatCard
            icon={<MaterialCommunityIcons name="briefcase" size={24} color="#8b5cf6" />}
            iconColor="#8b5cf6"
            iconBg="#ede9fe"
            value={facultyMetrics.industryPartners}
            label="Industry Partners"
          />
        </View>

        {/* Internship Participation */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Internship Participation</Text>
            <Pressable>
              <Text style={styles.viewAllButton}>View All</Text>
            </Pressable>
          </View>
          <Text style={styles.cardSubtitle}>
            Tracking {facultyMetrics.totalEnrolled} enrolled students
          </Text>
          <View style={styles.participationList}>
            <ProgressItem 
              label="Enrolled" 
              value={facultyMetrics.enrolledPercentage} 
              color="#3b82f6" 
            />
            <Text style={styles.progressDescription}>
              {facultyMetrics.enrolledCount} students approved by both faculty & industry
            </Text>
            
            <ProgressItem 
              label="In Progress" 
              value={facultyMetrics.inProgressPercentage} 
              color="#f59e0b" 
            />
            <Text style={styles.progressDescription}>
              {facultyMetrics.inProgressCount} students actively working (have logbook entries)
            </Text>
            
            <ProgressItem 
              label="Completed" 
              value={facultyMetrics.completedPercentage} 
              color="#10b981" 
            />
            <Text style={styles.progressDescription}>
              {facultyMetrics.completedCount} students finished (met hour requirements & all logbooks approved)
            </Text>
          </View>
        </View>

        {/* Student Performance Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Student Performance</Text>
          <View style={styles.chartPlaceholder}>
            <MaterialCommunityIcons name="chart-bar" size={48} color="#cbd5e1" />
            <Text style={styles.chartPlaceholderText}>Performance Chart</Text>
          </View>
        </View>

        {/* Top Skills in Demand */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Skills in Demand</Text>
          <View style={styles.skillsList}>
            {facultyMetrics.topSkills.length > 0 ? (
              facultyMetrics.topSkills.map((skillData, index) => {
                // Assign colors and icons based on index
                const colors = [
                  { iconName: 'star' as const, iconColor: '#ea580c', iconBg: '#fed7aa' },
                  { iconName: 'fire' as const, iconColor: '#0ea5e9', iconBg: '#bae6fd' },
                  { iconName: 'trending-up' as const, iconColor: '#8b5cf6', iconBg: '#e9d5ff' }
                ];
                const colorConfig = colors[index] || colors[0];
                
                return (
                  <SkillItem
                    key={skillData.skill}
                    icon={<MaterialCommunityIcons name={colorConfig.iconName} size={20} color={colorConfig.iconColor} />}
                    iconBg={colorConfig.iconBg}
                    iconColor={colorConfig.iconColor}
                    name={skillData.skill}
                    percentage={skillData.score}
                  />
                );
              })
            ) : (
              <Text style={styles.emptySkillText}>No skills data available yet.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  // Student and Industry view (existing design)
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{analyticsCopy.headline}</Text>
      <Text style={styles.subtitle}>{analyticsCopy.description}</Text>

      <View style={styles.grid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Internships open</Text>
          <Text style={styles.metricValue}>{totalInternships}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(100, totalInternships * 10)}%` }]} />
          </View>
          <Text style={styles.metricCaption}>Active opportunities published</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Applications approved</Text>
          <Text style={styles.metricValue}>{approvedApplications}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(100, approvedApplications * 15)}%` }]} />
          </View>
          <Text style={styles.metricCaption}>Students cleared for credits</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Applications pending</Text>
          <Text style={styles.metricValue}>{pendingApplications}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(100, pendingApplications * 20)}%` }]} />
          </View>
          <Text style={styles.metricCaption}>Awaiting faculty / industry review</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Hours logged</Text>
          <Text style={styles.metricValue}>{totalHours}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(100, totalHours)}%` }]} />
          </View>
          <Text style={styles.metricCaption}>Total internship commitment tracked</Text>
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
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    gap: 20,
    backgroundColor: '#f8fafc'
  },
  // Faculty Dashboard Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#ffffff'
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#ffffff'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a'
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a'
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    gap: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: -8
  },
  viewAllButton: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500'
  },
  participationList: {
    gap: 16
  },
  progressItem: {
    gap: 8
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  progressLabel: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500'
  },
  progressValue: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '600'
  },
  progressDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: -8,
    marginLeft: 4
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    overflow: 'hidden'
  },
  progressFill: {
    height: 8,
    borderRadius: 999
  },
  chartPlaceholder: {
    height: 180,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  chartPlaceholderText: {
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '500'
  },
  skillsList: {
    gap: 12
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  skillIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  skillName: {
    flex: 1,
    fontSize: 15,
    color: '#475569',
    fontWeight: '500'
  },
  skillPercentage: {
    fontSize: 15,
    fontWeight: '600'
  },
  // Existing styles for Student/Industry
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
