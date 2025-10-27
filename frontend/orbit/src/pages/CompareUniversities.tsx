import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userUniversitiesAPI } from '@/lib/api';

interface University {
  id: number;
  name: string;
  country: string;
  world_ranking?: number;
  program_type: string;
  application_deadline: string;
  status: string;
  university_name?: string;
  assessmentScore?: number;
  assessmentBreakdown?: Record<string, number>;
  assessmentData?: any;
  daysLeft?: number;
  urgencyLevel?: 'low' | 'medium' | 'high';
}

interface ComparisonUniversity extends University {
  tasksRemaining: number;
  daysLeft: number;
  urgencyLevel: 'low' | 'medium' | 'high';
  taskBreakdown: Record<string, number>;
  assessmentScore?: number;
  assessmentBreakdown?: Record<string, number>;
  assessmentData?: any;
}

const URGENCY_COLORS = {
  low: 'text-green-600 bg-green-100',
  medium: 'text-yellow-600 bg-yellow-100', 
  high: 'text-red-600 bg-red-100'
};

const SORT_OPTIONS = [
  { value: 'ranking', label: 'World Ranking' },
  { value: 'deadline', label: 'Application Deadline' },
  { value: 'tasks', label: 'Tasks Remaining' },
  { value: 'days', label: 'Days Left' },
  { value: 'name', label: 'University Name' },
  { value: 'assessment', label: 'Assessment Score' }
];

export function CompareUniversities() {
  const [selectedUniversities, setSelectedUniversities] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<string>('ranking');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch user's universities with comparison data
  const { data: userUniversitiesResponse, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user-universities-comparison'],
    queryFn: () => userUniversitiesAPI.getComparisonData()
  });

  // Extract data from API responses
  const userUniversities = userUniversitiesResponse?.data || [];

  // Calculate comparison data
  const comparisonData = React.useMemo(() => {
    return selectedUniversities.map(uniId => {
      const userUni = userUniversities.find((u: any) => u.id === uniId);
      if (!userUni) return null;

      // Mock task breakdown (in real app, this would come from API)
      const taskBreakdown = {
        'Research': Math.floor(Math.random() * 3),
        'Standardized Tests': Math.floor(Math.random() * 2),
        'Essays': Math.floor(Math.random() * 4),
        'Resume': Math.floor(Math.random() * 2),
        'Recommendations': Math.floor(Math.random() * 3),
        'Submission & Review': Math.floor(Math.random() * 2),
        'Enrollment': Math.floor(Math.random() * 2)
      };

      const tasksRemaining = Object.values(taskBreakdown).reduce((sum, count) => sum + count, 0);

      return {
        ...userUni,
        tasksRemaining,
        taskBreakdown
      };
    }).filter(Boolean) as ComparisonUniversity[];
  }, [selectedUniversities, userUniversities]);

  // Sort comparison data
  const sortedData = React.useMemo(() => {
    return [...comparisonData].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'ranking':
          aValue = a.world_ranking || 999;
          bValue = b.world_ranking || 999;
          break;
        case 'deadline':
          aValue = new Date(a.application_deadline).getTime();
          bValue = new Date(b.application_deadline).getTime();
          break;
        case 'tasks':
          aValue = a.tasksRemaining;
          bValue = b.tasksRemaining;
          break;
        case 'days':
          aValue = a.daysLeft;
          bValue = b.daysLeft;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'assessment':
          aValue = a.assessmentScore || 0;
          bValue = b.assessmentScore || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [comparisonData, sortBy, sortOrder]);

  const handleUniversityToggle = (uniId: number) => {
    setSelectedUniversities(prev => 
      prev.includes(uniId) 
        ? prev.filter(id => id !== uniId)
        : [...prev, uniId].slice(0, 5) // Max 5 universities
    );
  };

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-gray-200 rounded-lg h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">University Comparison</h1>
          <p className="text-gray-600">Compare up to 5 universities side-by-side with rankings, deadlines, and workload analysis.</p>
        </div>

        {/* University Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Universities to Compare</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userUniversities.map((university: University) => (
              <label
                key={university.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedUniversities.includes(university.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedUniversities.includes(university.id)}
                  onChange={() => handleUniversityToggle(university.id)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={!selectedUniversities.includes(university.id) && selectedUniversities.length >= 5}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {university.name || university.university_name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {university.country} • {university.program_type}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {university.world_ranking && (
                      <span className="text-xs text-blue-600 font-medium">
                        Rank #{university.world_ranking}
                      </span>
                    )}
                    {university.assessmentScore && (
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        university.assessmentScore >= 80 ? 'bg-green-100 text-green-800' :
                        university.assessmentScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {university.assessmentScore.toFixed(1)}% fit
                      </span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
          {userUniversities.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">🏫</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No universities added yet</h3>
              <p className="text-gray-600 mb-4">Add universities to your list to start comparing them.</p>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Manage Schools
              </button>
            </div>
          )}
        </div>

        {/* Comparison Controls */}
        {selectedUniversities.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Comparing {selectedUniversities.length} universities
                </span>
                <button
                  onClick={() => setSelectedUniversities([])}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear Selection
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {selectedUniversities.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      University
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ranking
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Left
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasks Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task Breakdown
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedData.map((university) => (
                    <tr key={university.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {university.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {university.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {university.country} • {university.program_type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {university.world_ranking ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            #{university.world_ranking}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(university.application_deadline).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${URGENCY_COLORS[university.urgencyLevel]}`}>
                          {university.daysLeft} days
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {university.tasksRemaining}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {university.assessmentScore ? (
                          <div className="flex flex-col items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              university.assessmentScore >= 80 ? 'bg-green-100 text-green-800' :
                              university.assessmentScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {university.assessmentScore.toFixed(1)}%
                            </span>
                            {university.assessmentBreakdown && (
                              <div className="mt-1 text-xs text-gray-500">
                                Fit Score
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No assessment</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(university.taskBreakdown).map(([phase, count]) => (
                            count > 0 && (
                              <span
                                key={phase}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                title={`${phase}: ${count} tasks`}
                              >
                                {phase.split(' ')[0]}: {count}
                              </span>
                            )
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          View Tasks
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Export Options */}
        {selectedUniversities.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Comparison</h3>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Export as PDF
              </button>
              <button className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                Export as CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
