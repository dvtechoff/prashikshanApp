import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Award,
  CheckCircle,
  Loader,
  AlertCircle,
  BarChart3,
  Lightbulb,
  Briefcase,
  BookOpen
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { listLogbookEntries } from '@/lib/logbook';
import { listApplications } from '@/lib/applications';
import { listInternships } from '@/lib/internships';
import type { LogbookEntry, ApplicationSummary, Internship } from '@/lib/types';

interface SkillData {
  name: string;
  proficiency: number;
  hoursLogged: number;
  internshipsApplied: number;
}

export default function SkillReadinessPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entriesData, applicationsData, internshipsData] = await Promise.all([
        listLogbookEntries().catch(() => []),
        listApplications().catch(() => []),
        listInternships({}).catch(() => [])
      ]);
      setEntries(entriesData);
      setApplications(applicationsData);
      setInternships(internshipsData);
    } catch (err: any) {
      setError('Failed to load skill readiness data');
    } finally {
      setLoading(false);
    }
  };

  // Extract skills from applications and internships
  const extractSkills = (): SkillData[] => {
    const skillMap = new Map<string, SkillData>();

    // Get skills from all internships the user has applied to
    applications.forEach(app => {
      if (app.internship_id) {
        const internship = internships.find(i => i.id === app.internship_id);
        if (internship?.skills) {
          internship.skills.forEach(skill => {
            if (!skillMap.has(skill)) {
              skillMap.set(skill, {
                name: skill,
                proficiency: 0,
                hoursLogged: 0,
                internshipsApplied: 0
              });
            }
            const skillData = skillMap.get(skill)!;
            skillData.internshipsApplied += 1;
          });
        }
      }
    });

    // Calculate proficiency based on hours and applications
    const totalHours = entries.filter(e => e.approved).reduce((sum, e) => sum + e.hours, 0);
    
    skillMap.forEach((skillData) => {
      // Assign proportional hours to each skill
      skillData.hoursLogged = Math.floor(totalHours / skillMap.size);
      // Calculate proficiency (0-100) based on hours and applications
      const hourScore = Math.min((skillData.hoursLogged / 100) * 70, 70); // Max 70 from hours
      const appScore = Math.min(skillData.internshipsApplied * 10, 30); // Max 30 from applications
      skillData.proficiency = Math.round(hourScore + appScore);
    });

    return Array.from(skillMap.values()).sort((a, b) => b.proficiency - a.proficiency);
  };

  const skills = extractSkills();

  // Calculate overall metrics
  const totalHours = entries.filter(e => e.approved).reduce((sum, e) => sum + e.hours, 0);
  const totalApplications = applications.length;
  const approvedApplications = applications.filter(
    app => app.faculty_status === 'APPROVED' && app.industry_status === 'APPROVED'
  ).length;
  const overallReadiness = skills.length > 0
    ? Math.round(skills.reduce((sum, s) => sum + s.proficiency, 0) / skills.length)
    : 0;

  const getReadinessLevel = (score: number) => {
    if (score >= 80) return { label: 'Expert', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { label: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { label: 'Intermediate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Beginner', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const getProficiencyColor = (proficiency: number) => {
    if (proficiency >= 80) return 'bg-green-500';
    if (proficiency >= 60) return 'bg-blue-500';
    if (proficiency >= 40) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Skill Readiness</h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'STUDENT' && 'Track your skill development and career readiness'}
          {user?.role === 'FACULTY' && 'Monitor student skill progression'}
          {(user?.role === 'INDUSTRY' || user?.role === 'ADMIN') && 'View skill readiness metrics'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Overall Readiness Score */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Overall Skill Readiness</h2>
            <p className="text-blue-100 mb-4">
              Based on {skills.length} skills tracked across {totalApplications} applications
            </p>
            <div className="flex items-center gap-3">
              <div className="text-6xl font-bold">{overallReadiness}%</div>
              <div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getReadinessLevel(overallReadiness).bg} ${getReadinessLevel(overallReadiness).color}`}>
                  {getReadinessLevel(overallReadiness).label}
                </div>
              </div>
            </div>
          </div>
          <Target className="w-24 h-24 opacity-30" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{totalApplications}</div>
          <p className="text-sm text-gray-600">Applications</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{approvedApplications}</div>
          <p className="text-sm text-gray-600">Approved</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{totalHours}</div>
          <p className="text-sm text-gray-600">Hours Logged</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{skills.length}</div>
          <p className="text-sm text-gray-600">Skills Tracked</p>
        </div>
      </div>

      {/* Skills Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Skills Proficiency</h2>
            <p className="text-sm text-gray-600">Based on internship experience and hours logged</p>
          </div>
          <BarChart3 className="w-8 h-8 text-gray-600" />
        </div>

        <div className="space-y-4">
          {skills.length === 0 ? (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No skills data available yet</p>
              <p className="text-sm text-gray-400">
                Apply for internships and log hours to track your skill development
              </p>
              {user?.role === 'STUDENT' && (
                <button
                  onClick={() => navigate('/internships')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Internships
                </button>
              )}
            </div>
          ) : (
            skills.map((skill) => {
              const level = getReadinessLevel(skill.proficiency);
              return (
                <div key={skill.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${level.bg} ${level.color}`}>
                          {level.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>{skill.hoursLogged} hours</span>
                        <span>•</span>
                        <span>{skill.internshipsApplied} internships</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{skill.proficiency}%</div>
                    </div>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                      <div
                        style={{ width: `${skill.proficiency}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getProficiencyColor(skill.proficiency)} transition-all duration-500`}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
          <h2 className="text-xl font-semibold text-gray-900">Recommendations</h2>
        </div>
        <div className="space-y-3">
          {overallReadiness < 50 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Apply to more internships:</strong> Increase your skill exposure by applying to diverse opportunities.
              </p>
            </div>
          )}
          {totalHours < 40 && user?.role === 'STUDENT' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Log more hours:</strong> Consistent work hours help build proficiency. Aim for at least 40 hours to earn your first credit.
              </p>
            </div>
          )}
          {approvedApplications === 0 && totalApplications > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>Follow up on applications:</strong> Your applications are pending review. Stay in touch with faculty and industry partners.
              </p>
            </div>
          )}
          {overallReadiness >= 80 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Excellent progress!</strong> You're demonstrating strong skill development. Consider taking on leadership roles or mentoring peers.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">About Skill Readiness</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
          <li>Skill proficiency is calculated based on hours logged and internship applications</li>
          <li>Regularly update your logbook to track progress accurately</li>
          <li>Diverse internship experiences help develop a broader skill set</li>
          <li>Faculty-approved hours contribute more to your proficiency score</li>
          <li>Expert level (80%+) indicates strong career readiness in that skill</li>
        </ul>
      </div>
    </div>
  );
}
