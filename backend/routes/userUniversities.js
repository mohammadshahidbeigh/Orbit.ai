import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Middleware to get user ID from Supabase auth (coming from frontend)
const getUser = async (req, res, next) => {
  // For now, extract user ID from Authorization header
  // In production, verify JWT token from Supabase
  const authHeader = req.headers.authorization;
  const userEmail = req.headers['x-user-email'] || 'demo-user@example.com'; // Fallback for testing
  
  req.userId = userEmail; // Use email as user identifier
  next();
};

// Get user's selected universities
router.get('/', getUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_universities')
      .select(`
        *,
        universities (*)
      `)
      .eq('user_id', req.userId)
      .order('application_deadline', { ascending: true });
    
    if (error) throw error;
    
    // Transform the data to flatten the universities data
    const transformed = data.map(item => ({
      ...item,
      university_name: item.universities?.name,
      country: item.universities?.country,
      world_ranking: item.universities?.world_ranking,
      website: item.universities?.website,
    }));
    
    res.json(transformed);
  } catch (error) {
    console.error('Error fetching user universities:', error);
    res.status(500).json({ error: 'Failed to fetch user universities' });
  }
});

// Add university to user's list
router.post('/', getUser, async (req, res) => {
  try {
    const { university_id, program_type, application_deadline } = req.body;

    if (!university_id || !program_type || !application_deadline) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify university exists
    const { data: university } = await supabase
      .from('universities')
      .select('*')
      .eq('id', university_id)
      .single();

    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    // Insert user_university
    const { data: userUniversity, error: insertError } = await supabase
      .from('user_universities')
      .insert({
        user_id: req.userId,
        university_id,
        program_type,
        application_deadline,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const userUniversityId = userUniversity.id;

    // Auto-generate tasks for this university
    const tasks = generateTasks(application_deadline);
    
    const { error: tasksError } = await supabase
      .from('tasks')
      .insert(
        tasks.map(task => ({
          user_university_id: userUniversityId,
          title: task.title,
          description: task.description,
          phase: task.phase,
          priority: task.priority,
          due_date: task.due_date,
        }))
      );

    if (tasksError) {
      console.error('Error creating tasks:', tasksError);
      // Don't fail the request if tasks fail to create
    }

    res.status(201).json({ id: userUniversityId, message: 'University added successfully' });
  } catch (error) {
    console.error('Error adding university:', error);
    res.status(500).json({ error: 'Failed to add university' });
  }
});

// Update university deadline or program type
router.put('/:id', getUser, async (req, res) => {
  try {
    const { program_type, application_deadline, status } = req.body;
    
    const updates = {};
    if (program_type) updates.program_type = program_type;
    if (application_deadline) updates.application_deadline = application_deadline;
    if (status) updates.status = status;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { error } = await supabase
      .from('user_universities')
      .update(updates)
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'University updated successfully' });
  } catch (error) {
    console.error('Error updating university:', error);
    res.status(500).json({ error: 'Failed to update university' });
  }
});

// Remove university from user's list
router.delete('/:id', getUser, async (req, res) => {
  try {
    const { error } = await supabase
      .from('user_universities')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);
    
    if (error) throw error;
    
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
