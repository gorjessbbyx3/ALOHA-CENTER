
// Simple script to test PostgreSQL connection
const { Pool } = require('pg');

// Database configuration
const dbConfig = {
  host: 'database-alohacenter.cshguag6ii9q.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'clinic_management',
  user: 'postgres',
  password: 'Camputer69!',
  ssl: {
    rejectUnauthorized: false
  }
};

async function testConnection() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('Attempting to connect to PostgreSQL database...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    
    console.log('✅ Successfully connected to the database!');
    console.log(`Database timestamp: ${result.rows[0].current_time}`);
    
    // Test if schema tables exist
    try {
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      console.log('\nFound tables in the database:');
      if (tablesResult.rows.length === 0) {
        console.log('No tables found. The database appears to be empty.');
      } else {
        tablesResult.rows.forEach(row => {
          console.log(`- ${row.table_name}`);
        });
      }
    } catch (tableErr) {
      console.error('Error checking tables:', tableErr.message);
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('Testing database connection...');
  
  // Get database credentials
  const dbHost = process.env.DB_ENDPOINT || 'database-alohacenter.cshguag6ii9q.us-east-1.rds.amazonaws.com';
  const dbPort = Number(process.env.DB_PORT || '5432');
  const dbName = process.env.DB_NAME || 'clinic_management';
  const dbUser = process.env.DB_USERNAME || 'postgres';
  const dbPassword = process.env.DB_PASSWORD;

  console.log(`Connecting to: ${dbHost}:${dbPort}/${dbName} as ${dbUser}`);
  
  // Create connection pool
  const pool = new Pool({
    host: dbHost,
    port: dbPort,
    database: dbName,
    user: dbUser,
    password: dbPassword,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Test query
    const result = await pool.query('SELECT NOW()');
    console.log('Connection successful!');
    console.log('Server time:', result.rows[0].now);
    
    // Test schema access
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\nAvailable tables:');
    tables.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    return true;
  } catch (error) {
    console.error('Connection failed:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

// Run the test
testConnection()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
