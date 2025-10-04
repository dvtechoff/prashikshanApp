import { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  BookOpen,
  Award,
  CheckCircle,
  Clock,
  Loader,
  AlertCircle,
  Calendar,
  Target,
  Activity
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { listApplications } from '@/lib/applications';
import { listInternships } from '@/lib/internships';
import { listLogbookEntries } from '@/lib/logbook';
import type { ApplicationSummary, Internship, LogbookEntry } from '@/lib/types';

interface MonthlyStats {
  month: string;
  applications: number;
  internships: number;
  logbookEntries: number;
  approvedApplications: number;
}

interface StatusCount {
  pending: number;
  approved: number;
  rejected: number;
}

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsData, internshipsData, logbookData] = await Promise.all([
        listApplications().catch(() => []),
        listInternships({}).catch(() => []),
        listLogbookEntries().catch(() => [])
      ]);
      setApplications(appsData);
      setInternships(internshipsData);
      setLogbookEntries(logbookData);
    } catch (err: any) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Only faculty and admin can access
  if (user?.role !== 'FACULTY' && user?.role !== 'ADMIN') {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Only faculty and administrators can access analytics.</p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalApplications = applications.length;
  const totalInternships = internships.length;
  const openInternships = internships.filter(i => i.status === 'OPEN').length;
  const totalLogbookEntries = logbookEntries.length;

  // Application status breakdown
  const applicationStatus: StatusCount = {
    pending: applications.filter(
      a => a.faculty_status === 'PENDING' || a.industry_status === 'PENDING'
    ).length,
    approved: applications.filter(
      a => a.faculty_status === 'APPROVED' && a.industry_status === 'APPROVED'
    ).length,
    rejected: applications.filter(
      a => a.faculty_status === 'REJECTED' || a.industry_status === 'REJECTED'
    ).length
  };

  // Logbook approval stats
  const approvedLogbookEntries = logbookEntries.filter(e => e.approved).length;
  const totalHours = logbookEntries.reduce((sum, e) => sum + e.hours, 0);
  const approvedHours = logbookEntries.filter(e => e.approved).reduce((sum, e) => sum + e.hours, 0);
  const creditsEarned = Math.floor(approvedHours / 40);

  // Monthly trends (last 6 months)
  const getMonthlyStats = (): MonthlyStats[] => {
    const monthsMap = new Map<string, MonthlyStats>();
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthsMap.set(monthKey, {
        month: monthKey,
        applications: 0,
        internships: 0,
        logbookEntries: 0,
        approvedApplications: 0
      });
    }

    // Count applications by month
    applications.forEach(app => {
      const date = new Date(app.applied_at);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      const stats = monthsMap.get(monthKey);
      if (stats) {
        stats.applications++;
        if (app.faculty_status === 'APPROVED' && app.industry_status === 'APPROVED') {
          stats.approvedApplications++;
        }
      }
    });

    // Count internships by month
    internships.forEach(internship => {
      const date = new Date(internship.created_at);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      const stats = monthsMap.get(monthKey);
      if (stats) stats.internships++;
    });

    // Count logbook entries by month
    logbookEntries.forEach(entry => {
      const date = new Date(entry.entry_date);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      const stats = monthsMap.get(monthKey);
      if (stats) stats.logbookEntries++;
    });

    return Array.from(monthsMap.values());
  };

  const monthlyStats = getMonthlyStats();
  const maxValue = Math.max(
    ...monthlyStats.map(s => Math.max(s.applications, s.internships, s.logbookEntries))
  );

  // Top skills from internships
  const getTopSkills = () => {
    const skillsMap = new Map<string, number>();
    internships.forEach(internship => {
      if (internship.skills) {
        internship.skills.forEach(skill => {
          skillsMap.set(skill, (skillsMap.get(skill) || 0) + 1);
        });
      }
    });
    return Array.from(skillsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  };

  const topSkills = getTopSkills();

  // Approval rate
  const approvalRate = totalApplications > 0
    ? ((applicationStatus.approved / totalApplications) * 100).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Comprehensive overview of internship program metrics and trends
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Applications */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-6 h-6 opacity-80" />
          </div>
          <div className="text-4xl font-bold mb-1">{totalApplications}</div>
          <p className="text-sm opacity-90">Total Applications</p>
          <p className="text-xs opacity-75 mt-2">{approvalRate}% approval rate</p>
        </div>

        {/* Open Internships */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="w-8 h-8 opacity-80" />
            <Activity className="w-6 h-6 opacity-80" />
          </div>
          <div className="text-4xl font-bold mb-1">{openInternships}</div>
          <p className="text-sm opacity-90">Open Internships</p>
          <p className="text-xs opacity-75 mt-2">{totalInternships} total</p>
        </div>

        {/* Logbook Entries */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 opacity-80" />
            <CheckCircle className="w-6 h-6 opacity-80" />
          </div>
          <div className="text-4xl font-bold mb-1">{approvedLogbookEntries}</div>
          <p className="text-sm opacity-90">Approved Entries</p>
          <p className="text-xs opacity-75 mt-2">{totalLogbookEntries} total</p>
        </div>

        {/* Credits Awarded */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 opacity-80" />
            <Target className="w-6 h-6 opacity-80" />
          </div>
          <div className="text-4xl font-bold mb-1">{creditsEarned}</div>
          <p className="text-sm opacity-90">Credits Awarded</p>
          <p className="text-xs opacity-75 mt-2">{approvedHours} hours</p>
        </div>
      </div>

      {/* Application Status Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-6 h-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Application Status</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-3">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{applicationStatus.pending}</div>
            <p className="text-sm text-gray-600">Pending Review</p>
            <div className="mt-2 bg-yellow-100 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: totalApplications > 0
                    ? `${(applicationStatus.pending / totalApplications) * 100}%`
                    : '0%'
                }}
              ></div>
            </div>
          </div>

          {/* Approved */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{applicationStatus.approved}</div>
            <p className="text-sm text-gray-600">Approved</p>
            <div className="mt-2 bg-green-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: totalApplications > 0
                    ? `${(applicationStatus.approved / totalApplications) * 100}%`
                    : '0%'
                }}
              ></div>
            </div>
          </div>

          {/* Rejected */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{applicationStatus.rejected}</div>
            <p className="text-sm text-gray-600">Rejected</p>
            <div className="mt-2 bg-red-100 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: totalApplications > 0
                    ? `${(applicationStatus.rejected / totalApplications) * 100}%`
                    : '0%'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-6 h-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Monthly Trends</h2>
          <span className="text-sm text-gray-600">(Last 6 Months)</span>
        </div>

        <div className="space-y-6">
          {monthlyStats.map((stat) => (
            <div key={stat.month} className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                <span>{stat.month}</span>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-blue-600">Apps: {stat.applications}</span>
                  <span className="text-green-600">Internships: {stat.internships}</span>
                  <span className="text-purple-600">Logbook: {stat.logbookEntries}</span>
                </div>
              </div>
              
              <div className="flex gap-2 h-8">
                {/* Applications Bar */}
                <div
                  className="bg-blue-500 rounded transition-all duration-500 flex items-center justify-center text-xs text-white font-medium"
                  style={{
                    width: maxValue > 0 ? `${(stat.applications / maxValue) * 30}%` : '0%',
                    minWidth: stat.applications > 0 ? '30px' : '0'
                  }}
                  title={`${stat.applications} applications`}
                >
                  {stat.applications > 0 && stat.applications}
                </div>
                
                {/* Internships Bar */}
                <div
                  className="bg-green-500 rounded transition-all duration-500 flex items-center justify-center text-xs text-white font-medium"
                  style={{
                    width: maxValue > 0 ? `${(stat.internships / maxValue) * 30}%` : '0%',
                    minWidth: stat.internships > 0 ? '30px' : '0'
                  }}
                  title={`${stat.internships} internships`}
                >
                  {stat.internships > 0 && stat.internships}
                </div>
                
                {/* Logbook Entries Bar */}
                <div
                  className="bg-purple-500 rounded transition-all duration-500 flex items-center justify-center text-xs text-white font-medium"
                  style={{
                    width: maxValue > 0 ? `${(stat.logbookEntries / maxValue) * 30}%` : '0%',
                    minWidth: stat.logbookEntries > 0 ? '30px' : '0'
                  }}
                  title={`${stat.logbookEntries} logbook entries`}
                >
                  {stat.logbookEntries > 0 && stat.logbookEntries}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Applications</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">Internships</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-gray-600">Logbook Entries</span>
          </div>
        </div>
      </div>

      {/* Top Skills */}
      {topSkills.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Top Skills in Demand</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topSkills.map((skill, index) => (
              <div
                key={skill.name}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-blue-600">#{index + 1}</span>
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                    {skill.count}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{skill.name}</p>
                <p className="text-xs text-gray-600">internships</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hours & Credits Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hours Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Hours Logged</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Hours</span>
              <span className="text-2xl font-bold text-gray-900">{totalHours}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Approved Hours</span>
              <span className="text-2xl font-bold text-green-600">{approvedHours}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending Hours</span>
              <span className="text-2xl font-bold text-yellow-600">{totalHours - approvedHours}</span>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Approval Rate</span>
                <span className="font-semibold text-gray-900">
                  {totalHours > 0 ? ((approvedHours / totalHours) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: totalHours > 0 ? `${(approvedHours / totalHours) * 100}%` : '0%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Credits Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Credits Overview</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Credits Earned</span>
              <span className="text-2xl font-bold text-blue-600">{creditsEarned}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Available Credits</span>
              <span className="text-2xl font-bold text-gray-900">
                {internships.reduce((sum, i) => sum + (i.credits || 0), 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Avg Credits/Internship</span>
              <span className="text-2xl font-bold text-purple-600">
                {totalInternships > 0
                  ? (internships.reduce((sum, i) => sum + (i.credits || 0), 0) / totalInternships).toFixed(1)
                  : '0'}
              </span>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>{approvedHours % 40}</strong> hours towards next credit
              </p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((approvedHours % 40) / 40) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
