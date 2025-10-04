import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  MapPin,
  DollarSign,
  Award
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { listApplications } from '@/lib/applications';
import type { ApplicationSummary } from '@/lib/types';

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await listApplications();
      setApplications(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'ALL') return true;
    // For students, check both faculty and industry status
    return app.faculty_status === filter || app.industry_status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'STUDENT' && 'Track your internship applications'}
          {user?.role === 'FACULTY' && 'Review and approve student applications'}
          {user?.role === 'INDUSTRY' && 'Review applications for your internships'}
          {user?.role === 'ADMIN' && 'Monitor all applications'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md p-2 flex gap-2">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Applications List */}
      {!loading && !error && (
        <>
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No applications found
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'ALL'
                  ? 'You haven\'t submitted any applications yet'
                  : `No ${filter.toLowerCase()} applications`}
              </p>
              {user?.role === 'STUDENT' && (
                <button
                  onClick={() => navigate('/internships')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Internships
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div
                  key={application.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/applications/${application.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Internship Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {application.internship?.title || 'Internship'}
                      </h3>

                      {/* Student Info (for faculty/industry) */}
                      {user?.role !== 'STUDENT' && application.student && (
                        <p className="text-sm text-gray-600 mb-2">
                          Student: {application.student.name} ({application.student.email})
                        </p>
                      )}

                      {/* Application Date */}
                      <p className="text-sm text-gray-500 mb-3">
                        Applied on {formatDate(application.applied_at)}
                      </p>

                      {/* Internship Details */}
                      {application.internship && (
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {application.internship.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {application.internship.remote ? 'Remote' : application.internship.location}
                              </span>
                            </div>
                          )}
                          {application.internship.stipend !== null && application.internship.stipend !== undefined && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>₹{application.internship.stipend}/month</span>
                            </div>
                          )}
                          {application.internship.duration_weeks !== null && application.internship.duration_weeks !== undefined && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{application.internship.duration_weeks} weeks</span>
                            </div>
                          )}
                          {application.internship.credits !== null && application.internship.credits !== undefined && (
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              <span>{application.internship.credits} credits</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(application.faculty_status)}
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            application.faculty_status
                          )}`}
                        >
                          Faculty: {application.faculty_status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(application.industry_status)}
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            application.industry_status
                          )}`}
                        >
                          Industry: {application.industry_status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Resume Link */}
                  {application.resume_snapshot_url && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <a
                        href={application.resume_snapshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        View Resume →
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
