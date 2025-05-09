
import { Pool } from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';
import { exec } from 'child_process';
import net from 'net';

// Load environment variables
dotenv.config();

// Try updated connection configuration with improved settings
const dbConfig = {
  host: process.env.DB_ENDPOINT || 'database-alohacenter.cshguag6ii9q.us-east-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'clinic_management',
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 15000, // Increase timeout to 15 seconds
  query_timeout: 10000, // Set query timeout
  max: 2, // Limit max connections for test
  idleTimeoutMillis: 10000 // Release connections after 10 seconds idle
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000; // 3 seconds

async function testConnection(retryCount = 0) {
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
    
    // Retry logic
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying connection in ${RETRY_DELAY/1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      await testConnection(retryCount + 1);
    }
  } finally {
    await pool.end();
  }
}

async function runNetworkDiagnostics() {
  console.log('Testing database connection...');
  console.log('DB_TYPE:', process.env.DB_TYPE);
  console.log('NODE_ENV:', process.env.NODE_ENV);

  // Run database-specific tests
  if (process.env.DB_TYPE === 'memory') {
    console.log('Testing in-memory database');
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
    
    // Run network diagnostics
    console.log(`Running network diagnostics to ${dbConfig.host}:${dbConfig.port}...`);

    try {
      // First resolve DNS to verify hostname resolution
      const { address, family } = await dns.promises.lookup(dbConfig.host);
      console.log(`DNS resolved ${dbConfig.host} to ${address} (IPv${family})`);
      
      // Try to ping the host to check basic connectivity
      console.log('Ping results:');
      try {
        await new Promise((resolve, reject) => {
          exec(`ping -c 3 ${dbConfig.host}`, (error, stdout, stderr) => {
            console.log(stdout || stderr || 'No output');
            resolve();
          });
        });
      } catch (pingErr) {
        console.log('Ping command not available or failed');
      }
      
      // Try a TCP connection check with timeout
      console.log(`Testing TCP connection to ${dbConfig.host}:${dbConfig.port}...`);
      let tcpSuccess = false;
      
      await new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(5000);
        
        socket.on('connect', () => {
          console.log('TCP connection successful! 👍');
          tcpSuccess = true;
          socket.end();
          resolve();
        });
        
        socket.on('timeout', () => {
          console.log('TCP connection timeout');
          socket.destroy();
          resolve();
        });
        
        socket.on('error', (err) => {
          console.log(`TCP connection error: ${err.message}`);
          resolve();
        });
        
        socket.connect(dbConfig.port, dbConfig.host);
      });
      
      if (!tcpSuccess) {
        console.log('\n⚠️ TCP connection failed. Possible reasons:');
        console.log('1. Firewall blocking connections from Replit');
        console.log('2. AWS RDS security group not allowing traffic from Replit IP');
        console.log('3. Database instance is down or not accepting connections');
        console.log('\nSolution steps:');
        console.log('1. Make sure your RDS security group allows inbound on port 5432 from Replit IPs');
        console.log('2. Check if the database is running and accessible');
        console.log('3. Consider using a Replit managed PostgreSQL database');
      }
      
      console.log('\nAttempting PostgreSQL connection...');
      // The connection test will be run by the main function
    } catch (error) {
      console.error('Error during network diagnostics:', error.message);
    }
  }
}

// Run the tests
(async () => {
  await runNetworkDiagnostics();
  await testConnection();
})();
