import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();
const USER_ID = 'demo-user';

// Get all tasks for a specific university
router.get('/', async (req, res) => {
  try {
    const { university_id } = req.query;
    
    let query = supabase
      .from('tasks')
      .select(`
        *,
        user_universities!inner (
          university_id,
          universities (*)
        )
      `)
      .eq('user_universities.user_id', USER_ID);
    
    if (university_id) {
      query = query.eq('user_universities.university_id', university_id);
    }
    
    query = query.order('due_date', { ascending: true });
    
    const { data, error } = await query;

    if (error) throw error;

    // Transform data
    const transformed = data.map(task => ({
      ...task,
      university_id: task.user_universities?.university_id,
      university_name: task.user_universities?.universities?.name,
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get tasks for timeline (Gantt view)
router.get('/timeline', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        user_universities!inner (
          university_id,
          application_deadline,
          user_id,
          universities (*)
        )
      `)
      .eq('user_universities.user_id', USER_ID)
      .order('due_date', { ascending: true });

    if (error) throw error;

    // Transform data
    const transformed = data.map(task => ({
      ...task,
      application_deadline: task.user_universities?.application_deadline,
      university_name: task.user_universities?.universities?.name,
      world_ranking: task.user_universities?.universities?.world_ranking,
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

// Get tasks grouped by status (for Kanban)
router.get('/kanban', async (req, res) => {
  try {
    const { university_id } = req.query;
    
    let query = supabase
      .from('tasks')
      .select(`
        *,
        user_universities!inner (
          user_id,
          universities (*)
        )
      `)
      .eq('user_universities.user_id', USER_ID);

    if (university_id) {
      query = query.eq('user_universities.university_id', university_id);
    }

    query = query.order('due_date', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    // Transform and group by status
    const transformed = data.map(task => ({
      ...task,
      university_name: task.user_universities?.universities?.name,
      world_ranking: task.user_universities?.universities?.world_ranking,
    }));

    const grouped = {
      'To Do': transformed.filter(t => t.status === 'To Do'),
      'In Progress': transformed.filter(t => t.status === 'In Progress'),
      'Completed': transformed.filter(t => t.status === 'Completed')
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

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_university_id,
        title,
        description: description || null,
        phase: phase || 'Research',
        priority: priority || 'Medium',
        due_date: due_date || null,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ id: data.id, message: 'Task created successfully' });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, phase, status, priority, due_date } = req.body;
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (phase !== undefined) updates.phase = phase;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (due_date !== undefined) updates.due_date = due_date;
    updates.updated_at = new Date().toISOString();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
