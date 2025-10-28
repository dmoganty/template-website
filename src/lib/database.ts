import { Pool } from 'pg';

// PostgreSQL connection configuration
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Database interface for user validation
export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
}

// Function to validate user credentials
export async function validateUser(email: string, name: string, phone?: string): Promise<User | null> {
  try {
    console.log('🔍 Validating user:', { email, name, phone });
    
    // Query to check if user exists in the database
    const query = `
      SELECT id, email, name, phone, created_at, updated_at 
      FROM users 
      WHERE LOWER(email) = LOWER($1) 
      AND LOWER(name) = LOWER($2)
      ${phone ? 'AND phone = $3' : ''}
    `;
    
    const params = phone ? [email, name, phone] : [email, name];
    const result = await pool.query(query, params);
    
    if (result.rows.length > 0) {
      console.log('✅ User found in database:', result.rows[0]);
      return result.rows[0] as User;
    } else {
      console.log('❌ User not found in database');
      return null;
    }
  } catch (error) {
    console.error('🚨 Database error:', error);
    throw new Error('Database connection failed');
  }
}

// Function to test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export default pool;
