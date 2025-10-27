import express from 'express';
import { supabase } from '../config/supabase.js';
import { findBestMatches, generateExplanation } from '../lib/matchingAlgorithm.js';

const router = express.Router();

// Middleware to get user ID from Supabase auth
const getUser = async (req, res, next) => {
  const userEmail = req.headers['x-user-email'] || 'demo-user@example.com';
  req.userId = userEmail;
  next();
};

// Submit assessment and get recommendations
router.post('/assess', getUser, async (req, res) => {
  try {
    const {
      gmat_score,
      gpa,
      work_experience_years,
      program_type,
      field_of_interest,
      preferred_locations = [],
      max_budget,
      deadline_flexibility = 'moderate',
      weights = {},
      strong_essays = false,
      research_experience = false
    } = req.body;

    // Validate required fields
    if (!program_type || !field_of_interest) {
      return res.status(400).json({ 
        error: 'Program type and field of interest are required' 
      });
    }

    // Create assessment record
    const assessmentData = {
      user_id: req.userId,
      gmat_score,
      gpa,
      work_experience_years,
      program_type,
      field_of_interest,
      preferred_locations,
      max_budget,
      deadline_flexibility,
      strong_essays,
      research_experience,
      ...weights
    };

    const { data: assessment, error: assessmentError } = await supabase
      .from('user_assessments')
      .insert([assessmentData])
      .select()
      .single();

    if (assessmentError) {
      console.error('Error creating assessment:', assessmentError);
      return res.status(500).json({ error: 'Failed to save assessment' });
    }

    // Get all universities for matching
    const { data: universities, error: uniError } = await supabase
      .from('universities')
      .select('*')
      .eq('program_type', program_type);

    if (uniError) {
      console.error('Error fetching universities:', uniError);
      return res.status(500).json({ error: 'Failed to fetch universities' });
    }

    if (!universities || universities.length === 0) {
      return res.status(404).json({ 
        error: 'No universities found for the specified program type' 
      });
    }

    // Run matching algorithm
    const recommendations = findBestMatches(assessmentData, universities, {
      topN: 5,
      temperature: 0.1,
      includeBreakdown: true
    });

    // Save recommendations to database
    const recommendationRecords = recommendations.top_universities.map((rec, index) => ({
      user_id: req.userId,
      assessment_id: assessment.id,
      university_id: rec.id,
      match_score: rec.score / 100, // Convert back to decimal
      probability: rec.probability / 100,
      rank_position: rec.rank_position,
      breakdown: rec.breakdown
    }));

    const { error: recError } = await supabase
      .from('university_recommendations')
      .insert(recommendationRecords);

    if (recError) {
      console.error('Error saving recommendations:', recError);
      // Don't fail the request, just log the error
    }

    // Add explanations to results
    const resultsWithExplanations = recommendations.top_universities.map(rec => ({
      ...rec,
      explanation: generateExplanation(rec, rec.breakdown, recommendations.weights_used)
    }));

    res.json({
      assessment_id: assessment.id,
      recommendations: {
        ...recommendations,
        top_universities: resultsWithExplanations
      }
    });

  } catch (error) {
    console.error('Assessment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's assessment history
router.get('/history', getUser, async (req, res) => {
  try {
    const { data: assessments, error } = await supabase
      .from('user_assessments')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assessments:', error);
      return res.status(500).json({ error: 'Failed to fetch assessments' });
    }

    res.json(assessments || []);
  } catch (error) {
    console.error('Assessment history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recommendations for a specific assessment
router.get('/recommendations/:assessmentId', getUser, async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const { data: recommendations, error } = await supabase
      .from('university_recommendations')
      .select(`
        *,
        universities (*)
      `)
      .eq('user_id', req.userId)
      .eq('assessment_id', assessmentId)
      .order('rank_position', { ascending: true });

    if (error) {
      console.error('Error fetching recommendations:', error);
      return res.status(500).json({ error: 'Failed to fetch recommendations' });
    }

    // Transform the data
    const transformed = recommendations.map(rec => ({
      id: rec.universities.id,
      name: rec.universities.name,
      country: rec.universities.country,
      world_ranking: rec.universities.world_ranking,
      program_type: rec.universities.program_type,
      field_of_study: rec.universities.field_of_study,
      score: Math.round(rec.match_score * 10000) / 100,
      probability: Math.round(rec.probability * 10000) / 100,
      rank_position: rec.rank_position,
      breakdown: rec.breakdown
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update assessment weights and re-run matching
router.put('/assess/:assessmentId/weights', getUser, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { weights } = req.body;

    // Update assessment with new weights
    const { error: updateError } = await supabase
      .from('user_assessments')
      .update(weights)
      .eq('id', assessmentId)
      .eq('user_id', req.userId);

    if (updateError) {
      console.error('Error updating assessment:', updateError);
      return res.status(500).json({ error: 'Failed to update assessment' });
    }

    // Get the updated assessment
    const { data: assessment, error: fetchError } = await supabase
      .from('user_assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', req.userId)
      .single();

    if (fetchError) {
      console.error('Error fetching updated assessment:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch assessment' });
    }

    // Get universities
    const { data: universities, error: uniError } = await supabase
      .from('universities')
      .select('*')
      .eq('program_type', assessment.program_type);

    if (uniError) {
      console.error('Error fetching universities:', uniError);
      return res.status(500).json({ error: 'Failed to fetch universities' });
    }

    // Re-run matching algorithm
    const recommendations = findBestMatches(assessment, universities, {
      topN: 5,
      temperature: 0.1,
      includeBreakdown: true
    });

    // Update recommendations in database
    const recommendationRecords = recommendations.top_universities.map((rec, index) => ({
      user_id: req.userId,
      assessment_id: assessment.id,
      university_id: rec.id,
      match_score: rec.score / 100,
      probability: rec.probability / 100,
      rank_position: rec.rank_position,
      breakdown: rec.breakdown
    }));

    // Delete old recommendations
    await supabase
      .from('university_recommendations')
      .delete()
      .eq('assessment_id', assessmentId)
      .eq('user_id', req.userId);

    // Insert new recommendations
    const { error: recError } = await supabase
      .from('university_recommendations')
      .insert(recommendationRecords);

    if (recError) {
      console.error('Error updating recommendations:', recError);
    }

    // Add explanations
    const resultsWithExplanations = recommendations.top_universities.map(rec => ({
      ...rec,
      explanation: generateExplanation(rec, rec.breakdown, recommendations.weights_used)
    }));

    res.json({
      assessment_id: assessment.id,
      recommendations: {
        ...recommendations,
        top_universities: resultsWithExplanations
      }
    });

  } catch (error) {
    console.error('Update weights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
