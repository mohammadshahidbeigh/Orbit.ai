import express from 'express';
import { getPool } from '../config/db.js';

const router = express.Router();
const pool = getPool();
const USER_ID = 'demo-user';

// Get all tasks for a specific university
router.get('/', async (req, res) => {
  try {
    const { university_id } = req.query;
    
    let query = `
      SELECT 
        t.*,
        uu.university_id,
        u.name as university_name
      FROM tasks t
      JOIN user_universities uu ON t.user_university_id = uu.id
      JOIN universities u ON uu.university_id = u.id
      WHERE uu.user_id = ?
    `;
    
    const params = [USER_ID];
    
    if (university_id) {
      query += ' AND uu.university_id = ?';
      params.push(university_id);
    }
    
    query += ' ORDER BY t.due_date ASC, t.priority DESC';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get tasks for timeline (Gantt view)
router.get('/timeline', async (req, res) => {
  try {
    const query = `
      SELECT 
        t.*,
        uu.university_id,
        uu.application_deadline,
        u.name as university_name,
        u.world_ranking
      FROM tasks t
      JOIN user_universities uu ON t.user_university_id = uu.id
      JOIN universities u ON uu.university_id = u.id
      WHERE uu.user_id = ?
      ORDER BY t.due_date ASC
    `;
    
    const [rows] = await pool.query(query, [USER_ID]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

// Get tasks grouped by status (for Kanban)
router.get('/kanban', async (req, res) => {
  try {
    const { university_id } = req.query;
    
    let query = `
      SELECT 
        t.*,
        u.name as university_name,
        u.world_ranking
      FROM tasks t
      JOIN user_universities uu ON t.user_university_id = uu.id
      JOIN universities u ON uu.university_id = u.id
      WHERE uu.user_id = ?
    `;
    
    const params = [USER_ID];
    
    if (university_id) {
      query += ' AND uu.university_id = ?';
      params.push(university_id);
    }
    
    query += ' ORDER BY t.due_date ASC';
    
    const [rows] = await pool.query(query, params);
    
    // Group by status
    const grouped = {
      'To Do': rows.filter(t => t.status === 'To Do'),
      'In Progress': rows.filter(t => t.status === 'In Progress'),
      'Completed': rows.filter(t => t.status === 'Completed')
    };
    
    res.json(grouped);
  } catch (error) {
    console.error('Error fetching kanban tasks:', error);
    res.status(500).json({ error: 'Failed to fetch kanban tasks' });
  }
});

// Create new task
router.post('/', async (req, res) => {
  try {
    const { user_university_id, title, description, phase, priority, due_date } = req.body;

    if (!user_university_id || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      'INSERT INTO tasks (user_university_id, title, description, phase, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      [user_university_id, title, description || null, phase || 'Research', priority || 'Medium', due_date || null]
    );

    res.status(201).json({ id: result.insertId, message: 'Task created successfully' });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, phase, status, priority, due_date } = req.body;
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (phase !== undefined) {
      updates.push('phase = ?');
      values.push(phase);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      values.push(priority);
    }
    if (due_date !== undefined) {
      updates.push('due_date = ?');
      values.push(due_date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);
    await pool.query(
      `UPDATE tasks SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;

