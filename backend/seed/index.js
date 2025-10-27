import { initializeDatabase, createTables, supabase } from '../config/supabase.js';

const universities = [
  // MBA Programs
  { 
    name: 'Harvard Business School', 
    country: 'United States', 
    world_ranking: 1, 
    website: 'https://www.hbs.edu',
    program_type: 'MBA',
    field_of_study: 'Business',
    avg_gmat_score: 730,
    avg_gpa: 3.7,
    avg_work_experience_years: 4.5,
    acceptance_rate: 0.11,
    annual_tuition_usd: 73440,
    scholarship_rate: 0.25,
    application_deadline: '2024-01-03',
    requirements: { essays: true, recommendations: 2, interview: true },
    strengths: ['Leadership', 'Entrepreneurship', 'Global Network']
  },
  { 
    name: 'Stanford Graduate School of Business', 
    country: 'United States', 
    world_ranking: 2, 
    website: 'https://www.gsb.stanford.edu',
    program_type: 'MBA',
    field_of_study: 'Business',
    avg_gmat_score: 734,
    avg_gpa: 3.7,
    avg_work_experience_years: 4.2,
    acceptance_rate: 0.06,
    annual_tuition_usd: 74400,
    scholarship_rate: 0.30,
    application_deadline: '2024-01-09',
    requirements: { essays: true, recommendations: 2, interview: true },
    strengths: ['Innovation', 'Technology', 'Venture Capital']
  },
  { 
    name: 'Wharton School', 
    country: 'United States', 
    world_ranking: 3, 
    website: 'https://www.wharton.upenn.edu',
    program_type: 'MBA',
    field_of_study: 'Business',
    avg_gmat_score: 728,
    avg_gpa: 3.6,
    avg_work_experience_years: 4.8,
    acceptance_rate: 0.23,
    annual_tuition_usd: 81400,
    scholarship_rate: 0.20,
    application_deadline: '2024-01-05',
    requirements: { essays: true, recommendations: 2, interview: true },
    strengths: ['Finance', 'Consulting', 'Analytics']
  },
  { 
    name: 'MIT Sloan School of Management', 
    country: 'United States', 
    world_ranking: 4, 
    website: 'https://mitsloan.mit.edu',
    program_type: 'MBA',
    field_of_study: 'Business',
    avg_gmat_score: 720,
    avg_gpa: 3.5,
    avg_work_experience_years: 4.0,
    acceptance_rate: 0.14,
    annual_tuition_usd: 77400,
    scholarship_rate: 0.35,
    application_deadline: '2024-01-17',
    requirements: { essays: true, recommendations: 2, interview: true },
    strengths: ['Technology', 'Innovation', 'Data Science']
  },
  { 
    name: 'Chicago Booth School of Business', 
    country: 'United States', 
    world_ranking: 5, 
    website: 'https://www.chicagobooth.edu',
    program_type: 'MBA',
    field_of_study: 'Business',
    avg_gmat_score: 730,
    avg_gpa: 3.6,
    avg_work_experience_years: 4.5,
    acceptance_rate: 0.24,
    annual_tuition_usd: 74400,
    scholarship_rate: 0.28,
    application_deadline: '2024-01-04',
    requirements: { essays: true, recommendations: 2, interview: true },
    strengths: ['Economics', 'Finance', 'Quantitative Analysis']
  },

  // Computer Science Programs
  { 
    name: 'Stanford University', 
    country: 'United States', 
    world_ranking: 6, 
    website: 'https://www.stanford.edu',
    program_type: 'Graduate',
    field_of_study: 'Computer Science',
    avg_gmat_score: 0, // GRE instead
    avg_gpa: 3.8,
    avg_work_experience_years: 2.0,
    acceptance_rate: 0.05,
    annual_tuition_usd: 56000,
    scholarship_rate: 0.40,
    application_deadline: '2024-01-15',
    requirements: { essays: true, recommendations: 3, interview: false },
    strengths: ['AI/ML', 'Systems', 'Theory']
  },
  { 
    name: 'MIT', 
    country: 'United States', 
    world_ranking: 7, 
    website: 'https://web.mit.edu',
    program_type: 'Graduate',
    field_of_study: 'Computer Science',
    avg_gmat_score: 0,
    avg_gpa: 3.9,
    avg_work_experience_years: 1.5,
    acceptance_rate: 0.07,
    annual_tuition_usd: 55000,
    scholarship_rate: 0.45,
    application_deadline: '2024-01-15',
    requirements: { essays: true, recommendations: 3, interview: false },
    strengths: ['AI', 'Robotics', 'Systems']
  },
  { 
    name: 'Carnegie Mellon University', 
    country: 'United States', 
    world_ranking: 8, 
    website: 'https://www.cmu.edu',
    program_type: 'Graduate',
    field_of_study: 'Computer Science',
    avg_gmat_score: 0,
    avg_gpa: 3.7,
    avg_work_experience_years: 2.5,
    acceptance_rate: 0.15,
    annual_tuition_usd: 48000,
    scholarship_rate: 0.30,
    application_deadline: '2024-01-15',
    requirements: { essays: true, recommendations: 3, interview: false },
    strengths: ['Software Engineering', 'AI', 'Cybersecurity']
  },
  { 
    name: 'UC Berkeley', 
    country: 'United States', 
    world_ranking: 9, 
    website: 'https://www.berkeley.edu',
    program_type: 'Graduate',
    field_of_study: 'Computer Science',
    avg_gmat_score: 0,
    avg_gpa: 3.8,
    avg_work_experience_years: 2.0,
    acceptance_rate: 0.12,
    annual_tuition_usd: 28000,
    scholarship_rate: 0.35,
    application_deadline: '2024-01-15',
    requirements: { essays: true, recommendations: 3, interview: false },
    strengths: ['Systems', 'AI', 'Databases']
  },
  { 
    name: 'University of Washington', 
    country: 'United States', 
    world_ranking: 10, 
    website: 'https://www.washington.edu',
    program_type: 'Graduate',
    field_of_study: 'Computer Science',
    avg_gmat_score: 0,
    avg_gpa: 3.6,
    avg_work_experience_years: 3.0,
    acceptance_rate: 0.20,
    annual_tuition_usd: 35000,
    scholarship_rate: 0.25,
    application_deadline: '2024-01-15',
    requirements: { essays: true, recommendations: 3, interview: false },
    strengths: ['Systems', 'HCI', 'Graphics']
  },

  // Engineering Programs
  { 
    name: 'Georgia Institute of Technology', 
    country: 'United States', 
    world_ranking: 11, 
    website: 'https://www.gatech.edu',
    program_type: 'Graduate',
    field_of_study: 'Engineering',
    avg_gmat_score: 0,
    avg_gpa: 3.5,
    avg_work_experience_years: 2.5,
    acceptance_rate: 0.25,
    annual_tuition_usd: 32000,
    scholarship_rate: 0.30,
    application_deadline: '2024-01-15',
    requirements: { essays: true, recommendations: 3, interview: false },
    strengths: ['Mechanical', 'Electrical', 'Industrial']
  },
  { 
    name: 'University of Michigan', 
    country: 'United States', 
    world_ranking: 12, 
    website: 'https://umich.edu',
    program_type: 'Graduate',
    field_of_study: 'Engineering',
    avg_gmat_score: 0,
    avg_gpa: 3.6,
    avg_work_experience_years: 2.0,
    acceptance_rate: 0.30,
    annual_tuition_usd: 50000,
    scholarship_rate: 0.20,
    application_deadline: '2024-01-15',
    requirements: { essays: true, recommendations: 3, interview: false },
    strengths: ['Mechanical', 'Aerospace', 'Materials']
  },

  // Undergraduate Programs
  { 
    name: 'Princeton University', 
    country: 'United States', 
    world_ranking: 13, 
    website: 'https://www.princeton.edu',
    program_type: 'Undergrad',
    field_of_study: 'General',
    avg_gmat_score: 0,
    avg_gpa: 3.9,
    avg_work_experience_years: 0,
    acceptance_rate: 0.04,
    annual_tuition_usd: 56000,
    scholarship_rate: 0.60,
    application_deadline: '2024-01-01',
    requirements: { essays: true, recommendations: 2, interview: true },
    strengths: ['Liberal Arts', 'Research', 'Small Classes']
  },
  { 
    name: 'Yale University', 
    country: 'United States', 
    world_ranking: 14, 
    website: 'https://www.yale.edu',
    program_type: 'Undergrad',
    field_of_study: 'General',
    avg_gmat_score: 0,
    avg_gpa: 3.8,
    avg_work_experience_years: 0,
    acceptance_rate: 0.05,
    annual_tuition_usd: 62000,
    scholarship_rate: 0.55,
    application_deadline: '2024-01-02',
    requirements: { essays: true, recommendations: 2, interview: true },
    strengths: ['Liberal Arts', 'Humanities', 'Social Sciences']
  },
  { 
    name: 'Columbia University', 
    country: 'United States', 
    world_ranking: 15, 
    website: 'https://www.columbia.edu',
    program_type: 'Undergrad',
    field_of_study: 'General',
    avg_gmat_score: 0,
    avg_gpa: 3.7,
    avg_work_experience_years: 0,
    acceptance_rate: 0.06,
    annual_tuition_usd: 65000,
    scholarship_rate: 0.50,
    application_deadline: '2024-01-01',
    requirements: { essays: true, recommendations: 2, interview: true },
    strengths: ['Liberal Arts', 'Research', 'New York City']
  },

  // International Programs
  { 
    name: 'University of Cambridge', 
    country: 'United Kingdom', 
    world_ranking: 16, 
    website: 'https://www.cam.ac.uk',
    program_type: 'Graduate',
    field_of_study: 'General',
    avg_gmat_score: 0,
    avg_gpa: 3.8,
    avg_work_experience_years: 2.0,
    acceptance_rate: 0.21,
    annual_tuition_usd: 45000,
    scholarship_rate: 0.15,
    application_deadline: '2024-01-15',
    requirements: { essays: true, recommendations: 2, interview: true },
    strengths: ['Research', 'History', 'Academia']
  },
  { 
    name: 'University of Oxford', 
    country: 'United Kingdom', 
    world_ranking: 17, 
    website: 'https://www.ox.ac.uk',
    program_type: 'Graduate',
    field_of_study: 'General',
    avg_gmat_score: 0,
    avg_gpa: 3.7,
    avg_work_experience_years: 2.5,
    acceptance_rate: 0.17,
    annual_tuition_usd: 42000,
    scholarship_rate: 0.20,
    application_deadline: '2024-01-15',
    requirements: { essays: true, recommendations: 2, interview: true },
    strengths: ['Research', 'Humanities', 'Tutorial System']
  },
  { 
    name: 'ETH Zurich', 
    country: 'Switzerland', 
    world_ranking: 18, 
    website: 'https://ethz.ch',
    program_type: 'Graduate',
    field_of_study: 'Engineering',
    avg_gmat_score: 0,
    avg_gpa: 3.6,
    avg_work_experience_years: 1.5,
    acceptance_rate: 0.27,
    annual_tuition_usd: 1500,
    scholarship_rate: 0.10,
    application_deadline: '2024-01-15',
    requirements: { essays: false, recommendations: 2, interview: false },
    strengths: ['Engineering', 'Mathematics', 'Physics']
  },
  { 
    name: 'National University of Singapore', 
    country: 'Singapore', 
    world_ranking: 19, 
    website: 'https://www.nus.edu.sg',
    program_type: 'Graduate',
    field_of_study: 'General',
    avg_gmat_score: 0,
    avg_gpa: 3.5,
    avg_work_experience_years: 2.0,
    acceptance_rate: 0.30,
    annual_tuition_usd: 18000,
    scholarship_rate: 0.25,
    application_deadline: '2024-01-15',
    requirements: { essays: true, recommendations: 2, interview: false },
    strengths: ['Business', 'Engineering', 'Medicine']
  },
  { 
    name: 'University of Toronto', 
    country: 'Canada', 
    world_ranking: 20, 
    website: 'https://www.utoronto.ca',
    program_type: 'Graduate',
    field_of_study: 'General',
    avg_gmat_score: 0,
    avg_gpa: 3.4,
    avg_work_experience_years: 2.5,
    acceptance_rate: 0.35,
    annual_tuition_usd: 25000,
    scholarship_rate: 0.30,
    application_deadline: '2024-01-15',
    requirements: { essays: true, recommendations: 2, interview: false },
    strengths: ['Research', 'Medicine', 'Engineering']
  }
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
    console.log('Initializing Supabase connection...');
    await initializeDatabase();
    
    console.log('Creating tables...');
    const sql = await createTables();
    console.log('\n⚠️  IMPORTANT: Please run the SQL in Supabase Dashboard');
    console.log('Go to: Supabase Project → SQL Editor → New Query');
    console.log('\nSQL to run:');
    console.log('='.repeat(50));
    console.log(sql);
    console.log('='.repeat(50));
    
    // Clear existing data
    console.log('\nClearing existing data...');
    await supabase.from('peer_stats').delete().neq('id', 0);
    await supabase.from('tasks').delete().neq('id', 0);
    await supabase.from('user_universities').delete().neq('id', 0);
    await supabase.from('universities').delete().neq('id', 0);
    
    // Insert universities
    console.log('Inserting universities...');
    const { data: insertedUniversities, error: uniError } = await supabase
      .from('universities')
      .insert(universities)
      .select();
    
    if (uniError) {
      console.error('Error inserting universities:', uniError);
      throw uniError;
    }
    
    console.log(`✓ Inserted ${insertedUniversities?.length || 0} universities`);
    
    // Map peer stats to actual university IDs
    console.log('Mapping peer stats to inserted universities...');
    // Sort inserted universities by ranking to match peer stats
    const sortedUniversities = [...insertedUniversities].sort((a, b) => 
      (a.world_ranking || 999) - (b.world_ranking || 999)
    );
    
    // Map peer stats data to use actual university IDs
    const peerStatsFormatted = peerStatsData.map((stat, index) => {
      const university = sortedUniversities[index];
      if (!university) {
        console.warn(`No university found for peer stat index ${index}`);
        return null;
      }
      return {
        university_id: university.id,
        avg_progress_percentage: stat.avg_progress,
        avg_tasks_completed: stat.avg_tasks,
        avg_days_before_deadline: stat.avg_days,
        sample_size: stat.sample_size,
      };
    }).filter(Boolean);
    
    // Insert peer stats
    console.log('Inserting peer stats...');
    if (peerStatsFormatted.length === 0) {
      console.log('⚠️  No peer stats to insert');
    } else {
      const { error: statsError } = await supabase
        .from('peer_stats')
        .insert(peerStatsFormatted);
      
      if (statsError) {
        console.error('Error inserting peer stats:', statsError);
        throw statsError;
      }
      
      console.log(`✓ Inserted ${peerStatsFormatted.length} peer stats records`);
    }
    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    process.exit(0);
  }
};

seedDatabase();

