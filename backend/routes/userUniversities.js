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
    const { university_id, program_type, application_deadline, assessment_data } = req.body;

    if (!university_id || !program_type) {
      return res.status(400).json({ error: 'Missing required fields: university_id and program_type' });
    }

    // Use provided deadline or generate a random one
    const deadline = application_deadline || generateRandomDeadline();

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
    const insertData = {
      user_id: req.userId,
      university_id,
      program_type,
      application_deadline: deadline,
    };

    // Add assessment data if provided
    if (assessment_data) {
      insertData.assessment_data = assessment_data;
    }

    const { data: userUniversity, error: insertError } = await supabase
      .from('user_universities')
      .insert(insertData)
      .select()
      .single();

    if (insertError) throw insertError;

    const userUniversityId = userUniversity.id;

    // Auto-generate tasks for this university
    const tasks = generateTasks(deadline);
    
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

// Get university comparison data with assessment scores
router.get('/compare', getUser, async (req, res) => {
  try {
    const { data: userUniversities, error } = await supabase
      .from('user_universities')
      .select(`
        *,
        universities (*)
      `)
      .eq('user_id', req.userId)
      .order('application_deadline', { ascending: true });
    
    if (error) throw error;
    
    // Transform the data and calculate comparison metrics
    const comparisonData = await Promise.all(userUniversities.map(async item => {
      const uni = item.universities;
      const daysLeft = Math.ceil(
        (new Date(item.application_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      let urgencyLevel = 'low';
      if (daysLeft < 7) urgencyLevel = 'high';
      else if (daysLeft < 14) urgencyLevel = 'medium';

      // Calculate assessment score if assessment data exists
      let assessmentScore = null;
      let assessmentBreakdown = null;
      
      if (item.assessment_data) {
        try {
          // Use the matching algorithm to calculate score for this specific university
          const { findBestMatches } = await import('../lib/matchingAlgorithm.js');
          const recommendations = findBestMatches(item.assessment_data, [uni], {
            topN: 1,
            temperature: 0.1,
            includeBreakdown: true
          });
          
          if (recommendations.top_universities.length > 0) {
            const match = recommendations.top_universities[0];
            assessmentScore = match.score;
            assessmentBreakdown = match.breakdown;
          }
        } catch (error) {
          console.error('Error calculating assessment score:', error);
          assessmentScore = null;
          assessmentBreakdown = null;
        }
      }

      return {
        id: item.id,
        university_id: uni.id,
        name: uni.name,
        university_name: uni.name,
        country: uni.country,
        world_ranking: uni.world_ranking,
        program_type: item.program_type,
        application_deadline: item.application_deadline,
        status: item.status || 'Active',
        daysLeft: Math.max(0, daysLeft),
        urgencyLevel,
        assessmentScore,
        assessmentBreakdown,
        assessmentData: item.assessment_data
      };
    }));
    
    res.json(comparisonData);
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    res.status(500).json({ error: 'Failed to fetch comparison data' });
  }
});

// Helper function to generate random deadline
function generateRandomDeadline() {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Generate realistic application deadlines
  // Most deadlines are in late fall/early winter for next year's admission
  const deadlines = [
    // Fall 2025 deadlines (current year + 1)
    `${currentYear + 1}-10-15`, // October 15
    `${currentYear + 1}-11-01`, // November 1
    `${currentYear + 1}-11-15`, // November 15
    `${currentYear + 1}-11-27`, // November 27
    `${currentYear + 1}-12-01`, // December 1
    `${currentYear + 1}-12-06`, // December 6
    `${currentYear + 1}-12-15`, // December 15
    `${currentYear + 1}-12-31`, // December 31
    
    // Fall 2026 deadlines (current year + 2)
    `${currentYear + 2}-01-05`, // January 5
    `${currentYear + 2}-01-15`, // January 15
    `${currentYear + 2}-01-25`, // January 25
    `${currentYear + 2}-02-01`, // February 1
    `${currentYear + 2}-02-15`, // February 15
    `${currentYear + 2}-03-01`, // March 1
    `${currentYear + 2}-03-15`, // March 15
    `${currentYear + 2}-04-01`, // April 1
  ];
  
  // Randomly select one of the realistic deadlines
  const randomIndex = Math.floor(Math.random() * deadlines.length);
  return deadlines[randomIndex];
}

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
