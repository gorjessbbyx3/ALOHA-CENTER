import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Try updated connection configuration with timeout settings
const dbConfig = {
  host: process.env.DB_ENDPOINT || 'database-alohacenter.cshguag6ii9q.us-east-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'clinic_management',
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'Camputer69!',
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000, // Increase timeout to 10 seconds
  query_timeout: 10000 // Set query timeout
};

async function testConnection() {
  const pool = new Pool(dbConfig);

  try {
    console.log('Attempting to connect to PostgreSQL database...');
    console.log(`Host: ${dbConfig.host}`);
    console.log(`Port: ${dbConfig.port}`);
    console.log(`Database: ${dbConfig.database}`);
    console.log(`User: ${dbConfig.user}`);

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
// Database connection test script
console.log('Testing database connection...');
console.log('DB_TYPE:', process.env.DB_TYPE);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Run database-specific tests
if (process.env.DB_TYPE === 'memory') {
  console.log('Testing in-memory database');
  // In-memory database doesn't need additional tests
  console.log('In-memory database should work without issues');
  process.exit(0);
} else {
  console.log('Testing PostgreSQL connection');
  console.log('DB_ENDPOINT:', process.env.DB_ENDPOINT);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_USERNAME:', process.env.DB_USERNAME);
  
  // Check if DB_PASSWORD is set
  if (!process.env.DB_PASSWORD) {
    console.error('DB_PASSWORD not set! This is required for PostgreSQL connection.');
    process.exit(1);
  } else {
    console.log('DB_PASSWORD: [REDACTED - Password is set]');
  }
  
  // Try to connect using raw pg
  // Create a new pool with the same connection as above
  const secondPool = new Pool({
    host: process.env.DB_ENDPOINT || 'database-alohacenter.cshguag6ii9q.us-east-1.rds.amazonaws.com',
    port: Number(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'clinic_management',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  // Try to resolve the hostname first to check DNS
const dns = require('dns').promises;

dns.lookup(dbConfig.host)
  .then(({ address, family }) => {
    console.log(`DNS resolved ${dbConfig.host} to ${address} (IPv${family})`);
    
    // Continue with the connection attempt
    return secondPool.query('SELECT NOW()');
  })
  .then(res => {
    console.log('🟢 Successfully connected to PostgreSQL!');
    console.log('Time from database:', res.rows[0].now);
    process.exit(0);
  })
  .catch(err => {
    console.error('🔴 PostgreSQL connection error:', err.message);
    if (err.code === 'ETIMEDOUT') {
      console.error('Connection timed out. Possible reasons:');
      console.error('1. Database server is down or unreachable');
      console.error('2. Database security group does not allow connections from Replit IP');
      console.error('3. AWS RDS instance is in private subnet without proper routing');
    }
    console.error('Full error:', err);
    console.error('Check your database credentials and connectivity');
    process.exit(1);
  });
}
