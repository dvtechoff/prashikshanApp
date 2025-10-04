import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  Loader,
  AlertCircle,
  CheckCircle,
  Send
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { listNotifications, markNotificationAsRead } from '@/lib/notifications';
import type { NotificationPayload } from '@/lib/types';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await listNotifications();
      setNotifications(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      ));
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'UNREAD') return !notif.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with your latest activities
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        {/* Send Notification Button for Faculty/Admin */}
        {(user?.role === 'FACULTY' || user?.role === 'ADMIN') && (
          <button
            onClick={() => navigate('/notifications/send')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-5 h-5" />
            Send Notification
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md p-2 flex gap-2">
        {(['ALL', 'UNREAD'] as const).map((status) => (
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

      {/* Notifications List */}
      {!loading && !error && (
        <>
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <BellOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-gray-600">
                {filter === 'UNREAD'
                  ? 'You\'re all caught up!'
                  : 'You don\'t have any notifications yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer ${
                    !notification.read ? 'border-l-4 border-blue-600' : ''
                  }`}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.read ? 'bg-gray-100' : 'bg-blue-100'
                    }`}>
                      {notification.read ? (
                        <CheckCircle className="w-5 h-5 text-gray-600" />
                      ) : (
                        <Bell className="w-5 h-5 text-blue-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className={`text-base font-semibold mb-1 ${
                            notification.read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          {notification.body && (
                            <p className={`text-sm ${
                              notification.read ? 'text-gray-500' : 'text-gray-600'
                            }`}>
                              {notification.body}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>

                      {/* Payload Data */}
                      {notification.payload && Object.keys(notification.payload).length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <pre className="text-xs text-gray-700 overflow-x-auto">
                            {JSON.stringify(notification.payload, null, 2)}
                          </pre>
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
