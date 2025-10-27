import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

interface Recommendation {
  id: number;
  name: string;
  country: string;
  world_ranking: number;
  program_type: string;
  field_of_study: string;
  score: number;
  probability: number;
  rank_position: number;
  breakdown: {
    gmat: number;
    gpa: number;
    program: number;
    work: number;
    rank: number;
    acceptance: number;
    cost: number;
    scholarship: number;
    location: number;
    deadline: number;
  };
  explanation: string[];
}

interface RecommendationsData {
  top_universities: Recommendation[];
  algorithm_version: string;
  total_universities_evaluated: number;
  weights_used: any;
}

export function Recommendations() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedUniversity, setSelectedUniversity] = useState<Recommendation | null>(null);
  
  const recommendationsData = location.state?.recommendations as RecommendationsData;
  
  // Safety check for data structure
  const topUniversities = recommendationsData?.top_universities || [];

  const addUniversityMutation = useMutation({
    mutationFn: async (universityId: number) => {
      const response = await api.post('/user-universities', {
        university_id: universityId,
        program_type: topUniversities.find(u => u.id === universityId)?.program_type || 'MBA',
        application_deadline: '2024-12-31' // Default deadline
      });
      return response.data;
    },
    onSuccess: () => {
      navigate('/manage-schools');
    },
    onError: (error) => {
      console.error('Error adding university:', error);
    }
  });

  const handleAddUniversity = (universityId: number) => {
    addUniversityMutation.mutate(universityId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 30) return 'text-green-600';
    if (probability >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!recommendationsData || !topUniversities || topUniversities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Recommendations Found</h1>
          <p className="text-gray-600 mb-6">Please complete the assessment first.</p>
          <button
            onClick={() => navigate('/manage-schools')}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Take Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your University Recommendations
          </h1>
          <p className="text-gray-600">
            Based on your assessment, here are your top {topUniversities.length} university matches.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recommendations List */}
          <div className="lg:col-span-2 space-y-4">
             {topUniversities.map((university) => (
              <div
                key={university.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedUniversity(university)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      #{university.rank_position} {university.name}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {university.country} • {university.program_type} in {university.field_of_study}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        World Ranking: #{university.world_ranking}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(university.score)}`}>
                      {university.score}% Match
                    </div>
                    <div className={`text-sm font-medium mt-1 ${getProbabilityColor(university.probability)}`}>
                      {university.probability}% Admission Probability
                    </div>
                  </div>
                </div>

                {/* Breakdown Bars */}
                <div className="space-y-2 mb-4">
                  <div className="text-sm font-medium text-gray-700">Match Breakdown:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(university.breakdown).slice(0, 6).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 capitalize">
                          {key === 'gmat' ? 'GMAT' : 
                           key === 'gpa' ? 'GPA' : 
                           key === 'program' ? 'Program' :
                           key === 'work' ? 'Work' :
                           key === 'rank' ? 'Rank' :
                           key === 'acceptance' ? 'Acceptance' : key}
                        </span>
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                            <div 
                              className="h-2 bg-blue-500 rounded-full" 
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Explanations */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Why this match:</div>
                  <div className="space-y-1">
                    {university.explanation.slice(0, 2).map((explanation, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        • {explanation}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddUniversity(university.id);
                    }}
                    disabled={addUniversityMutation.isPending}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 text-sm"
                  >
                    {addUniversityMutation.isPending ? 'Adding...' : 'Add to My Schools'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUniversity(university);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Algorithm Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Algorithm Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Universities Evaluated:</span>
                  <span className="font-medium">{recommendationsData?.total_universities_evaluated || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Algorithm Version:</span>
                  <span className="font-medium">{recommendationsData?.algorithm_version || '1.0'}</span>
                </div>
              </div>
            </div>

            {/* Weight Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Priorities
              </h3>
              <div className="space-y-2">
                {Object.entries(recommendationsData?.weights_used || {})
                  .filter(([key]) => key.startsWith('weight_'))
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([key, weight]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace('weight_', '').replace('_', ' ')}
                      </span>
                      <span className="text-sm font-medium">
                        {Math.round((weight as number) * 100)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Next Steps
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/manage-schools')}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  Retake Assessment
                </button>
                <button
                  onClick={() => navigate('/manage-schools')}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                >
                  Manage My Schools
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* University Detail Modal */}
        {selectedUniversity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedUniversity.name}
                    </h2>
                    <p className="text-gray-600">
                      {selectedUniversity.country} • {selectedUniversity.program_type} in {selectedUniversity.field_of_study}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedUniversity(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Match Scores</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedUniversity.breakdown).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {key === 'gmat' ? 'GMAT Score Match' : 
                               key === 'gpa' ? 'GPA Compatibility' : 
                               key === 'program' ? 'Program & Field Match' :
                               key === 'work' ? 'Work Experience Fit' :
                               key === 'rank' ? 'University Ranking' :
                               key === 'acceptance' ? 'Acceptance Probability' :
                               key === 'cost' ? 'Cost Fit' :
                               key === 'scholarship' ? 'Scholarship Opportunities' :
                               key === 'location' ? 'Location Preference' :
                               key === 'deadline' ? 'Deadline Urgency' : key}
                            </span>
                            <span className="text-sm font-medium">{value}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-500 rounded-full" 
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Why This Match</h3>
                    <div className="space-y-2">
                      {selectedUniversity.explanation.map((explanation, idx) => (
                        <div key={idx} className="text-sm text-gray-600">
                          • {explanation}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleAddUniversity(selectedUniversity.id);
                      setSelectedUniversity(null);
                    }}
                    disabled={addUniversityMutation.isPending}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    {addUniversityMutation.isPending ? 'Adding...' : 'Add to My Schools'}
                  </button>
                  <button
                    onClick={() => setSelectedUniversity(null)}
                    className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
