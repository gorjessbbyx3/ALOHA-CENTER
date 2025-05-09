
import { Pool } from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';
import { exec } from 'child_process';
import net from 'net';

// Load environment variables
dotenv.config();

// RDS Proxy configuration
const proxyConfig = {
  host: process.env.DB_PROXY_ENDPOINT || 'replit.proxy-cshguag6ii9q.us-east-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'clinic_management',
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: true,
  connectionTimeoutMillis: 15000,
  query_timeout: 10000,
  max: 2,
  idleTimeoutMillis: 10000
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000; // 3 seconds

async function testProxyConnection(retryCount = 0) {
  const pool = new Pool(proxyConfig);

  try {
    console.log('Attempting to connect to PostgreSQL database through RDS Proxy...');
    console.log(`Proxy Endpoint: ${proxyConfig.host}`);
    console.log(`Port: ${proxyConfig.port}`);
    console.log(`Database: ${proxyConfig.database}`);
    console.log(`User: ${proxyConfig.user}`);

    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');

    console.log('✅ Successfully connected to the database through RDS Proxy!');
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
    console.error('❌ RDS Proxy connection failed:');
    console.error(error.message);
    
    // Retry logic
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying connection in ${RETRY_DELAY/1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      await testProxyConnection(retryCount + 1);
    }
  } finally {
    await pool.end();
  }
}

// Run the test
(async () => {
  console.log('Testing RDS Proxy connection...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DB_PROXY_ENDPOINT:', process.env.DB_PROXY_ENDPOINT);
  
  await testProxyConnection();
})();
