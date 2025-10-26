import express from 'express';
import { getPool } from '../config/db.js';

const router = express.Router();
const pool = getPool();
const USER_ID = 'demo-user'; // For demo purposes

// Get user's selected universities
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        uu.*,
        u.name as university_name,
        u.country,
        u.world_ranking,
        u.website
      FROM user_universities uu
      JOIN universities u ON uu.university_id = u.id
      WHERE uu.user_id = ?
      ORDER BY uu.application_deadline ASC
    `;
    
    const [rows] = await pool.query(query, [USER_ID]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching user universities:', error);
    res.status(500).json({ error: 'Failed to fetch user universities' });
  }
});

// Add university to user's list
router.post('/', async (req, res) => {
  try {
    const { university_id, program_type, application_deadline } = req.body;

    if (!university_id || !program_type || !application_deadline) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify university exists
    const [university] = await pool.query('SELECT * FROM universities WHERE id = ?', [university_id]);
    if (university.length === 0) {
      return res.status(404).json({ error: 'University not found' });
    }

    // Insert user_university
    const [result] = await pool.query(
      'INSERT INTO user_universities (user_id, university_id, program_type, application_deadline) VALUES (?, ?, ?, ?)',
      [USER_ID, university_id, program_type, application_deadline]
    );

    const userUniversityId = result.insertId;

    // Auto-generate tasks for this university
    const tasks = generateTasks(application_deadline);
    const taskValues = tasks.map(task => [
      userUniversityId,
      task.title,
      task.description,
      task.phase,
      task.priority,
      task.due_date
    ]);

    if (taskValues.length > 0) {
      await pool.query(
        'INSERT INTO tasks (user_university_id, title, description, phase, priority, due_date) VALUES ?',
        [taskValues]
      );
    }

    res.status(201).json({ id: userUniversityId, message: 'University added successfully' });
  } catch (error) {
    console.error('Error adding university:', error);
    res.status(500).json({ error: 'Failed to add university' });
  }
});

// Update university deadline or program type
router.put('/:id', async (req, res) => {
  try {
    const { program_type, application_deadline, status } = req.body;
    const updates = [];
    const values = [];

    if (program_type) {
      updates.push('program_type = ?');
      values.push(program_type);
    }
    
    if (application_deadline) {
      updates.push('application_deadline = ?');
      values.push(application_deadline);
    }
    
    if (status) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);
    await pool.query(
      `UPDATE user_universities SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'University updated successfully' });
  } catch (error) {
    console.error('Error updating university:', error);
    res.status(500).json({ error: 'Failed to update university' });
  }
});

// Remove university from user's list
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM user_universities WHERE id = ? AND user_id = ?', [req.params.id, USER_ID]);
    res.json({ message: 'University removed successfully' });
  } catch (error) {
    console.error('Error removing university:', error);
    res.status(500).json({ error: 'Failed to remove university' });
  }
});

// Helper function to generate tasks based on deadline
function generateTasks(deadline) {
  const phases = [
    { title: 'Research University & Program', description: 'Research the university, program details, and admission requirements', phase: 'Research', days_before: 56, priority: 'High' },
    { title: 'Complete Standardized Tests', description: 'Take GMAT/GRE, IELTS/TOEFL, and submit scores', phase: 'Standardized Tests', days_before: 49, priority: 'High' },
    { title: 'Write Application Essays', description: 'Draft and refine application essays and personal statements', phase: 'Essays', days_before: 42, priority: 'High' },
    { title: 'Prepare Resume/CV', description: 'Create or update resume/CV tailored for the application', phase: 'Resume', days_before: 35, priority: 'Medium' },
    { title: 'Request Recommendations', description: 'Request and follow up on letters of recommendation', phase: 'Recommendations', days_before: 28, priority: 'High' },
    { title: 'Review & Submit Application', description: 'Final review of all documents and submit application', phase: 'Submission & Review', days_before: 7, priority: 'High' },
    { title: 'Prepare for Enrollment', description: 'Prepare transcripts, financial documents, and visa if needed', phase: 'Enrollment', days_before: 0, priority: 'Medium' },
  ];

  return phases.map(phase => {
    const dueDate = new Date(deadline);
    dueDate.setDate(dueDate.getDate() - phase.days_before);
    
    return {
      title: phase.title,
      description: phase.description,
      phase: phase.phase,
      priority: phase.priority,
      due_date: dueDate.toISOString().split('T')[0]
    };
  });
}

export default router;

