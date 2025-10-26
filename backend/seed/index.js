import { initializeDatabase, createTables, getPool } from '../config/db.js';

const universities = [
  { name: 'Massachusetts Institute of Technology', country: 'United States', world_ranking: 1, website: 'https://web.mit.edu' },
  { name: 'Stanford University', country: 'United States', world_ranking: 2, website: 'https://www.stanford.edu' },
  { name: 'Harvard University', country: 'United States', world_ranking: 3, website: 'https://www.harvard.edu' },
  { name: 'University of Cambridge', country: 'United Kingdom', world_ranking: 4, website: 'https://www.cam.ac.uk' },
  { name: 'University of Oxford', country: 'United Kingdom', world_ranking: 5, website: 'https://www.ox.ac.uk' },
  { name: 'Princeton University', country: 'United States', world_ranking: 6, website: 'https://www.princeton.edu' },
  { name: 'California Institute of Technology', country: 'United States', world_ranking: 7, website: 'https://www.caltech.edu' },
  { name: 'Yale University', country: 'United States', world_ranking: 8, website: 'https://www.yale.edu' },
  { name: 'University of Chicago', country: 'United States', world_ranking: 9, website: 'https://www.uchicago.edu' },
  { name: 'Imperial College London', country: 'United Kingdom', world_ranking: 10, website: 'https://www.imperial.ac.uk' },
  { name: 'Columbia University', country: 'United States', world_ranking: 11, website: 'https://www.columbia.edu' },
  { name: 'ETH Zurich', country: 'Switzerland', world_ranking: 12, website: 'https://ethz.ch' },
  { name: 'University of Pennsylvania', country: 'United States', world_ranking: 13, website: 'https://www.upenn.edu' },
  { name: 'Peking University', country: 'China', world_ranking: 14, website: 'https://english.pku.edu.cn' },
  { name: 'Tsinghua University', country: 'China', world_ranking: 15, website: 'https://www.tsinghua.edu.cn' },
  { name: 'Cornell University', country: 'United States', world_ranking: 16, website: 'https://www.cornell.edu' },
  { name: 'University of Michigan', country: 'United States', world_ranking: 17, website: 'https://umich.edu' },
  { name: 'UCLA', country: 'United States', world_ranking: 18, website: 'https://www.ucla.edu' },
  { name: 'National University of Singapore', country: 'Singapore', world_ranking: 19, website: 'https://www.nus.edu.sg' },
  { name: 'University of Toronto', country: 'Canada', world_ranking: 20, website: 'https://www.utoronto.ca' },
  { name: 'New York University', country: 'United States', world_ranking: 21, website: 'https://www.nyu.edu' },
  { name: 'University of Washington', country: 'United States', world_ranking: 22, website: 'https://www.washington.edu' },
  { name: 'University of Edinburgh', country: 'United Kingdom', world_ranking: 23, website: 'https://www.ed.ac.uk' },
  { name: 'Technical University of Munich', country: 'Germany', world_ranking: 24, website: 'https://www.tum.de' },
  { name: 'University of California, Berkeley', country: 'United States', world_ranking: 25, website: 'https://www.berkeley.edu' },
  { name: 'McGill University', country: 'Canada', world_ranking: 26, website: 'https://www.mcgill.ca' },
  { name: 'University of British Columbia', country: 'Canada', world_ranking: 27, website: 'https://www.ubc.ca' },
  { name: 'Duke University', country: 'United States', world_ranking: 28, website: 'https://www.duke.edu' },
  { name: 'Northwestern University', country: 'United States', world_ranking: 29, website: 'https://www.northwestern.edu' },
  { name: 'University of Melbourne', country: 'Australia', world_ranking: 30, website: 'https://www.unimelb.edu.au' },
];

const peerStatsData = [
  { university_id: 1, avg_progress: 45, avg_tasks: 3.15, avg_days: 42, sample_size: 342 },
  { university_id: 2, avg_progress: 52, avg_tasks: 3.64, avg_days: 38, sample_size: 421 },
  { university_id: 3, avg_progress: 48, avg_tasks: 3.36, avg_days: 45, sample_size: 389 },
  { university_id: 4, avg_progress: 41, avg_tasks: 2.87, avg_days: 52, sample_size: 267 },
  { university_id: 5, avg_progress: 43, avg_tasks: 3.01, avg_days: 49, sample_size: 298 },
  { university_id: 6, avg_progress: 44, avg_tasks: 3.08, avg_days: 47, sample_size: 312 },
  { university_id: 7, avg_progress: 39, avg_tasks: 2.73, avg_days: 55, sample_size: 234 },
  { university_id: 8, avg_progress: 46, avg_tasks: 3.22, avg_days: 43, sample_size: 367 },
  { university_id: 9, avg_progress: 47, avg_tasks: 3.29, avg_days: 41, sample_size: 389 },
  { university_id: 10, avg_progress: 42, avg_tasks: 2.94, avg_days: 50, sample_size: 289 },
  { university_id: 11, avg_progress: 51, avg_tasks: 3.57, avg_days: 36, sample_size: 412 },
  { university_id: 12, avg_progress: 38, avg_tasks: 2.66, avg_days: 58, sample_size: 223 },
  { university_id: 13, avg_progress: 49, avg_tasks: 3.43, avg_days: 40, sample_size: 378 },
  { university_id: 14, avg_progress: 53, avg_tasks: 3.71, avg_days: 35, sample_size: 445 },
  { university_id: 15, avg_progress: 50, avg_tasks: 3.5, avg_days: 37, sample_size: 434 },
  { university_id: 16, avg_progress: 47, avg_tasks: 3.29, avg_days: 41, sample_size: 356 },
  { university_id: 17, avg_progress: 44, avg_tasks: 3.08, avg_days: 46, sample_size: 345 },
  { university_id: 18, avg_progress: 56, avg_tasks: 3.92, avg_days: 32, sample_size: 487 },
  { university_id: 19, avg_progress: 41, avg_tasks: 2.87, avg_days: 51, sample_size: 278 },
  { university_id: 20, avg_progress: 43, avg_tasks: 3.01, avg_days: 48, sample_size: 301 },
  { university_id: 21, avg_progress: 48, avg_tasks: 3.36, avg_days: 44, sample_size: 367 },
  { university_id: 22, avg_progress: 46, avg_tasks: 3.22, avg_days: 42, sample_size: 348 },
  { university_id: 23, avg_progress: 40, avg_tasks: 2.8, avg_days: 53, sample_size: 245 },
  { university_id: 24, avg_progress: 37, avg_tasks: 2.59, avg_days: 60, sample_size: 201 },
  { university_id: 25, avg_progress: 54, avg_tasks: 3.78, avg_days: 33, sample_size: 456 },
  { university_id: 26, avg_progress: 42, avg_tasks: 2.94, avg_days: 49, sample_size: 312 },
  { university_id: 27, avg_progress: 45, avg_tasks: 3.15, avg_days: 45, sample_size: 335 },
  { university_id: 28, avg_progress: 49, avg_tasks: 3.43, avg_days: 39, sample_size: 378 },
  { university_id: 29, avg_progress: 47, avg_tasks: 3.29, avg_days: 41, sample_size: 361 },
  { university_id: 30, avg_progress: 44, avg_tasks: 3.08, avg_days: 47, sample_size: 342 },
];

const seedDatabase = async () => {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    
    console.log('Creating tables...');
    await createTables();
    
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      // Clear existing data
      console.log('Clearing existing data...');
      await connection.query('DELETE FROM peer_stats');
      await connection.query('DELETE FROM tasks');
      await connection.query('DELETE FROM user_universities');
      await connection.query('DELETE FROM universities');
      
      // Insert universities
      console.log('Inserting universities...');
      for (const uni of universities) {
        await connection.query(
          'INSERT INTO universities (name, country, world_ranking, website) VALUES (?, ?, ?, ?)',
          [uni.name, uni.country, uni.world_ranking, uni.website]
        );
      }
      
      // Insert peer stats
      console.log('Inserting peer stats...');
      for (const stats of peerStatsData) {
        await connection.query(
          'INSERT INTO peer_stats (university_id, avg_progress_percentage, avg_tasks_completed, avg_days_before_deadline, sample_size) VALUES (?, ?, ?, ?, ?)',
          [stats.university_id, stats.avg_progress, stats.avg_tasks, stats.avg_days, stats.sample_size]
        );
      }
      
      console.log('Database seeded successfully!');
      console.log(`Inserted ${universities.length} universities and ${peerStatsData.length} peer stats records.`);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    process.exit(0);
  }
};

seedDatabase();

