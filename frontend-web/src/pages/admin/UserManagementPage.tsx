import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../lib/admin';
import { useAuthStore } from '../../store/authStore';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Building2,
  UserCheck,
  UserX,
  Trash2,
  AlertCircle,
  CheckCircle,
  Shield,
  User,
  Clock,
  X,
} from 'lucide-react';

export default function UserManagementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuthStore();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if not admin
  if (currentUser?.role !== 'ADMIN') {
    navigate('/');
    return null;
  }

  // Fetch user details
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => adminApi.getUserById(userId!),
    enabled: !!userId,
  });

  // Activate user mutation
  const activateMutation = useMutation({
    mutationFn: () => adminApi.activateUser(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSuccessMessage('User activated successfully');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.detail || 'Failed to activate user');
      setSuccessMessage('');
    },
  });

  // Deactivate user mutation
  const deactivateMutation = useMutation({
    mutationFn: () => adminApi.deactivateUser(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSuccessMessage('User deactivated successfully');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.detail || 'Failed to deactivate user');
      setSuccessMessage('');
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteUser(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSuccessMessage('User deleted successfully');
      setErrorMessage('');
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.detail || 'Failed to delete user');
      setSuccessMessage('');
    },
  });

  const handleToggleActive = () => {
    if (user && user.id === currentUser?.id) {
      setErrorMessage('You cannot deactivate your own account');
      setSuccessMessage('');
      return;
    }

    if (user?.is_active) {
      deactivateMutation.mutate();
    } else {
      activateMutation.mutate();
    }
  };

  const handleDelete = () => {
    if (user && user.id === currentUser?.id) {
      setErrorMessage('You cannot delete your own account');
      setSuccessMessage('');
      return;
    }
    setDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'FACULTY':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'INDUSTRY':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'STUDENT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load user details</p>
        </div>
      </div>
    );
  }

  const displayName = user.name || user.industry_profile?.company_name || 'No Name';
  const isSelf = user.id === currentUser?.id;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/users')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          <p className="text-gray-600">View and manage user account</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-red-600 hover:text-red-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* User Profile Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex items-start justify-between -mt-16 mb-4">
            <div className="flex items-end gap-4">
              <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-4xl font-bold">
                  {displayName[0].toUpperCase()}
                </div>
              </div>
              <div className="pb-2">
                <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-16">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full border ${getRoleBadgeColor(user.role)}`}
              >
                <Shield className="w-4 h-4" />
                {user.role}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full ${
                  user.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {user.is_active ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Active
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Inactive
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
          </div>

          {user.phone && (
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{user.phone}</p>
              </div>
            </div>
          )}

          {user.industry_profile?.company_name && (
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-medium text-gray-900">{user.industry_profile.company_name}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="font-medium text-gray-900">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-pink-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-medium text-gray-900">
                {new Date(user.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">User ID</p>
              <p className="font-medium text-gray-900">{user.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleToggleActive}
            disabled={
              isSelf || activateMutation.isPending || deactivateMutation.isPending
            }
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              user.is_active
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {user.is_active ? (
              <>
                <UserX className="w-5 h-5" />
                Deactivate Account
              </>
            ) : (
              <>
                <UserCheck className="w-5 h-5" />
                Activate Account
              </>
            )}
          </button>

          <button
            onClick={handleDelete}
            disabled={isSelf || deleteMutation.isPending}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-5 h-5" />
            Delete Account
          </button>
        </div>

        {isSelf && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              You cannot deactivate or delete your own account.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Are you sure you want to permanently delete <strong>{displayName}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. All user data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
