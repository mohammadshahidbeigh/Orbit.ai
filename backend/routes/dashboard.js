import express from 'express';
import { getPool } from '../config/db.js';

const router = express.Router();
const pool = getPool();
const USER_ID = 'demo-user';

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Total universities
    const [universities] = await connection.query(
      'SELECT COUNT(*) as count FROM user_universities WHERE user_id = ? AND status = "Active"',
      [USER_ID]
    );
    
    // Total tasks
    const [tasks] = await connection.query(
      `SELECT COUNT(*) as count FROM tasks t
       JOIN user_universities uu ON t.user_university_id = uu.id
       WHERE uu.user_id = ? AND uu.status = "Active"`,
      [USER_ID]
    );
    
    // Completed tasks
    const [completedTasks] = await connection.query(
      `SELECT COUNT(*) as count FROM tasks t
       JOIN user_universities uu ON t.user_university_id = uu.id
       WHERE uu.user_id = ? AND t.status = "Completed" AND uu.status = "Active"`,
      [USER_ID]
    );
    
    // Progress percentage
    const totalTasks = tasks[0].count;
    const completed = completedTasks[0].count;
    const progress = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
    
    // Next deadline
    const [nextDeadline] = await connection.query(
      `SELECT uu.*, u.name as university_name
       FROM user_universities uu
       JOIN universities u ON uu.university_id = u.id
       WHERE uu.user_id = ? AND uu.status = "Active" AND uu.application_deadline >= CURDATE()
       ORDER BY uu.application_deadline ASC
       LIMIT 1`,
      [USER_ID]
    );
    
    // Days until next deadline
    let daysUntilDeadline = null;
    if (nextDeadline.length > 0) {
      const deadline = new Date(nextDeadline[0].application_deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadline.setHours(0, 0, 0, 0);
      daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    }
    
    // Tasks by status
    const [taskStatus] = await connection.query(
      `SELECT status, COUNT(*) as count FROM tasks t
       JOIN user_universities uu ON t.user_university_id = uu.id
       WHERE uu.user_id = ? AND uu.status = "Active"
       GROUP BY status`,
      [USER_ID]
    );
    
    // Overdue tasks
    const [overdueTasks] = await connection.query(
      `SELECT COUNT(*) as count FROM tasks t
       JOIN user_universities uu ON t.user_university_id = uu.id
       WHERE uu.user_id = ? AND uu.status = "Active" AND t.status != "Completed" 
       AND t.due_date < CURDATE()`,
      [USER_ID]
    );
    
    connection.release();
    
    res.json({
      totalUniversities: universities[0].count,
      totalTasks: totalTasks,
      completedTasks: completed[0].count,
      progress,
      nextDeadline: nextDeadline.length > 0 ? {
        university: nextDeadline[0].university_name,
        deadline: nextDeadline[0].application_deadline,
        daysUntil: daysUntilDeadline
      } : null,
      taskStatus: {
        todo: taskStatus.find(s => s.status === 'To Do')?.count || 0,
        inProgress: taskStatus.find(s => s.status === 'In Progress')?.count || 0,
        completed: taskStatus.find(s => s.status === 'Completed')?.count || 0
      },
      overdueTasks: overdueTasks[0].count
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;

