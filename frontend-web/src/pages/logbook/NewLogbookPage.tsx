import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Loader,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { createLogbookEntry } from '@/lib/logbook';
import { listApplications } from '@/lib/applications';
import type { LogbookEntryCreateRequest, ApplicationSummary } from '@/lib/types';

export default function NewLogbookPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  const [formData, setFormData] = useState<LogbookEntryCreateRequest>({
    application_id: '',
    entry_date: new Date().toISOString().split('T')[0],
    hours: 0,
    description: '',
    attachments: []
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoadingApplications(true);
    try {
      const data = await listApplications();
      // Filter only approved applications
      const approved = data.filter(app => 
        app.faculty_status === 'APPROVED' && app.industry_status === 'APPROVED'
      );
      setApplications(approved);
      if (approved.length > 0) {
        setFormData(prev => ({ ...prev, application_id: approved[0].id }));
      }
    } catch (err: any) {
      setError('Failed to load applications');
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.application_id) {
        setError('Please select an application');
        setLoading(false);
        return;
      }

      if (formData.hours <= 0) {
        setError('Hours must be greater than 0');
        setLoading(false);
        return;
      }

      await createLogbookEntry(formData);
      navigate('/logbook');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create logbook entry');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hours' ? parseFloat(value) : value
    }));
  };

  const addAttachment = () => {
    const name = prompt('Enter attachment name:');
    const url = prompt('Enter attachment URL:');
    if (name && url) {
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), { name, url }]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index) || []
    }));
  };

  // Only students can access this page
  if (user?.role !== 'STUDENT') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/logbook')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Only students can create logbook entries.</p>
        </div>
      </div>
    );
  }

  if (loadingApplications) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/logbook')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Logbook
        </button>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800">
              You need at least one approved application to create a logbook entry.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/logbook')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Logbook
        </button>
        <h1 className="text-3xl font-bold text-gray-900">New Logbook Entry</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Application Selection */}
          <div>
            <label htmlFor="application_id" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Application *
              </div>
            </label>
            <select
              id="application_id"
              name="application_id"
              value={formData.application_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {applications.map(app => (
                <option key={app.id} value={app.id}>
                  {app.internship?.title || `Application ${app.id}`}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Select the internship for this entry
            </p>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="entry_date" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Date *
              </div>
            </label>
            <input
              type="date"
              id="entry_date"
              name="entry_date"
              value={formData.entry_date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Hours */}
          <div>
            <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Hours Worked *
              </div>
            </label>
            <input
              type="number"
              id="hours"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              min="0.5"
              max="24"
              step="0.5"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the number of hours worked (0.5 to 24)
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Work Description *
              </div>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              required
              placeholder="Describe the work you did during this time..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Provide a detailed description of your work
            </p>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Optional)
            </label>
            <div className="space-y-2">
              {formData.attachments && formData.attachments.length > 0 && (
                <div className="space-y-2">
                  {formData.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-900">{attachment.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={addAttachment}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Attachment
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Add supporting documents or screenshots
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/logbook')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Entry
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Info Card */}
      <div className="max-w-4xl mx-auto bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Tips for Logbook Entries</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
          <li>Be specific and detailed about your work activities</li>
          <li>Include any challenges faced and solutions found</li>
          <li>Mention skills applied or learned during the work</li>
          <li>Add attachments to support your work (screenshots, documents, etc.)</li>
          <li>Entries must be approved by faculty to count towards credits</li>
        </ul>
      </div>
    </div>
  );
}
