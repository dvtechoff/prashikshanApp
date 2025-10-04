import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  BookOpen, 
  BarChart3, 
  Award, 
  Target, 
  Bell, 
  User,
  Users
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['STUDENT', 'FACULTY', 'INDUSTRY', 'ADMIN'] },
  { name: 'Applications', href: '/applications', icon: FileText, roles: ['STUDENT', 'FACULTY', 'INDUSTRY'] },
  { name: 'Internships', href: '/internships', icon: Briefcase, roles: ['STUDENT', 'FACULTY', 'INDUSTRY'] },
  { name: 'Logbook', href: '/logbook', icon: BookOpen, roles: ['STUDENT', 'FACULTY'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['FACULTY', 'ADMIN'] },
  { name: 'Credits', href: '/credits', icon: Award, roles: ['STUDENT', 'FACULTY'] },
  { name: 'Skill Readiness', href: '/skill-readiness', icon: Target, roles: ['STUDENT'] },
  { name: 'User Management', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
  { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['STUDENT', 'FACULTY', 'INDUSTRY', 'ADMIN'] },
  { name: 'Profile', href: '/profile', icon: User, roles: ['STUDENT', 'FACULTY', 'INDUSTRY', 'ADMIN'] },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuthStore();

  const userRole = user?.role || 'STUDENT';
  const filteredNavigation = navigation.filter(item => item.roles.includes(userRole));

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-gray-900">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Logo */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Prashikshan</h1>
              <p className="text-gray-400 text-xs">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
