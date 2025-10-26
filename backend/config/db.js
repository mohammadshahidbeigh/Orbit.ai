import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'application_planner',
};

let pool;

export const initializeDatabase = async () => {
  try {
    // First, connect without database to create it if it doesn't exist
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await connection.end();

    // Create connection pool
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test connection
    const conn = await pool.getConnection();
    conn.release();
    
    console.log('Database connected successfully');
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

export const createTables = async () => {
  const connection = await pool.getConnection();
  
  try {
    // Universities table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS universities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        country VARCHAR(100) NOT NULL,
        world_ranking INT,
        website VARCHAR(255),
        logo_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_ranking (world_ranking)
      )
    `);

    // User_Universities table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_universities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL DEFAULT 'demo-user',
        university_id INT NOT NULL,
        program_type ENUM('Undergrad', 'MBA', 'Graduate') NOT NULL DEFAULT 'Undergrad',
        application_deadline DATE NOT NULL,
        status ENUM('Active', 'Completed', 'Withdrawn') NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_university (university_id),
        INDEX idx_deadline (application_deadline)
      )
    `);

    // Tasks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_university_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        phase ENUM('Research', 'Standardized Tests', 'Essays', 'Resume', 'Recommendations', 'Submission & Review', 'Enrollment') NOT NULL,
        status ENUM('To Do', 'In Progress', 'Completed') NOT NULL DEFAULT 'To Do',
        priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_university_id) REFERENCES user_universities(id) ON DELETE CASCADE,
        INDEX idx_status (status),
        INDEX idx_university (user_university_id),
        INDEX idx_due_date (due_date)
      )
    `);

    // Peer_Stats table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS peer_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        university_id INT NOT NULL,
        avg_progress_percentage DECIMAL(5,2) NOT NULL,
        avg_tasks_completed DECIMAL(5,2) NOT NULL,
        avg_days_before_deadline INT NOT NULL,
        sample_size INT NOT NULL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE,
        INDEX idx_university (university_id)
      )
    `);

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export const getPool = () => pool;

