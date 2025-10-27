import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();
const USER_ID = 'demo-user';

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Total universities
    const { count: universitiesCount } = await supabase
      .from('user_universities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', USER_ID)
      .eq('status', 'Active');
    
    // Get all tasks for the user
    const { data: allTasks } = await supabase
      .from('tasks')
      .select(`
        *,
        user_universities!inner (user_id, status)
      `)
      .eq('user_universities.user_id', USER_ID)
      .eq('user_universities.status', 'Active');

    const totalTasks = allTasks?.length || 0;
    const completedTasks = allTasks?.filter(t => t.status === 'Completed').length || 0;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Next deadline
    const { data: nextDeadline } = await supabase
      .from('user_universities')
      .select(`
        *,
        universities (*)
      `)
      .eq('user_id', USER_ID)
      .eq('status', 'Active')
      .gte('application_deadline', new Date().toISOString().split('T')[0])
      .order('application_deadline', { ascending: true })
      .limit(1)
      .single();

    let daysUntilDeadline = null;
    if (nextDeadline) {
      const deadline = new Date(nextDeadline.application_deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadline.setHours(0, 0, 0, 0);
      daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    }

    // Tasks by status
    const taskStatus = {
      todo: allTasks?.filter(t => t.status === 'To Do').length || 0,
      inProgress: allTasks?.filter(t => t.status === 'In Progress').length || 0,
      completed: allTasks?.filter(t => t.status === 'Completed').length || 0
    };

    // Overdue tasks
    const overdueTasks = allTasks?.filter(t => {
      if (t.status === 'Completed') return false;
      if (!t.due_date) return false;
      const dueDate = new Date(t.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length || 0;

    res.json({
      totalUniversities: universitiesCount || 0,
      totalTasks,
      completedTasks,
      progress,
      nextDeadline: nextDeadline ? {
        university: nextDeadline.universities?.name,
        deadline: nextDeadline.application_deadline,
        daysUntil: daysUntilDeadline
      } : null,
      taskStatus,
      overdueTasks
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
