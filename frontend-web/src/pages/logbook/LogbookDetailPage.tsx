import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Calendar,
  FileText,
  CheckCircle,
  Loader,
  AlertCircle,
  Download
} from 'lucide-react';
import { getLogbookEntry } from '@/lib/logbook';
import type { LogbookEntry } from '@/lib/types';

export default function LogbookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<LogbookEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchEntry();
    }
  }, [id]);

  const fetchEntry = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getLogbookEntry(id);
      setEntry(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load logbook entry');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getApprovalStatusColor = (approved: boolean) => {
    return approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getApprovalIcon = (approved: boolean) => {
    return approved ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <Clock className="w-5 h-5 text-yellow-600" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/logbook')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Logbook
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error || 'Entry not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <button
        onClick={() => navigate('/logbook')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Logbook
      </button>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Entry Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Logbook Entry
                </h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{formatDate(entry.entry_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{entry.hours} hours</span>
                  </div>
                </div>
              </div>
              <FileText className="w-12 h-12 text-blue-600" />
            </div>

            {/* Approval Status */}
            <div className="flex items-center gap-2 mt-4">
              {getApprovalIcon(entry.approved)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getApprovalStatusColor(entry.approved)}`}>
                {entry.approved ? 'Approved' : 'Pending Approval'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Work Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {entry.description || 'No description provided'}
            </p>
          </div>

          {/* Faculty Comments */}
          {entry.faculty_comments && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Faculty Comments</h2>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{entry.faculty_comments}</p>
              </div>
            </div>
          )}

          {/* Attachments */}
          {entry.attachments && entry.attachments.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Attachments</h2>
              <div className="space-y-2">
                {entry.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-gray-900 font-medium">{attachment.name}</p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-gray-600" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Additional Info */}
        <div className="space-y-6">
          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Hours Worked</p>
                <p className="text-2xl font-bold text-gray-900">{entry.hours}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="text-lg text-gray-900">{formatDate(entry.entry_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg text-gray-900">
                  {entry.approved ? 'Approved' : 'Pending'}
                </p>
              </div>
              {entry.attachments && (
                <div>
                  <p className="text-sm text-gray-600">Attachments</p>
                  <p className="text-lg text-gray-900">{entry.attachments.length}</p>
                </div>
              )}
            </div>
          </div>

          {/* Student Info */}
          {/* Student info would need to be fetched separately if needed */}

          {/* Help Card */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">About Logbook</h3>
            <p className="text-sm text-blue-700">
              Logbook entries must be approved by faculty to count towards credit hours. 
              Typically, 40 hours of approved work equals 1 credit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
