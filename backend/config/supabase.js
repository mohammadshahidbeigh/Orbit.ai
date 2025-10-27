import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize database schema
export const initializeDatabase = async () => {
  console.log('Initializing Supabase connection...');
  
  try {
    // Test connection
    const { data, error } = await supabase.from('universities').select('id').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
      console.error('Supabase connection error:', error);
      throw error;
    }
    
    console.log('Supabase connected successfully');
    return supabase;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Create all necessary tables
export const createTables = async () => {
  console.log('Creating tables in Supabase...');
  
  // Note: You'll need to create these tables via Supabase SQL Editor or Dashboard
  // Here's the SQL you need to run in Supabase:
  
  const sql = `
-- Create universities table
CREATE TABLE IF NOT EXISTS universities (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  world_ranking INTEGER,
  website VARCHAR(255),
  logo_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_universities_name ON universities(name);
CREATE INDEX IF NOT EXISTS idx_universities_ranking ON universities(world_ranking);

-- Create user_universities table
CREATE TABLE IF NOT EXISTS user_universities (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL DEFAULT 'demo-user',
  university_id BIGINT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  program_type VARCHAR(20) NOT NULL DEFAULT 'Undergrad' CHECK (program_type IN ('Undergrad', 'MBA', 'Graduate')),
  application_deadline DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_universities_user ON user_universities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_universities_university ON user_universities(university_id);
CREATE INDEX IF NOT EXISTS idx_user_universities_deadline ON user_universities(application_deadline);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  user_university_id BIGINT NOT NULL REFERENCES user_universities(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  phase VARCHAR(50) NOT NULL CHECK (phase IN ('Research', 'Standardized Tests', 'Essays', 'Resume', 'Recommendations', 'Submission & Review', 'Enrollment')),
  status VARCHAR(20) NOT NULL DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Completed')),
  priority VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_university ON tasks(user_university_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Create peer_stats table
CREATE TABLE IF NOT EXISTS peer_stats (
  id BIGSERIAL PRIMARY KEY,
  university_id BIGINT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  avg_progress_percentage DECIMAL(5,2) NOT NULL,
  avg_tasks_completed DECIMAL(5,2) NOT NULL,
  avg_days_before_deadline INTEGER NOT NULL,
  sample_size INTEGER NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_peer_stats_university ON peer_stats(university_id);

-- Enable Row Level Security (optional, for production)
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_stats ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for demo)
CREATE POLICY "Enable all for universities" ON universities FOR ALL USING (true);
CREATE POLICY "Enable all for user_universities" ON user_universities FOR ALL USING (true);
CREATE POLICY "Enable all for tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Enable all for peer_stats" ON peer_stats FOR ALL USING (true);
  `;
  
  console.log('Table creation SQL prepared. Please run this in Supabase SQL Editor.');
  console.log('Or use Supabase Dashboard to create these tables.');
  
  // In a real deployment, you would execute this SQL via Supabase API
  // For now, we'll document it for the user to run manually
  
  return sql;
};

export const getPool = () => supabase;

