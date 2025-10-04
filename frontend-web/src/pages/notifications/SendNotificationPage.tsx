import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Users,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Loader,
  ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { createNotification, createBulkNotification } from '@/lib/notifications';

type RecipientType = 'ALL' | 'STUDENTS' | 'FACULTY' | 'INDUSTRY' | 'SPECIFIC';

export default function SendNotificationPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    recipientType: 'STUDENTS' as RecipientType,
    specificUserId: '',
    title: '',
    message: '',
    type: 'INFO' as 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  });

  // Only faculty and admin can access this page
  if (user?.role !== 'FACULTY' && user?.role !== 'ADMIN') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/notifications')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Only faculty and administrators can send notifications.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!formData.title.trim() || !formData.message.trim()) {
        setError('Title and message are required');
        setLoading(false);
        return;
      }

      const notificationPayload = {
        title: formData.title,
        body: formData.message,
        type: formData.type
      };

      if (formData.recipientType === 'SPECIFIC') {
        if (!formData.specificUserId.trim()) {
          setError('Please enter a user ID for specific recipient');
          setLoading(false);
          return;
        }
        await createNotification({
          title: notificationPayload.title,
          body: notificationPayload.body,
          user_id: formData.specificUserId
        });
      } else {
        // Determine user role for bulk notification
        let targetRole: 'STUDENT' | 'FACULTY' | 'INDUSTRY' | undefined;
        if (formData.recipientType === 'STUDENTS') targetRole = 'STUDENT';
        else if (formData.recipientType === 'FACULTY') targetRole = 'FACULTY';
        else if (formData.recipientType === 'INDUSTRY') targetRole = 'INDUSTRY';

        await createBulkNotification({
          title: notificationPayload.title,
          body: notificationPayload.body,
          target_role: targetRole
        });
      }

      setSuccess(true);
      // Reset form
      setFormData({
        recipientType: 'STUDENTS',
        specificUserId: '',
        title: '',
        message: '',
        type: 'INFO'
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/notifications');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'bg-green-100 text-green-800 border-green-300';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ERROR': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/notifications')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Notifications
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Send Notification</h1>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">Notification sent successfully! Redirecting...</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Recipient Type */}
          <div>
            <label htmlFor="recipientType" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Send To *
              </div>
            </label>
            <select
              id="recipientType"
              name="recipientType"
              value={formData.recipientType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="STUDENTS">All Students</option>
              <option value="FACULTY">All Faculty</option>
              <option value="INDUSTRY">All Industry Partners</option>
              <option value="ALL">Everyone</option>
              <option value="SPECIFIC">Specific User</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Choose who should receive this notification
            </p>
          </div>

          {/* Specific User ID (conditional) */}
          {formData.recipientType === 'SPECIFIC' && (
            <div>
              <label htmlFor="specificUserId" className="block text-sm font-medium text-gray-700 mb-2">
                User ID *
              </label>
              <input
                type="text"
                id="specificUserId"
                name="specificUserId"
                value={formData.specificUserId}
                onChange={handleChange}
                placeholder="Enter user ID"
                required={formData.recipientType === 'SPECIFIC'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the specific user's ID to send a personal notification
              </p>
            </div>
          )}

          {/* Notification Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Notification Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="INFO">Information</option>
              <option value="SUCCESS">Success</option>
              <option value="WARNING">Warning</option>
              <option value="ERROR">Error/Alert</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Title *
              </div>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={100}
              required
              placeholder="e.g., Application Deadline Reminder"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              maxLength={500}
              required
              placeholder="Enter your notification message here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.message.length}/500 characters
            </p>
          </div>

          {/* Preview */}
          {(formData.title || formData.message) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className={`border rounded-lg p-4 ${getTypeColor(formData.type)}`}>
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">
                      {formData.title || 'Notification Title'}
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">
                      {formData.message || 'Your message will appear here...'}
                    </p>
                    <p className="text-xs mt-2 opacity-75">Just now</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Info Card */}
      <div className="max-w-4xl mx-auto bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Notification Guidelines</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
          <li>Use INFO type for general announcements and updates</li>
          <li>Use SUCCESS type to congratulate or confirm positive actions</li>
          <li>Use WARNING type for important reminders or cautionary messages</li>
          <li>Use ERROR type for urgent alerts or critical issues</li>
          <li>Keep messages clear, concise, and actionable</li>
          <li>Bulk notifications are sent immediately to all selected users</li>
        </ul>
      </div>
    </div>
  );
}
