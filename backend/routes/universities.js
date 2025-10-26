import express from 'express';
import { getPool } from '../config/db.js';

const router = express.Router();
const pool = getPool();

// Get all universities
router.get('/', async (req, res) => {
  try {
    const { search, ranking_min, ranking_max, country } = req.query;
    let query = 'SELECT * FROM universities WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    if (ranking_min) {
      query += ' AND world_ranking >= ?';
      params.push(ranking_min);
    }

    if (ranking_max) {
      query += ' AND world_ranking <= ?';
      params.push(ranking_max);
    }

    if (country) {
      query += ' AND country = ?';
      params.push(country);
    }

    query += ' ORDER BY world_ranking ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ error: 'Failed to fetch universities' });
  }
});

// Get single university
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM universities WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'University not found' });
    }
    
    res.json(rows[0]);
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

    const placeholders = ids.map(() => '?').join(',');
    const query = `
      SELECT 
        u.*,
        ps.avg_progress_percentage,
        ps.avg_tasks_completed,
        ps.avg_days_before_deadline,
        ps.sample_size,
        (SELECT COUNT(*) FROM user_universities uu WHERE uu.university_id = u.id) as total_applicants
      FROM universities u
      LEFT JOIN peer_stats ps ON u.id = ps.university_id
      WHERE u.id IN (${placeholders})
      ORDER BY u.world_ranking ASC
    `;

    const [rows] = await pool.query(query, ids);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    res.status(500).json({ error: 'Failed to fetch comparison data' });
  }
});

// Get peer stats for a university
router.get('/:id/peer-stats', async (req, res) => {
  try {
    const query = `
      SELECT 
        *,
        (SELECT COUNT(*) FROM user_universities WHERE university_id = ?) as total_applicants
      FROM peer_stats
      WHERE university_id = ?
    `;
    
    const [rows] = await pool.query(query, [req.params.id, req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Peer stats not found for this university' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching peer stats:', error);
    res.status(500).json({ error: 'Failed to fetch peer stats' });
  }
});

export default router;

