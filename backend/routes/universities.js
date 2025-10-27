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

// Calculate and update peer statistics
router.post('/calculate-peer-stats', async (req, res) => {
  try {
    console.log('Starting peer stats calculation...');

    // Get all user universities with their tasks
    const { data: userUniversities, error: userError } = await supabase
      .from('user_universities')
      .select(`
        id,
        university_id,
        application_deadline,
        status,
        tasks (
          id,
          status,
          due_date,
          created_at
        )
      `)
      .eq('status', 'Active');

    if (userError) throw userError;

    console.log(`Found ${userUniversities?.length || 0} active user universities`);

    // Group by university and calculate stats
    const universityStats = {};
    
    userUniversities?.forEach(userUni => {
      const universityId = userUni.university_id;
      if (!universityStats[universityId]) {
        universityStats[universityId] = [];
      }

      // Calculate progress for this user-university
      const totalTasks = userUni.tasks?.length || 0;
      const completedTasks = userUni.tasks?.filter(t => t.status === 'Completed')?.length || 0;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Calculate days before deadline (from task completion dates)
      let avgDaysBeforeDeadline = 0;
      if (userUni.application_deadline && completedTasks > 0) {
        const deadlineDate = new Date(userUni.application_deadline);
        const completedTaskDays = userUni.tasks
          .filter(t => t.status === 'Completed' && t.updated_at)
          .map(t => {
            const completionDate = new Date(t.updated_at);
            const daysBeforeDeadline = Math.floor((deadlineDate - completionDate) / (1000 * 60 * 60 * 24));
            return Math.max(0, daysBeforeDeadline);
          });
        
        avgDaysBeforeDeadline = completedTaskDays.length > 0 
          ? Math.round(completedTaskDays.reduce((sum, days) => sum + days, 0) / completedTaskDays.length)
          : 0;
      }

      universityStats[universityId].push({
        progress,
        completedTasks,
        avgDaysBeforeDeadline
      });
    });

    console.log(`Calculated stats for ${Object.keys(universityStats).length} universities`);

    // Calculate averages and update peer_stats table
    const peerStatsUpdates = [];
    
    for (const [universityId, userStats] of Object.entries(universityStats)) {
      if (userStats.length === 0) continue;

      const avgProgress = Math.round(
        userStats.reduce((sum, stat) => sum + stat.progress, 0) / userStats.length
      );
      
      const avgTasksCompleted = Math.round(
        (userStats.reduce((sum, stat) => sum + stat.completedTasks, 0) / userStats.length) * 100
      ) / 100;
      
      const avgDaysBeforeDeadline = Math.round(
        userStats.reduce((sum, stat) => sum + stat.avgDaysBeforeDeadline, 0) / userStats.length
      );

      peerStatsUpdates.push({
        university_id: parseInt(universityId),
        avg_progress_percentage: avgProgress,
        avg_tasks_completed: avgTasksCompleted,
        avg_days_before_deadline: avgDaysBeforeDeadline,
        sample_size: userStats.length,
        last_updated: new Date().toISOString()
      });
    }

    console.log(`Updating ${peerStatsUpdates.length} peer stats records`);

    // Manually handle upsert (update if exists, insert if not)
    if (peerStatsUpdates.length > 0) {
      for (const statUpdate of peerStatsUpdates) {
        // Check if peer stat already exists for this university
        const { data: existing, error: checkError } = await supabase
          .from('peer_stats')
          .select('id')
          .eq('university_id', statUpdate.university_id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 means no rows returned, which is expected for new records
          throw checkError;
        }

        if (existing) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('peer_stats')
            .update({
              avg_progress_percentage: statUpdate.avg_progress_percentage,
              avg_tasks_completed: statUpdate.avg_tasks_completed,
              avg_days_before_deadline: statUpdate.avg_days_before_deadline,
              sample_size: statUpdate.sample_size,
              last_updated: statUpdate.last_updated
            })
            .eq('university_id', statUpdate.university_id);

          if (updateError) throw updateError;
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('peer_stats')
            .insert(statUpdate);

          if (insertError) throw insertError;
        }
      }
    }

    console.log('Peer stats calculation completed successfully');

    res.json({
      message: 'Peer statistics calculated and updated successfully',
      updated_universities: peerStatsUpdates.length,
      total_sample_size: peerStatsUpdates.reduce((sum, stat) => sum + stat.sample_size, 0)
    });

  } catch (error) {
    console.error('Error calculating peer stats:', error);
    res.status(500).json({ error: 'Failed to calculate peer statistics' });
  }
});

// Seed sample peer stats for testing/demo purposes
router.post('/seed-sample-peer-stats', async (req, res) => {
  try {
    console.log('Seeding sample peer statistics...');

    // Get all universities
    const { data: universities, error: uniError } = await supabase
      .from('universities')
      .select('id, name, world_ranking')
      .order('world_ranking', { ascending: true });

    if (uniError) throw uniError;

    if (!universities || universities.length === 0) {
      return res.status(404).json({ error: 'No universities found. Please seed universities first.' });
    }

    console.log(`Found ${universities.length} universities to create peer stats for`);

    // Sample peer stats data
    const samplePeerStats = [
      { avg_progress: 45, avg_tasks: 3.15, avg_days: 42, sample_size: 342 }, // Harvard Business School
      { avg_progress: 52, avg_tasks: 3.64, avg_days: 38, sample_size: 421 }, // Stanford GSB
      { avg_progress: 48, avg_tasks: 3.36, avg_days: 45, sample_size: 389 }, // Wharton
      { avg_progress: 41, avg_tasks: 2.87, avg_days: 52, sample_size: 267 }, // MIT Sloan
      { avg_progress: 43, avg_tasks: 3.01, avg_days: 49, sample_size: 298 }, // Kellogg
      { avg_progress: 44, avg_tasks: 3.08, avg_days: 47, sample_size: 312 },
      { avg_progress: 39, avg_tasks: 2.73, avg_days: 55, sample_size: 234 },
      { avg_progress: 46, avg_tasks: 3.22, avg_days: 43, sample_size: 367 },
      { avg_progress: 47, avg_tasks: 3.29, avg_days: 41, sample_size: 389 },
      { avg_progress: 42, avg_tasks: 2.94, avg_days: 50, sample_size: 289 },
    ];

    // Create peer stats for each university
    const peerStatsToInsert = universities.map((university, index) => {
      const statIndex = index < samplePeerStats.length ? index : index % samplePeerStats.length;
      const sampleStat = samplePeerStats[statIndex];
      
      return {
        university_id: university.id,
        avg_progress_percentage: sampleStat.avg_progress,
        avg_tasks_completed: sampleStat.avg_tasks,
        avg_days_before_deadline: sampleStat.avg_days,
        sample_size: sampleStat.sample_size,
        last_updated: new Date().toISOString()
      };
    });

    console.log(`Creating ${peerStatsToInsert.length} peer stats records`);

    // Delete existing peer stats to avoid conflicts
    const { error: deleteError } = await supabase
      .from('peer_stats')
      .delete()
      .neq('id', 0);

    if (deleteError) {
      console.warn('Warning deleting existing peer stats:', deleteError);
    }

    // Insert new peer stats
    const { error: insertError } = await supabase
      .from('peer_stats')
      .insert(peerStatsToInsert);

    if (insertError) {
      console.error('Error inserting peer stats:', insertError);
      throw insertError;
    }

    console.log('✅ Sample peer stats seeded successfully');

    res.json({
      message: 'Sample peer statistics seeded successfully',
      universities_processed: universities.length,
      peer_stats_created: peerStatsToInsert.length,
      sample_harvard_stat: peerStatsToInsert.find(stat => 
        universities.find(uni => uni.id === stat.university_id)?.name?.includes('Harvard')
      )
    });

  } catch (error) {
    console.error('Error seeding sample peer stats:', error);
    res.status(500).json({ error: 'Failed to seed sample peer statistics', details: error.message });
  }
});

export default router;
