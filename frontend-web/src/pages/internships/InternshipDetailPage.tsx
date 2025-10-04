import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Award,
  Briefcase,
  Building,
  Loader,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getInternship } from '@/lib/internships';
import { applyForInternship } from '@/lib/applications';
import type { Internship } from '@/lib/types';

export default function InternshipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInternship();
    }
  }, [id]);

  const fetchInternship = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getInternship(id);
      setInternship(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load internship details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!internship) return;
    
    setApplying(true);
    setApplyError('');
    setApplySuccess(false);

    try {
      await applyForInternship({
        internship_id: internship.id,
        resume_snapshot_url: null,
      });
      setApplySuccess(true);
      setTimeout(() => navigate('/applications'), 2000);
    } catch (err: any) {
      setApplyError(err.response?.data?.detail || 'Failed to apply for internship');
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/internships')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Internships
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error || 'Internship not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/internships')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Internships
      </button>

      {/* Success Message */}
      {applySuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">
            ✓ Application submitted successfully! Redirecting...
          </p>
        </div>
      )}

      {/* Error Message */}
      {applyError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{applyError}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {internship.title}
                </h1>
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    internship.status === 'OPEN'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {internship.status}
                </span>
              </div>
              <Briefcase className="w-12 h-12 text-blue-600" />
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {internship.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">
                      {internship.remote ? 'Remote' : internship.location}
                    </p>
                  </div>
                </div>
              )}

              {internship.stipend !== null && internship.stipend !== undefined && (
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Stipend</p>
                    <p className="font-medium text-gray-900">₹{internship.stipend}/mo</p>
                  </div>
                </div>
              )}

              {internship.duration_weeks && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-medium text-gray-900">{internship.duration_weeks} weeks</p>
                  </div>
                </div>
              )}

              {internship.credits !== null && internship.credits !== undefined && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Award className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Credits</p>
                    <p className="font-medium text-gray-900">{internship.credits}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {internship.description && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{internship.description}</p>
            </div>
          )}

          {/* Skills Required */}
          {internship.skills && internship.skills.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {internship.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          {/* Apply Button */}
          {user?.role === 'STUDENT' && internship.status === 'OPEN' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <button
                onClick={handleApply}
                disabled={applying || applySuccess}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {applying ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    Applying...
                  </span>
                ) : applySuccess ? (
                  '✓ Applied'
                ) : (
                  'Apply Now'
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Your profile will be reviewed by faculty and industry
              </p>
            </div>
          )}

          {/* Additional Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
            <div className="space-y-4">
              {internship.start_date && (
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Start Date</span>
                  </div>
                  <p className="text-gray-900 ml-6">{formatDate(internship.start_date)}</p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Building className="w-4 h-4" />
                  <span className="text-sm font-medium">Posted By</span>
                </div>
                <p className="text-gray-900 ml-6">Industry Partner</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Posted On</span>
                </div>
                <p className="text-gray-900 ml-6">{formatDate(internship.created_at)}</p>
              </div>

              {internship.remote && (
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                    <MapPin className="w-4 h-4" />
                    Remote Work Available
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-700 mb-4">
              If you have questions about this internship, contact your faculty coordinator.
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Contact Support →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
