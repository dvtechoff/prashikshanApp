import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, FileText, Briefcase, BookOpen, Loader, UserCheck, Clock } from 'lucide-react';
import { listInternships } from '@/lib/internships';
import { listApplications } from '@/lib/applications';
import { listLogbookEntries } from '@/lib/logbook';
import { adminApi, type User } from '@/lib/admin';

interface DashboardMetrics {
  internships_open: number;
  applications_submitted: number;
  logbook_entries: number;
  credits_awarded: number;
  applications_pending_review: number;
  weekly_hours: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  
  const role = user?.role || 'STUDENT';

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch data from multiple endpoints since analytics endpoint doesn't exist
        const [internships, applications, logbookEntries] = await Promise.all([
          listInternships().catch(() => []),
          listApplications().catch(() => []),
          listLogbookEntries().catch(() => []),
        ]);

        // Fetch pending users for admin
        if (role === 'ADMIN') {
          try {
            const allUsers = await adminApi.listUsers({ 
              is_active: false,
              limit: 10 
            });
            // Filter for faculty and industry only
            const pending = allUsers.filter(
              (u: User) => u.role === 'FACULTY' || u.role === 'INDUSTRY'
            );
            // Sort by created_at descending (most recent first)
            pending.sort((a: User, b: User) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setPendingUsers(pending);
          } catch (err) {
            console.error('Failed to fetch pending users:', err);
          }
        }

        // Calculate metrics
        const openInternships = internships.filter(i => i.status === 'OPEN').length;
        const pendingApps = applications.filter(
          app => app.faculty_status === 'PENDING' || app.industry_status === 'PENDING'
        ).length;
        
        const approvedEntries = logbookEntries.filter(entry => entry.approved);
        const credits = Math.floor(approvedEntries.reduce((sum, entry) => sum + entry.hours, 0) / 40); // 40 hours = 1 credit
        
        // Calculate weekly hours (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyHours = logbookEntries
          .filter(entry => new Date(entry.entry_date) >= oneWeekAgo)
          .reduce((sum, entry) => sum + entry.hours, 0);

        setMetrics({
          internships_open: openInternships,
          applications_submitted: applications.length,
          logbook_entries: logbookEntries.length,
          credits_awarded: credits,
          applications_pending_review: pendingApps,
          weekly_hours: weeklyHours,
        });
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load some dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  const stats = [
    {
      name: 'Open Internships',
      value: metrics?.internships_open || 0,
      icon: Briefcase,
      color: 'bg-blue-500',
      action: () => navigate('/internships'),
    },
    {
      name: 'Applications',
      value: metrics?.applications_submitted || 0,
      icon: FileText,
      color: 'bg-green-500',
      action: () => navigate('/applications'),
    },
    {
      name: 'Logbook Entries',
      value: metrics?.logbook_entries || 0,
      icon: BookOpen,
      color: 'bg-purple-500',
      action: () => navigate('/logbook'),
    },
    {
      name: 'Pending Reviews',
      value: metrics?.applications_pending_review || 0,
      icon: LayoutDashboard,
      color: 'bg-yellow-500',
      action: () => navigate('/applications'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          {role === 'STUDENT' && 'Track your internship journey and progress'}
          {role === 'FACULTY' && 'Review and approve student applications'}
          {role === 'INDUSTRY' && 'Manage your internship postings'}
          {role === 'ADMIN' && 'Monitor platform activity and manage users'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.name}
              onClick={stat.action}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Additional Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Credits Earned
            </h3>
            <p className="text-4xl font-bold text-blue-600">
              {metrics.credits_awarded}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Total credits from internships
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              This Week
            </h3>
            <p className="text-4xl font-bold text-green-600">
              {metrics.weekly_hours}h
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Hours logged this week
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions / Pending Registrations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {role === 'ADMIN' ? 'Pending Account Activations' : 'Quick Actions'}
        </h2>
        
        {role === 'ADMIN' ? (
          <div className="space-y-3">
            {pendingUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No pending registrations</p>
                <p className="text-sm mt-1">All faculty and industry accounts are activated</p>
              </div>
            ) : (
              <>
                {pendingUsers.map((pendingUser) => (
                  <div
                    key={pendingUser.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-orange-600 font-semibold text-sm">
                          {pendingUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {pendingUser.name}
                          <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            pendingUser.role === 'FACULTY' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {pendingUser.role}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">{pendingUser.email}</div>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          Registered {new Date(pendingUser.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/users/${pendingUser.id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Review
                    </button>
                  </div>
                ))}
                {pendingUsers.length >= 10 && (
                  <button
                    onClick={() => navigate('/admin/users?status=inactive')}
                    className="w-full mt-2 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View all pending activations →
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {role === 'STUDENT' && (
              <>
                <button 
                  onClick={() => navigate('/internships')}
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  <div className="font-medium text-blue-900">Browse Internships</div>
                  <div className="text-sm text-blue-700 mt-1">Find opportunities</div>
                </button>
                <button 
                  onClick={() => navigate('/applications')}
                  className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                >
                  <div className="font-medium text-green-900">My Applications</div>
                  <div className="text-sm text-green-700 mt-1">Track application status</div>
                </button>
                <button 
                  onClick={() => navigate('/logbook')}
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
                >
                  <div className="font-medium text-purple-900">Logbook</div>
                  <div className="text-sm text-purple-700 mt-1">Log your activities</div>
                </button>
              </>
            )}
            {role === 'FACULTY' && (
              <>
                <button 
                  onClick={() => navigate('/applications')}
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  <div className="font-medium text-blue-900">Review Applications</div>
                  <div className="text-sm text-blue-700 mt-1">Approve student applications</div>
                </button>
                <button 
                  onClick={() => navigate('/logbook')}
                  className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                >
                  <div className="font-medium text-green-900">Review Logbooks</div>
                  <div className="text-sm text-green-700 mt-1">Approve student entries</div>
                </button>
                <button 
                  onClick={() => navigate('/analytics')}
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
                >
                  <div className="font-medium text-purple-900">Analytics</div>
                  <div className="text-sm text-purple-700 mt-1">View department stats</div>
                </button>
              </>
            )}
            {role === 'INDUSTRY' && (
              <>
                <button 
                  onClick={() => navigate('/internships/new')}
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  <div className="font-medium text-blue-900">Post Internship</div>
                  <div className="text-sm text-blue-700 mt-1">Create new opportunity</div>
                </button>
                <button 
                  onClick={() => navigate('/applications')}
                  className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                >
                  <div className="font-medium text-green-900">Review Applications</div>
                  <div className="text-sm text-green-700 mt-1">Manage applications</div>
                </button>
                <button 
                  onClick={() => navigate('/internships')}
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
                >
                  <div className="font-medium text-purple-900">My Internships</div>
                  <div className="text-sm text-purple-700 mt-1">Manage postings</div>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
