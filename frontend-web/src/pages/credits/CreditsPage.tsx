import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  Loader,
  AlertCircle,
  BookOpen,
  Target
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { listLogbookEntries } from '@/lib/logbook';
import { listApplications } from '@/lib/applications';
import type { LogbookEntry, ApplicationSummary } from '@/lib/types';

export default function CreditsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entriesData, applicationsData] = await Promise.all([
        listLogbookEntries().catch(() => []),
        listApplications().catch(() => [])
      ]);
      setEntries(entriesData);
      setApplications(applicationsData);
    } catch (err: any) {
      setError('Failed to load credits data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate credits metrics
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const approvedHours = entries
    .filter(entry => entry.approved)
    .reduce((sum, entry) => sum + entry.hours, 0);
  const pendingHours = totalHours - approvedHours;
  
  // 40 hours = 1 credit (standard conversion)
  const earnedCredits = Math.floor(approvedHours / 40);
  const progressToNextCredit = approvedHours % 40;
  const percentageToNext = (progressToNextCredit / 40) * 100;

  // Get approved applications
  const approvedApplications = applications.filter(
    app => app.faculty_status === 'APPROVED' && app.industry_status === 'APPROVED'
  );
  
  const totalCreditsAvailable = approvedApplications.reduce(
    (sum, app) => sum + (app.internship?.credits || 0),
    0
  );

  // Group entries by month
  const entriesByMonth = entries.reduce((acc, entry) => {
    const month = new Date(entry.entry_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
    if (!acc[month]) {
      acc[month] = { total: 0, approved: 0, count: 0 };
    }
    acc[month].total += entry.hours;
    acc[month].approved += entry.approved ? entry.hours : 0;
    acc[month].count += 1;
    return acc;
  }, {} as Record<string, { total: number; approved: number; count: number }>);

  const monthlyData = Object.entries(entriesByMonth)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-6); // Last 6 months

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
        <h1 className="text-3xl font-bold text-gray-900">Credit Tracking</h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'STUDENT' && 'Monitor your academic credit progress'}
          {user?.role === 'FACULTY' && 'View student credit accumulation'}
          {(user?.role === 'INDUSTRY' || user?.role === 'ADMIN') && 'Overview of credit distribution'}
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

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Earned Credits */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-90">Earned</span>
          </div>
          <div className="text-4xl font-bold mb-1">{earnedCredits}</div>
          <p className="text-sm opacity-90">Credits Earned</p>
        </div>

        {/* Available Credits */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-90">Available</span>
          </div>
          <div className="text-4xl font-bold mb-1">{totalCreditsAvailable}</div>
          <p className="text-sm opacity-90">Total Available</p>
        </div>

        {/* Approved Hours */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-90">Approved</span>
          </div>
          <div className="text-4xl font-bold mb-1">{approvedHours}</div>
          <p className="text-sm opacity-90">Hours Approved</p>
        </div>

        {/* Pending Hours */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-90">Pending</span>
          </div>
          <div className="text-4xl font-bold mb-1">{pendingHours}</div>
          <p className="text-sm opacity-90">Hours Pending</p>
        </div>
      </div>

      {/* Progress to Next Credit */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Progress to Next Credit</h2>
            <p className="text-sm text-gray-600">
              {progressToNextCredit} of 40 hours completed
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-blue-600" />
        </div>
        
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                {percentageToNext.toFixed(0)}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {40 - progressToNextCredit} hours remaining
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-blue-100">
            <div
              style={{ width: `${percentageToNext}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
            <p className="text-sm text-gray-600">Total Entries</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {entries.filter(e => e.approved).length}
            </p>
            <p className="text-sm text-gray-600">Approved Entries</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {(totalHours / entries.length || 0).toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">Avg Hours/Entry</p>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Monthly Breakdown</h2>
            <p className="text-sm text-gray-600">Last 6 months activity</p>
          </div>
          <Calendar className="w-8 h-8 text-gray-600" />
        </div>

        <div className="space-y-4">
          {monthlyData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No data available</p>
          ) : (
            monthlyData.map(([month, data]) => {
              const monthCredits = Math.floor(data.approved / 40);
              const approvalRate = (data.approved / data.total) * 100;
              
              return (
                <div key={month} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{month}</h3>
                        <p className="text-sm text-gray-600">{data.count} entries</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{monthCredits}</p>
                      <p className="text-xs text-gray-600">credits</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-600">Total Hours</p>
                      <p className="text-lg font-semibold text-gray-900">{data.total}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Approved</p>
                      <p className="text-lg font-semibold text-green-600">{data.approved}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Approval Rate</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {approvalRate.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {user?.role === 'STUDENT' && (
          <>
            <button
              onClick={() => navigate('/logbook/new')}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 rounded-lg p-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Add Logbook Entry</h3>
                  <p className="text-sm text-gray-600">Record your internship hours</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/internships')}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-100 rounded-lg p-3">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Find Internships</h3>
                  <p className="text-sm text-gray-600">Explore more opportunities</p>
                </div>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">About Academic Credits</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
          <li>40 hours of approved internship work = 1 academic credit</li>
          <li>All logbook entries must be approved by faculty to count towards credits</li>
          <li>Credits are awarded after both faculty and industry approve your application</li>
          <li>Monitor your progress regularly to stay on track with your goals</li>
          <li>Quality of work matters - ensure detailed logbook descriptions</li>
        </ul>
      </div>
    </div>
  );
}
