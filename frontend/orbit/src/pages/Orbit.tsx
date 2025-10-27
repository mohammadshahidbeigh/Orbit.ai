import { useState } from 'react';
import { School, BarChart3, Calendar, TrendingUp } from 'lucide-react';

export function Orbit() {
  const [stats] = useState({
    targetSchools: 3,
    totalTasks: 16,
    tasksRemaining: 16,
    progress: 0,
    nextDeadline: 'Nov 15',
    nextDeadlineSchool: 'University of Washington'
  });

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
            Transform the overwhelming college application process into an organized, manageable
            journey with intelligent task generation, deadline tracking, and progress visualization.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Target Schools */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-600 text-sm font-medium">Target Schools</span>
              <School className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-1">{stats.targetSchools}</div>
            <div className="text-sm text-gray-500">Universities selected</div>
          </div>

          {/* Total Tasks */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-600 text-sm font-medium">Total Tasks</span>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-1">{stats.totalTasks}</div>
            <div className="text-sm text-gray-500">{stats.tasksRemaining} remaining</div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-600 text-sm font-medium">Progress</span>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-1">{stats.progress}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>

          {/* Next Deadline */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-600 text-sm font-medium">Next Deadline</span>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-1">{stats.nextDeadline}</div>
            <div className="text-sm text-gray-500">{stats.nextDeadlineSchool}</div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Manage Schools */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <School className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-semibold text-gray-800">1. Manage Schools</span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">3 added</span>
            </div>
            <p className="text-sm text-gray-600">
              Add universities and set application deadlines. Tasks auto-generate for each school.
            </p>
          </div>

          {/* Kanban Board */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-semibold text-gray-800">2. Kanban Board</span>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">16 tasks</span>
            </div>
            <p className="text-sm text-gray-600">
              Organize and track tasks using visual Kanban workflow with drag-and-drop management.
            </p>
          </div>

          {/* Gantt Timeline */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-semibold text-gray-800">3. Gantt Timeline</span>
              </div>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Visual</span>
            </div>
            <p className="text-sm text-gray-600">
              View deadlines and tasks in an interactive Gantt chart timeline for better planning.
            </p>
          </div>
        </div>

        {/* Application Planner Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4">
            Application Planner
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Streamline your college applications with intelligent planning, visual task management,
            and deadline tracking
          </p>
        </div>
      </div>
    </div>
  );
}

