import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { School, Users, Target, GitCompare } from 'lucide-react';
import { dashboardAPI, userUniversitiesAPI, tasksAPI } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';

export function Orbit() {
  const navigate = useNavigate();

  // Fetch real dashboard statistics
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await dashboardAPI.getStats();
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch user universities count
  const { data: userUniversities } = useQuery({
    queryKey: ['user-universities-count'],
    queryFn: async () => {
      const response = await userUniversitiesAPI.getAll();
      return response.data;
    },
  });

  // Fetch tasks count
  const { data: tasks} = useQuery({
    queryKey: ['tasks-count'],
    queryFn: async () => {
      const response = await tasksAPI.getAll();
      return response.data;
    },
  });

  const stats = dashboardStats || {
    totalSchools: userUniversities?.length || 0,
    totalTasks: tasks?.length || 0,
    completedTasks: tasks?.filter((t: any) => t.status === 'Completed')?.length || 0,
    progress: 0,
    nextDeadline: 'No upcoming deadlines',
    nextSchool: ''
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm">
            Your Smart Application Assistant
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              Master Your
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              College Applications
            </span>
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Master your college applications with advanced algorithm matching, peer benchmarks, and intelligent planning. 
            Compare schools side-by-side, track your progress against other applicants, and never miss a deadline.
          </p>
        </div>

        {/* Feature Cards - Interactive Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Manage Schools */}
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300"
            onClick={() => navigate('/manage-schools')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <School className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Manage Schools</span>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                  {stats.totalSchools || 0}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Add universities and set application deadlines. Tasks auto-generate for each school.
              </p>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                Get Started →
              </div>
            </CardContent>
          </Card>

          {/* Compare Universities */}
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300"
            onClick={() => navigate('/compare')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <GitCompare className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Compare</span>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                  Universities
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Side-by-side comparison of your target schools with rankings, deadlines, and progress.
              </p>
              <div className="flex items-center text-green-600 text-sm font-medium">
                Compare Now →
              </div>
            </CardContent>
          </Card>

          {/* Peer Insights */}
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300"
            onClick={() => navigate('/peer-insights')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Peer Insights</span>
                </div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-semibold">
                  Anonymized
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                See how fellow applicants are progressing and get realistic benchmarks for your applications.
              </p>
              <div className="flex items-center text-purple-600 text-sm font-medium">
                View Insights →
              </div>
            </CardContent>
          </Card>

          {/* Quick Assessment */}
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-300"
            onClick={() => navigate('/recommendations')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Get Matched</span>
                </div>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-semibold">
                  Algorithm Matching
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Take an assessment to get personalized university recommendations based on your profile.
              </p>
              <div className="flex items-center text-orange-600 text-sm font-medium">
                Start Assessment →
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Planner Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4">
            Application Planner
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your all-in-one platform for managing college applications. Get personalized university matches, 
            compare programs, learn from peer insights, and stay organized with automated task generation.
          </p>
        </div>
      </div>
    </div>
  );
}

