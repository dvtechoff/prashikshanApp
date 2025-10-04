import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Search,
  Filter,
  Plus,
  Loader,
  Award
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { listInternships } from '@/lib/internships';
import type { Internship, InternshipFilters } from '@/lib/types';

export default function InternshipsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<InternshipFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInternships();
  }, [filters]);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const data = await listInternships(filters);
      setInternships(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm });
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Internships</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'STUDENT' && 'Browse and apply for internship opportunities'}
            {user?.role === 'INDUSTRY' && 'Manage your internship postings'}
            {(user?.role === 'FACULTY' || user?.role === 'ADMIN') && 'View all internship opportunities'}
          </p>
        </div>
        {user?.role === 'INDUSTRY' && (
          <button
            onClick={() => navigate('/internships/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Post Internship
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search internships by title, description, location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          <button
            onClick={() => setFilters({})}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Clear
          </button>
        </div>

        {/* Filter Options */}
        <div className="mt-4 flex gap-4 flex-wrap">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.remote}
              onChange={(e) => setFilters({ ...filters, remote: e.target.checked || undefined })}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Remote Only</span>
          </label>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Min Credits:</label>
            <input
              type="number"
              value={filters.minCredits || ''}
              onChange={(e) => setFilters({ ...filters, minCredits: e.target.value ? Number(e.target.value) : undefined })}
              className="w-20 px-2 py-1 border border-gray-300 rounded"
              placeholder="0"
              min="0"
            />
          </div>
        </div>
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
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Internships Grid */}
      {!loading && !error && (
        <>
          {internships.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No internships found
              </h3>
              <p className="text-gray-600">
                {filters.search || filters.remote || filters.minCredits
                  ? 'Try adjusting your filters to see more results'
                  : 'No internships are currently available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.map((internship) => (
                <div
                  key={internship.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/internships/${internship.id}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {internship.title}
                      </h3>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          internship.status === 'OPEN'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {internship.status}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {internship.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {internship.description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="space-y-2">
                    {internship.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{internship.remote ? 'Remote' : internship.location}</span>
                      </div>
                    )}

                    {internship.stipend !== null && internship.stipend !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>₹{internship.stipend}/month</span>
                      </div>
                    )}

                    {internship.duration_weeks && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{internship.duration_weeks} weeks</span>
                      </div>
                    )}

                    {internship.credits !== null && internship.credits !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Award className="w-4 h-4" />
                        <span>{internship.credits} credits</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {internship.skills && internship.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {internship.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {internship.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{internship.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Posted {formatDate(internship.created_at)}
                    </p>
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
