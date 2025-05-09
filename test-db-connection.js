
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
