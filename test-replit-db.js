
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Quick disk cleanup before connecting
try {
  console.log('🧹 Running quick disk cleanup before connecting...');
  if (fs.existsSync('./node_modules/.vite')) {
    execSync('rm -rf ./node_modules/.vite');
    console.log('Cleared Vite cache');
  }
} catch (error) {
  console.warn('Warning: Cleanup failed:', error.message);
}

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
