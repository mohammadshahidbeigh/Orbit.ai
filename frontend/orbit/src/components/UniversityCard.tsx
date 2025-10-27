import { useQuery } from '@tanstack/react-query';
import { universitiesAPI } from '@/lib/api';
import { PeerInsights } from './PeerInsights';
import { MapPin, Calendar, Star, Zap } from 'lucide-react';

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

interface UniversityCardProps {
  university: University;
  onClick?: () => void;
  showPeerInsights?: boolean;
  compact?: boolean;
}

const URGENCY_COLORS = {
  low: 'text-green-600 bg-green-100',
  medium: 'text-yellow-600 bg-yellow-100',
  high: 'text-red-600 bg-red-100'
};

export function UniversityCard({ 
  university, 
  onClick, 
  showPeerInsights = false, 
  compact = false 
}: UniversityCardProps) {
  // Fetch peer stats for this university if requested
  const { data: peerStatsData } = useQuery({
    queryKey: ['peer-stats', university.id],
    queryFn: () => universitiesAPI.getPeerStats(university.id),
    enabled: showPeerInsights
  });

  const peerStats = peerStatsData?.data || null;

  // Calculate user progress (mock data for now)
  const userProgress = Math.floor(Math.random() * 100);
  const userTasksCompleted = Math.floor(Math.random() * 10);

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      } ${compact ? 'p-4' : 'p-6'}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 truncate ${compact ? 'text-base' : 'text-lg'}`}>
            {university.name || university.university_name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{university.country}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-600">{university.program_type}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {university.world_ranking && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              #{university.world_ranking}
            </span>
          )}
          
          {university.assessmentScore && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              university.assessmentScore >= 80 ? 'bg-green-100 text-green-800' :
              university.assessmentScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              <Star className="h-3 w-3 mr-1" />
              {university.assessmentScore.toFixed(1)}% fit
            </span>
          )}
        </div>
      </div>

      {/* Key Information */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">Deadline</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {new Date(university.application_deadline).toLocaleDateString()}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 mb-1">
            <Zap className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">Status</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              university.urgencyLevel ? URGENCY_COLORS[university.urgencyLevel] : 'bg-gray-100 text-gray-800'
            }`}>
              {university.daysLeft ? `${university.daysLeft} days left` : 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Peer Insights */}
      {showPeerInsights && (
        <div className="border-t pt-4 mt-4">
          <PeerInsights
            stats={peerStats}
            universityName={university.name || university.university_name || 'Unknown'}
            userProgress={userProgress}
            userTasksCompleted={userTasksCompleted}
            compact={true}
            showComparison={false}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 pt-4 border-t">
        <button 
          className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // Handle view tasks action
          }}
        >
          View Tasks
        </button>
        
        <button 
          className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // Handle view details action
          }}
        >
          Details
        </button>
      </div>
    </div>
  );
}
