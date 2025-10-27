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
-- Create universities table (enhanced for matching algorithm)
CREATE TABLE IF NOT EXISTS universities (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  world_ranking INTEGER,
  website VARCHAR(255),
  logo_url VARCHAR(500),
  -- Enhanced fields for matching algorithm
  program_type VARCHAR(50) NOT NULL DEFAULT 'Undergrad',
  field_of_study VARCHAR(100) NOT NULL DEFAULT 'General',
  avg_gmat_score INTEGER,
  avg_gpa DECIMAL(3,2),
  avg_work_experience_years DECIMAL(3,1),
  acceptance_rate DECIMAL(5,4),
  annual_tuition_usd INTEGER,
  scholarship_rate DECIMAL(5,4),
  application_deadline DATE,
  requirements JSONB,
  strengths TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_assessments table
CREATE TABLE IF NOT EXISTS user_assessments (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  gmat_score INTEGER,
  gpa DECIMAL(3,2),
  work_experience_years INTEGER,
  program_type VARCHAR(50) NOT NULL,
  field_of_interest VARCHAR(100) NOT NULL,
  preferred_locations TEXT[],
  max_budget INTEGER,
  deadline_flexibility VARCHAR(20) DEFAULT 'moderate',
  -- Priority weights (sum to 1.0)
  weight_gmat DECIMAL(3,2) DEFAULT 0.25,
  weight_gpa DECIMAL(3,2) DEFAULT 0.20,
  weight_program DECIMAL(3,2) DEFAULT 0.15,
  weight_work DECIMAL(3,2) DEFAULT 0.10,
  weight_rank DECIMAL(3,2) DEFAULT 0.10,
  weight_acceptance DECIMAL(3,2) DEFAULT 0.05,
  weight_cost DECIMAL(3,2) DEFAULT 0.05,
  weight_scholarship DECIMAL(3,2) DEFAULT 0.05,
  weight_location DECIMAL(3,2) DEFAULT 0.05,
  -- Additional preferences
  strong_essays BOOLEAN DEFAULT false,
  research_experience BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Create university_recommendations table (cache results)
CREATE TABLE IF NOT EXISTS university_recommendations (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  assessment_id BIGINT REFERENCES user_assessments(id) ON DELETE CASCADE,
  university_id BIGINT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  match_score DECIMAL(5,4) NOT NULL,
  probability DECIMAL(5,4) NOT NULL,
  rank_position INTEGER NOT NULL,
  breakdown JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_universities_name ON universities(name);
CREATE INDEX IF NOT EXISTS idx_universities_ranking ON universities(world_ranking);
CREATE INDEX IF NOT EXISTS idx_universities_program_type ON universities(program_type);
CREATE INDEX IF NOT EXISTS idx_universities_field ON universities(field_of_study);
CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_universities_user ON user_universities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_universities_university ON user_universities(university_id);
CREATE INDEX IF NOT EXISTS idx_user_universities_deadline ON user_universities(application_deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_university ON tasks(user_university_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_peer_stats_university ON peer_stats(university_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON university_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_assessment ON university_recommendations(assessment_id);

-- Enable Row Level Security (optional, for production)
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for demo)
CREATE POLICY "Enable all for universities" ON universities FOR ALL USING (true);
CREATE POLICY "Enable all for user_assessments" ON user_assessments FOR ALL USING (true);
CREATE POLICY "Enable all for user_universities" ON user_universities FOR ALL USING (true);
CREATE POLICY "Enable all for tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Enable all for peer_stats" ON peer_stats FOR ALL USING (true);
CREATE POLICY "Enable all for university_recommendations" ON university_recommendations FOR ALL USING (true);
  `;
  
  console.log('Table creation SQL prepared. Please run this in Supabase SQL Editor.');
  console.log('Or use Supabase Dashboard to create these tables.');
  
  // In a real deployment, you would execute this SQL via Supabase API
  // For now, we'll document it for the user to run manually
  
  return sql;
};

export const getPool = () => supabase;

