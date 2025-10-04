import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import ApplicationsPage from './pages/applications/ApplicationsPage';
import ApplicationDetailPage from './pages/applications/ApplicationDetailPage';
import InternshipsPage from './pages/internships/InternshipsPage';
import InternshipDetailPage from './pages/internships/InternshipDetailPage';
import NewInternshipPage from './pages/internships/NewInternshipPage';
import LogbookPage from './pages/logbook/LogbookPage';
import LogbookDetailPage from './pages/logbook/LogbookDetailPage';
import NewLogbookPage from './pages/logbook/NewLogbookPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import SendNotificationPage from './pages/notifications/SendNotificationPage';
import ProfilePage from './pages/profile/ProfilePage';
import CreditsPage from './pages/credits/CreditsPage';
import SkillReadinessPage from './pages/skill-readiness/SkillReadinessPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import UserManagementPage from './pages/admin/UserManagementPage';

// Temporary placeholder component
const ComingSoon = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Coming Soon</h1>
      <p className="text-gray-600">This page is under development</p>
    </div>
  </div>
);

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ComingSoon />} />
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ComingSoon />} />
      </Route>

      {/* Protected Routes */}
      <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Applications */}
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/applications/:id" element={<ApplicationDetailPage />} />
        
        {/* Internships */}
        <Route path="/internships" element={<InternshipsPage />} />
        <Route path="/internships/new" element={<NewInternshipPage />} />
        <Route path="/internships/:id" element={<InternshipDetailPage />} />
        
        {/* Logbook */}
        <Route path="/logbook" element={<LogbookPage />} />
        <Route path="/logbook/new" element={<NewLogbookPage />} />
        <Route path="/logbook/:id" element={<LogbookDetailPage />} />
        
        {/* Other Features */}
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="/skill-readiness" element={<SkillReadinessPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/notifications/send" element={<SendNotificationPage />} />
        
        {/* Admin */}
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/users/:userId" element={<UserManagementPage />} />
        
        {/* Profile */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<ComingSoon />} />
      </Route>

      {/* Default Route */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default App;
