import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Lock, Phone, Building2, GraduationCap, 
  Briefcase, UserPlus, AlertCircle, Eye, EyeOff 
} from 'lucide-react';
import { register } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole | '';
  phone: string;
  university: string;
  college_id: string;
  // Student fields
  enrollment_no: string;
  course: string;
  year: string;
  // Faculty fields
  designation: string;
  department: string;
  faculty_id: string;
  // Industry fields
  company_name: string;
  company_website: string;
  contact_person_name: string;
  contact_number: string;
  company_address: string;
}

export default function SignUpPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone: '',
    university: '',
    college_id: '',
    enrollment_no: '',
    course: '',
    year: '',
    designation: '',
    department: '',
    faculty_id: '',
    company_name: '',
    company_website: '',
    contact_person_name: '',
    contact_number: '',
    company_address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Role-specific validation
    if (formData.role === 'STUDENT') {
      if (!formData.university) {
        setError('University is required for students');
        return false;
      }
    } else if (formData.role === 'FACULTY') {
      if (!formData.phone || !formData.designation) {
        setError('Phone and designation are required for faculty');
        return false;
      }
    } else if (formData.role === 'INDUSTRY') {
      if (!formData.company_name || !formData.contact_person_name || !formData.contact_number) {
        setError('Company details are required for industry users');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare the registration payload based on role
      const payload: any = {
        name: formData.name,
        email: formData.email.toLowerCase(),
        password: formData.password,
        role: formData.role,
        phone: formData.phone || undefined,
        university: formData.university || undefined,
        college_id: formData.college_id || undefined,
      };

      // Add role-specific profile data
      if (formData.role === 'STUDENT') {
        payload.student_profile = {
          phone: formData.phone,
          university: formData.university,
          college: formData.college_id,
          enrollment_no: formData.enrollment_no || undefined,
          course: formData.course || undefined,
          year: formData.year || undefined,
        };
      } else if (formData.role === 'FACULTY') {
        payload.faculty_profile = {
          phone: formData.phone,
          university: formData.university,
          college: formData.college_id,
          designation: formData.designation || undefined,
          department: formData.department || undefined,
          faculty_id: formData.faculty_id || undefined,
        };
      } else if (formData.role === 'INDUSTRY') {
        payload.industry_profile = {
          company_name: formData.company_name,
          company_website: formData.company_website || undefined,
          contact_person_name: formData.contact_person_name,
          contact_number: formData.contact_number,
          designation: formData.designation || undefined,
          company_address: formData.company_address || undefined,
        };
      }

      // Register the user - returns UserRead
      await register(payload);

      // Show success message for faculty/industry
      if (formData.role === 'FACULTY' || formData.role === 'INDUSTRY') {
        // Redirect to a pending approval page
        navigate('/pending-approval', { 
          state: { 
            email: formData.email,
            role: formData.role 
          } 
        });
      } else {
        // For students, auto-login
        navigate('/login', { 
          state: { 
            message: 'Account created successfully! Please login to continue.' 
          } 
        });
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.detail || 
        'Registration failed. Please try again or contact support.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <UserPlus className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-600 mt-2">Join Prashikshan - Your Internship Portal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I am a <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
              className={`p-4 border-2 rounded-lg transition-all ${
                formData.role === 'STUDENT'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <GraduationCap className={`w-6 h-6 mx-auto mb-2 ${
                formData.role === 'STUDENT' ? 'text-blue-600' : 'text-gray-600'
              }`} />
              <div className={`text-sm font-medium ${
                formData.role === 'STUDENT' ? 'text-blue-600' : 'text-gray-700'
              }`}>
                Student
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'FACULTY' })}
              className={`p-4 border-2 rounded-lg transition-all ${
                formData.role === 'FACULTY'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <User className={`w-6 h-6 mx-auto mb-2 ${
                formData.role === 'FACULTY' ? 'text-blue-600' : 'text-gray-600'
              }`} />
              <div className={`text-sm font-medium ${
                formData.role === 'FACULTY' ? 'text-blue-600' : 'text-gray-700'
              }`}>
                Faculty
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'INDUSTRY' })}
              className={`p-4 border-2 rounded-lg transition-all ${
                formData.role === 'INDUSTRY'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Briefcase className={`w-6 h-6 mx-auto mb-2 ${
                formData.role === 'INDUSTRY' ? 'text-blue-600' : 'text-gray-600'
              }`} />
              <div className={`text-sm font-medium ${
                formData.role === 'INDUSTRY' ? 'text-blue-600' : 'text-gray-700'
              }`}>
                Industry
              </div>
            </button>
          </div>
        </div>

        {formData.role && (
          <>
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.role === 'INDUSTRY' ? 'Your Name' : 'Full Name'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.edu"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Min. 8 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Re-enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Phone (Required for Faculty, optional for Student) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number {formData.role === 'FACULTY' && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 1234567890"
                    required={formData.role === 'FACULTY'}
                  />
                </div>
              </div>

              {/* University (Required for Student/Faculty) */}
              {(formData.role === 'STUDENT' || formData.role === 'FACULTY') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University {formData.role === 'STUDENT' && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="University name"
                      required={formData.role === 'STUDENT'}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Student-specific fields */}
            {formData.role === 'STUDENT' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enrollment Number
                    </label>
                    <input
                      type="text"
                      name="enrollment_no"
                      value={formData.enrollment_no}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your enrollment number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course
                    </label>
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., B.Tech CSE"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select year</option>
                      <option value="1">First Year</option>
                      <option value="2">Second Year</option>
                      <option value="3">Third Year</option>
                      <option value="4">Fourth Year</option>
                      <option value="5">Fifth Year</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Faculty-specific fields */}
            {formData.role === 'FACULTY' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Faculty Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Assistant Professor"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Faculty ID
                    </label>
                    <input
                      type="text"
                      name="faculty_id"
                      value={formData.faculty_id}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your faculty ID"
                    />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Faculty accounts require admin approval before you can login.
                  </p>
                </div>
              </div>
            )}

            {/* Industry-specific fields */}
            {formData.role === 'INDUSTRY' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your company name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Website
                    </label>
                    <input
                      type="url"
                      name="company_website"
                      value={formData.company_website}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contact_person_name"
                      value={formData.contact_person_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="HR/Recruiter name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+91 1234567890"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Address
                    </label>
                    <input
                      type="text"
                      name="company_address"
                      value={formData.company_address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Full company address"
                    />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Industry accounts require admin approval before you can login.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.role}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
