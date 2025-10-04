import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Briefcase,
  Loader,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getApplication, updateApplication } from '@/lib/applications';
import type { ApplicationDetail, ApplicationDecision } from '@/lib/types';

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id]);

  const fetchApplication = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getApplication(id);
      setApplication(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (type: 'faculty' | 'industry', status: ApplicationDecision) => {
    if (!application) return;

    setUpdating(true);
    setUpdateError('');

    try {
      const payload = type === 'faculty'
        ? { faculty_status: status }
        : { industry_status: status };

      await updateApplication(application.id, payload);
      await fetchApplication(); // Refresh data
    } catch (err: any) {
      setUpdateError(err.response?.data?.detail || 'Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: ApplicationDecision) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: ApplicationDecision) => {
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canUpdateFacultyStatus = user?.role === 'FACULTY';
  const canUpdateIndustryStatus = user?.role === 'INDUSTRY';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/applications')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Applications
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error || 'Application not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <button
        onClick={() => navigate('/applications')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Applications
      </button>

      {updateError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{updateError}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Application Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Application Details
                </h1>
                <p className="text-gray-600">
                  Submitted on {formatDate(application.applied_at)}
                </p>
              </div>
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          {/* Internship Information */}
          {application.internship && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Internship</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="text-lg font-medium text-gray-900">
                    {application.internship.title}
                  </p>
                </div>

                {application.internship.description && (
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-gray-700">{application.internship.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  {application.internship.location && (
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="text-gray-900">
                        {application.internship.remote ? 'Remote' : application.internship.location}
                      </p>
                    </div>
                  )}

                  {application.internship.duration_weeks && (
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="text-gray-900">{application.internship.duration_weeks} weeks</p>
                    </div>
                  )}

                  {application.internship.stipend !== null && (
                    <div>
                      <p className="text-sm text-gray-600">Stipend</p>
                      <p className="text-gray-900">₹{application.internship.stipend}/month</p>
                    </div>
                  )}

                  {application.internship.credits !== null && (
                    <div>
                      <p className="text-sm text-gray-600">Credits</p>
                      <p className="text-gray-900">{application.internship.credits}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Student Information */}
          {user?.role !== 'STUDENT' && application.student && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Student</h2>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-medium text-gray-900">{application.student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900">{application.student.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Resume */}
          {application.resume_snapshot_url && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resume</h2>
              <a
                href={application.resume_snapshot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-5 h-5" />
                View Resume
              </a>
            </div>
          )}
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Faculty Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Faculty Status</h3>
            
            <div className="flex items-center gap-2 mb-4">
              {getStatusIcon(application.faculty_status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.faculty_status)}`}>
                {application.faculty_status}
              </span>
            </div>

            {canUpdateFacultyStatus && application.faculty_status === 'PENDING' && (
              <div className="space-y-2">
                <button
                  onClick={() => handleUpdateStatus('faculty', 'APPROVED')}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </button>
                <button
                  onClick={() => handleUpdateStatus('faculty', 'REJECTED')}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
              </div>
            )}
          </div>

          {/* Industry Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Status</h3>
            
            <div className="flex items-center gap-2 mb-4">
              {getStatusIcon(application.industry_status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.industry_status)}`}>
                {application.industry_status}
              </span>
            </div>

            {canUpdateIndustryStatus && application.industry_status === 'PENDING' && (
              <div className="space-y-2">
                <button
                  onClick={() => handleUpdateStatus('industry', 'APPROVED')}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </button>
                <button
                  onClick={() => handleUpdateStatus('industry', 'REJECTED')}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
              </div>
            )}
          </div>

          {/* Help Card */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Note</h3>
            </div>
            <p className="text-sm text-blue-700">
              Both faculty and industry approval are required for the application to be fully approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
