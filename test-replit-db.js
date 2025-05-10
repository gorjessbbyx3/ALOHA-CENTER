
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testReplitDbConnection() {
  // Get database connection string from Replit environment
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable not found. Please create a Replit PostgreSQL database.');
    return;
  }
  
  console.log('Testing connection to Replit PostgreSQL database...');
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    
    console.log('✅ Successfully connected to the Replit PostgreSQL database!');
    console.log(`Database timestamp: ${result.rows[0].current_time}`);
    
    client.release();
  } catch (error) {
    console.error('❌ Replit database connection failed:');
    console.error(error.message);
  } finally {
    await pool.end();
  }
}

// Run the test
(async () => {
  await testReplitDbConnection();
})();
