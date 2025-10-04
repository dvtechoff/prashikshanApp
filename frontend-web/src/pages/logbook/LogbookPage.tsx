import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { listLogbookEntries } from '@/lib/logbook';
import type { LogbookEntry } from '@/lib/types';

export default function LogbookPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await listLogbookEntries();
      setEntries(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load logbook entries');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredEntries = entries.filter((entry) => {
    if (filter === 'ALL') return true;
    if (filter === 'APPROVED') return entry.approved;
    return !entry.approved;
  });

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const approvedHours = entries
    .filter((entry) => entry.approved)
    .reduce((sum, entry) => sum + entry.hours, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logbook</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'STUDENT' && 'Track your daily internship activities'}
            {user?.role === 'FACULTY' && 'Review and approve student logbook entries'}
            {(user?.role === 'INDUSTRY' || user?.role === 'ADMIN') && 'View student logbook entries'}
          </p>
        </div>
        {user?.role === 'STUDENT' && (
          <button
            onClick={() => navigate('/logbook/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Entry
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{totalHours}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-lg p-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved Hours</p>
              <p className="text-2xl font-bold text-gray-900">{approvedHours}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-lg p-3">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md p-2 flex gap-2">
        {(['ALL', 'APPROVED', 'PENDING'] as const).map((status) => (
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

      {/* Entries List */}
      {!loading && !error && (
        <>
          {filteredEntries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No logbook entries found
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'ALL'
                  ? 'Start logging your internship activities'
                  : `No ${filter.toLowerCase()} entries`}
              </p>
              {user?.role === 'STUDENT' && (
                <button
                  onClick={() => navigate('/logbook/new')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create First Entry
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/logbook/${entry.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Date and Hours */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">{formatDate(entry.entry_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{entry.hours} hours</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-700 mb-3 line-clamp-2">{entry.description}</p>

                      {/* Faculty Comments */}
                      {entry.faculty_comments && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            Faculty Comments:
                          </p>
                          <p className="text-sm text-blue-700">{entry.faculty_comments}</p>
                        </div>
                      )}

                      {/* Attachments */}
                      {entry.attachments && entry.attachments.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {entry.attachments.length} attachment
                            {entry.attachments.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="ml-4">
                      {entry.approved ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Approved</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
