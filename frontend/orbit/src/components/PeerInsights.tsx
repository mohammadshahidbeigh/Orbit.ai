import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { TrendingUp, Users, Clock, CheckCircle } from 'lucide-react';

export interface PeerStats {
  university_id: number;
  avg_progress_percentage: number;
  avg_tasks_completed: number;
  avg_days_before_deadline: number;
  sample_size: number;
  last_updated?: string;
}

interface PeerInsightsProps {
  stats: PeerStats | null;
  universityName: string;
  userProgress?: number;
  userTasksCompleted?: number;
  compact?: boolean;
  showComparison?: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export function PeerInsights({ 
  stats, 
  universityName, 
  userProgress = 0, 
  userTasksCompleted = 0,
  compact = false,
  showComparison = true 
}: PeerInsightsProps) {
  if (!stats) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${compact ? 'text-sm' : ''}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <Users className="h-4 w-4" />
          <span>No peer data available</span>
        </div>
      </div>
    );
  }

  const progressComparisonData = [
    {
      name: 'You',
      value: userProgress,
      fill: '#3B82F6'
    },
    {
      name: 'Peers Avg',
      value: stats.avg_progress_percentage,
      fill: '#10B981'
    }
  ];

  const tasksComparisonData = [
    {
      name: 'You',
      value: userTasksCompleted,
      fill: '#3B82F6'
    },
    {
      name: 'Peers Avg',
      value: stats.avg_tasks_completed,
      fill: '#10B981'
    }
  ];

  const radialData = [
    {
      name: 'Progress',
      value: stats.avg_progress_percentage,
      fill: '#3B82F6'
    }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'text-green-600 bg-green-100';
    if (progress >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getComparisonText = (userValue: number, peerValue: number) => {
    const diff = userValue - peerValue;
    if (Math.abs(diff) < 1) return 'Similar to peers';
    return diff > 0 ? `+${diff.toFixed(1)} above peers` : `${Math.abs(diff).toFixed(1)} below peers`;
  };

  if (compact) {
    return (
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            Peer Insights
          </h4>
          <span className="text-xs text-gray-500">
            {stats.sample_size} students
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${getProgressColor(stats.avg_progress_percentage)}`}>
              {stats.avg_progress_percentage}%
            </div>
            <p className="text-xs text-gray-600 mt-1">Avg Progress</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800">
              {stats.avg_tasks_completed}
            </div>
            <p className="text-xs text-gray-600 mt-1">Avg Tasks</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Submit timing:</span>
            <span className="font-medium">{stats.avg_days_before_deadline} days early</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Peer Comparison Insights
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Anonymized data from {stats.sample_size} students applying to {universityName}
          </p>
        </div>
        
        {stats.last_updated && (
          <div className="text-xs text-gray-500">
            Updated {new Date(stats.last_updated).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-blue-900">Average Progress</h4>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-blue-600">
              {stats.avg_progress_percentage}%
            </span>
            {showComparison && (
              <span className="text-sm text-gray-600">
                ({getComparisonText(userProgress, stats.avg_progress_percentage)})
              </span>
            )}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-green-900">Tasks Completed</h4>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-green-600">
              {stats.avg_tasks_completed}
            </span>
            {showComparison && (
              <span className="text-sm text-gray-600">
                ({getComparisonText(userTasksCompleted, stats.avg_tasks_completed)})
              </span>
            )}
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <h4 className="font-medium text-orange-900">Submission Timing</h4>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-orange-600">
              {stats.avg_days_before_deadline}
            </span>
            <span className="text-sm text-orange-700">days early</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Comparison Chart */}
        {showComparison && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Progress Comparison</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Peer Progress Distribution */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Peer Progress Overview</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="40%" 
                outerRadius="80%" 
                data={radialData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar dataKey="value" cornerRadius={10} fill="#3B82F6" />
                <text 
                  x="50%" 
                  y="50%" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="fill-gray-900 text-xl font-bold"
                >
                  {stats.avg_progress_percentage}%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks Comparison Chart */}
        {showComparison && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Tasks Completed</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Tasks']} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Sample Size and Credibility */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Data Credibility</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sample Size:</span>
              <span className="font-medium">{stats.sample_size} students</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Confidence Level:</span>
              <span className="font-medium text-green-600">
                {stats.sample_size > 100 ? 'High' : stats.sample_size > 50 ? 'Medium' : 'Low'}
              </span>
            </div>
            
            <div className="text-xs text-gray-500 mt-2">
              * Data is anonymized and aggregated for privacy protection
            </div>
          </div>
        </div>
      </div>

      {/* Motivation Message */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">💡 Insight</h4>
        <p className="text-sm text-blue-800">
          {userProgress > stats.avg_progress_percentage + 10 
            ? "You're ahead of most peers! Keep up the great work and maintain your momentum."
            : userProgress > stats.avg_progress_percentage - 10
            ? "You're on track with your peers. Steady progress will help you meet your deadlines."
            : "Consider accelerating your progress to match peer benchmarks and reduce deadline pressure."
          }
        </p>
      </div>
    </div>
  );
}
