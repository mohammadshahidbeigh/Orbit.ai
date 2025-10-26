import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, GraduationCap, CheckCircle, Calendar } from 'lucide-react';

export function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await dashboardAPI.getStats();
      return response.data;
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your application progress overview</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Schools</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUniversities || 0}</div>
            <p className="text-xs text-muted-foreground">Active applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTasks || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.completedTasks || 0} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.progress || 0}%</div>
            <p className="text-xs text-muted-foreground">Overall completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Deadline</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats?.nextDeadline ? (
              <>
                <div className="text-2xl font-bold">{stats.nextDeadline.daysUntil || 0}</div>
                <p className="text-xs text-muted-foreground">
                  days • {stats.nextDeadline.university}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">No upcoming deadlines</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Breakdown</CardTitle>
            <CardDescription>Tasks by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">To Do</span>
                <span className="text-2xl font-bold">{stats?.taskStatus?.todo || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In Progress</span>
                <span className="text-2xl font-bold">{stats?.taskStatus?.inProgress || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed</span>
                <span className="text-2xl font-bold">{stats?.taskStatus?.completed || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {stats?.overdueTasks > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Overdue Tasks</CardTitle>
              <CardDescription>Tasks that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive mb-2">
                {stats.overdueTasks}
              </div>
              <p className="text-sm text-muted-foreground">
                Tasks past their due date
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => (window.location.href = '/manage-schools')}>
              Manage Schools
            </Button>
            <Button onClick={() => (window.location.href = '/task-board')} variant="outline">
              View Task Board
            </Button>
            <Button onClick={() => (window.location.href = '/timeline')} variant="outline">
              View Timeline
            </Button>
            <Button onClick={() => (window.location.href = '/compare')} variant="outline">
              Compare Universities
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

