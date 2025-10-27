import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Get all universities
router.get('/', async (req, res) => {
  try {
    const { search, ranking_min, ranking_max, country } = req.query;
    
    let query = supabase.from('universities').select('*');

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (ranking_min) {
      query = query.gte('world_ranking', parseInt(ranking_min));
    }

    if (ranking_max) {
      query = query.lte('world_ranking', parseInt(ranking_max));
    }

    if (country) {
      query = query.eq('country', country);
    }

    query = query.order('world_ranking', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ error: 'Failed to fetch universities' });
  }
});

// Get single university
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'University not found' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching university:', error);
    res.status(500).json({ error: 'Failed to fetch university' });
  }
});

// Get comparison data for multiple universities
router.get('/compare', async (req, res) => {
  try {
    const ids = req.query.ids?.split(',').map(id => parseInt(id)) || [];
    
    if (ids.length === 0) {
      return res.status(400).json({ error: 'Please provide university IDs' });
    }

    // Get universities
    const { data: universities, error: uniError } = await supabase
      .from('universities')
      .select('*')
      .in('id', ids)
      .order('world_ranking', { ascending: true });

    if (uniError) throw uniError;

    // Get peer stats for these universities
    const { data: peerStats, error: statsError } = await supabase
      .from('peer_stats')
      .select('*')
      .in('university_id', ids);

    if (statsError) throw statsError;

    // Combine data
    const result = universities.map(uni => {
      const stats = peerStats.find(ps => ps.university_id === uni.id);
      return {
        ...uni,
        avg_progress_percentage: stats?.avg_progress_percentage || null,
        avg_tasks_completed: stats?.avg_tasks_completed || null,
        avg_days_before_deadline: stats?.avg_days_before_deadline || null,
        sample_size: stats?.sample_size || null,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    res.status(500).json({ error: 'Failed to fetch comparison data' });
  }
});

// Get peer stats for a university
router.get('/:id/peer-stats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('peer_stats')
      .select('*')
      .eq('university_id', req.params.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Peer stats not found for this university' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching peer stats:', error);
    res.status(500).json({ error: 'Failed to fetch peer stats' });
  }
});

export default router;
