import { useLocation, Link } from 'react-router-dom';
import { Clock, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PendingApprovalPage() {
  const location = useLocation();
  const { email, role } = location.state || {};

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <div className="text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Account Pending Approval
        </h2>

        {/* Message */}
        <div className="space-y-4 text-left">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Registration Successful!
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Your account has been created successfully.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  Waiting for Admin Approval
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  {role === 'FACULTY' 
                    ? 'Faculty accounts require admin verification before you can login. You will receive an email once your account is activated.'
                    : 'Industry accounts require admin verification before you can login. You will receive an email once your account is activated.'
                  }
                </p>
              </div>
            </div>
          </div>

          {email && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Registered Email
                  </p>
                  <p className="text-sm text-gray-600 mt-1 break-all">
                    {email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            What happens next?
          </h3>
          <ol className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="font-medium text-gray-900">1.</span>
              <span>Admin will review your registration details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-gray-900">2.</span>
              <span>You'll receive an email notification once approved</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-gray-900">3.</span>
              <span>Login with your credentials to start using the platform</span>
            </li>
          </ol>
        </div>

        {/* Action Button */}
        <div className="mt-8 space-y-3">
          <Link
            to="/login"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
          >
            Go to Login Page
          </Link>
          <Link
            to="/"
            className="block w-full text-gray-600 hover:text-gray-900 py-2 text-center text-sm font-medium transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* Support Info */}
        <p className="mt-6 text-xs text-gray-500">
          Need help? Contact your system administrator
        </p>
      </div>
    </div>
  );
}
