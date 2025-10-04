import { Outlet } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Branding Section */}
        <div className="hidden lg:block">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Prashikshan</h1>
                <p className="text-gray-600">Internship Management System</p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">
                Streamline Your <span className="text-blue-600">Internship Journey</span>
              </h2>
              <p className="text-lg text-gray-600">
                A comprehensive platform for managing internships, tracking progress, and connecting students with opportunities.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">1000+</div>
                  <div className="text-sm text-gray-600">Active Internships</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-600">500+</div>
                  <div className="text-sm text-gray-600">Companies</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form Section */}
        <div className="w-full">
          <div className="lg:hidden mb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Prashikshan</h1>
            <p className="text-gray-600">Internship Management System</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
