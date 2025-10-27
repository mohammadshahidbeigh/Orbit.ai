import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userUniversitiesAPI, universitiesAPI } from '@/lib/api';
import { PeerInsights as PeerInsightsComponent, type PeerStats } from '@/components/PeerInsights';
import { UniversityCard } from '@/components/UniversityCard';
import { Users, TrendingUp, BarChart3, Filter, RefreshCw } from 'lucide-react';

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
  daysLeft?: number;
  urgencyLevel?: 'low' | 'medium' | 'high';
}

interface UniversityWithPeerStats extends University {
  peerStats?: PeerStats;
  userProgress?: number;
  userTasksCompleted?: number;
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Universities' },
  { value: 'active', label: 'Active Applications' },
  { value: 'high-ranking', label: 'Top 50 Rankings' },
  { value: 'urgent', label: 'Urgent Deadlines' }
];

const SORT_OPTIONS = [
  { value: 'progress', label: 'Peer Progress' },
  { value: 'sample-size', label: 'Sample Size' },
  { value: 'ranking', label: 'World Ranking' },
  { value: 'deadline', label: 'Application Deadline' },
  { value: 'name', label: 'University Name' }
];

export function PeerInsights() {
  const [selectedFilter, setSelectedFilter] = useState('active');
  const [sortBy, setSortBy] = useState('progress');
  const [viewMode, setViewMode] = useState<'grid' | 'detailed'>('grid');
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch user's universities
  const { data: userUniversitiesResponse, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user-universities-peer-insights'],
    queryFn: () => userUniversitiesAPI.getAll()
  });

  const userUniversities = userUniversitiesResponse?.data || [];

  // Get all university IDs for peer stats
  const universityIds = userUniversities.map((uni: University) => uni.id);

  // Fetch peer stats for all universities
  const { data: peerStatsData, refetch: refetchPeerStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['peer-stats-all', universityIds],
    queryFn: async () => {
      if (universityIds.length === 0) return [];
      
      const statsPromises = universityIds.map(id => 
        universitiesAPI.getPeerStats(id).catch(() => ({ data: null }))
      );
      
      const results = await Promise.all(statsPromises);
      return results.map((result, index) => ({
        university_id: universityIds[index],
        stats: result.data
      }));
    },
    enabled: universityIds.length > 0
  });

  // Combine university data with peer stats
  const universitiesWithStats: UniversityWithPeerStats[] = useMemo(() => {
    return userUniversities.map((uni: University) => {
      const peerStatsEntry = peerStatsData?.find(p => p.university_id === uni.id);
      
      // Mock user progress data (in real app, this would come from tasks API)
      const userProgress = Math.floor(Math.random() * 100);
      const userTasksCompleted = Math.floor(Math.random() * 10);

      return {
        ...uni,
        peerStats: peerStatsEntry?.stats || undefined,
        userProgress,
        userTasksCompleted
      };
    });
  }, [userUniversities, peerStatsData]);

  // Filter universities
  const filteredUniversities = useMemo(() => {
    let filtered = universitiesWithStats;

    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(uni => uni.status === 'Active');
        break;
      case 'high-ranking':
        filtered = filtered.filter(uni => uni.world_ranking && uni.world_ranking <= 50);
        break;
      case 'urgent':
        filtered = filtered.filter(uni => uni.urgencyLevel === 'high');
        break;
      default:
        // 'all' - no filtering
        break;
    }

    return filtered;
  }, [universitiesWithStats, selectedFilter]);

  // Sort universities
  const sortedUniversities = useMemo(() => {
    return [...filteredUniversities].sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          const aProgress = a.peerStats?.avg_progress_percentage || 0;
          const bProgress = b.peerStats?.avg_progress_percentage || 0;
          return bProgress - aProgress;
        case 'sample-size':
          const aSampleSize = a.peerStats?.sample_size || 0;
          const bSampleSize = b.peerStats?.sample_size || 0;
          return bSampleSize - aSampleSize;
        case 'ranking':
          const aRanking = a.world_ranking || 999;
          const bRanking = b.world_ranking || 999;
          return aRanking - bRanking;
        case 'deadline':
          return new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [filteredUniversities, sortBy]);

  // Calculate peer statistics
  const handleCalculateStats = async () => {
    setIsCalculating(true);
    try {
      await universitiesAPI.calculatePeerStats();
      await refetchPeerStats();
    } catch (error) {
      console.error('Failed to calculate peer stats:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Summary statistics
  const summaryStats = useMemo(() => {
    const validStats = sortedUniversities.filter(uni => uni.peerStats);
    const totalSampleSize = validStats.reduce((sum, uni) => sum + (uni.peerStats?.sample_size || 0), 0);
    const avgProgress = validStats.length > 0 
      ? validStats.reduce((sum, uni) => sum + (uni.peerStats?.avg_progress_percentage || 0), 0) / validStats.length
      : 0;
    const avgTasks = validStats.length > 0
      ? validStats.reduce((sum, uni) => sum + (uni.peerStats?.avg_tasks_completed || 0), 0) / validStats.length
      : 0;

    return {
      totalUniversities: sortedUniversities.length,
      universitiesWithData: validStats.length,
      totalSampleSize,
      avgProgress: Math.round(avgProgress),
      avgTasks: Math.round(avgTasks * 100) / 100
    };
  }, [sortedUniversities]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Peer Comparison Insights</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Discover how fellow applicants are progressing with their university applications. 
            Get motivated with anonymized benchmarks and realistic expectations.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium text-gray-900">Universities Tracked</h3>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {summaryStats.universitiesWithData}/{summaryStats.totalUniversities}
            </div>
            <p className="text-sm text-gray-600">with peer data</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-green-500" />
              <h3 className="font-medium text-gray-900">Total Students</h3>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {summaryStats.totalSampleSize.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">in sample data</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <h3 className="font-medium text-gray-900">Avg Progress</h3>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {summaryStats.avgProgress}%
            </div>
            <p className="text-sm text-gray-600">across all peers</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-5 w-5 text-purple-500" />
              <h3 className="font-medium text-gray-900">Avg Tasks</h3>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {summaryStats.avgTasks}
            </div>
            <p className="text-sm text-gray-600">completed per student</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FILTER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 text-sm rounded ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-3 py-1 text-sm rounded ${viewMode === 'detailed' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
                >
                  Detailed View
                </button>
              </div>

              {/* Refresh Stats Button */}
              <button
                onClick={handleCalculateStats}
                disabled={isCalculating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} />
                {isCalculating ? 'Calculating...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {sortedUniversities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Universities Found</h3>
            <p className="text-gray-600 mb-4">
              {selectedFilter === 'active' 
                ? 'You don\'t have any active university applications yet.'
                : 'No universities match your current filter criteria.'
              }
            </p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Add Universities
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedUniversities.map((university) => (
                  <UniversityCard
                    key={university.id}
                    university={university}
                    showPeerInsights={true}
                    compact={true}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {sortedUniversities.map((university) => (
                  <div key={university.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{university.name}</h3>
                          <p className="text-sm text-gray-600">
                            {university.country} • {university.program_type}
                            {university.world_ranking && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                #{university.world_ranking}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Deadline</div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(university.application_deadline).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <PeerInsightsComponent
                        stats={university.peerStats || null}
                        universityName={university.name}
                        userProgress={university.userProgress || 0}
                        userTasksCompleted={university.userTasksCompleted || 0}
                        showComparison={true}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading overlay for stats calculation */}
        {isLoadingStats && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <span>Loading peer statistics...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
