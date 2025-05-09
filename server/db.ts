
import * as schema from "@shared/schema";
import { DatabaseType } from './config';

// Get database type from environment variables
const dbType = process.env.DB_TYPE || 'memory';

console.log(`Using database type: ${dbType}`);

let pool;
let db;

// Handle different database types
if (dbType === 'memory' || dbType === DatabaseType.MEMORY) {
  console.log('Using in-memory database');
  
  // Import SQLite driver for in-memory database
  const { drizzle } = require('drizzle-orm/better-sqlite3');
  const Database = require('better-sqlite3');
  
  // Create in-memory SQLite database
  const sqlite = new Database(':memory:');
  db = drizzle(sqlite, { schema });
  
} else {
  // PostgreSQL connection for production
  const { Pool } = require('pg');
  const { drizzle: pgDrizzle } = require('drizzle-orm/node-postgres');
  
  // Get database credentials from environment variables
  const dbHost = process.env.DB_ENDPOINT || 'database-alohacenter.cshguag6ii9q.us-east-1.rds.amazonaws.com';
  const dbPort = Number(process.env.DB_PORT || '5432');
  const dbName = process.env.DB_NAME || 'clinic_management';
  const dbUser = process.env.DB_USERNAME || 'postgres';
  const dbPassword = process.env.DB_PASSWORD;

  // Check if database credentials are available
  if (!dbPassword) {
    console.error('Database password not set. Please set DB_PASSWORD environment variable.');
    throw new Error('DB_PASSWORD must be set for PostgreSQL connection');
  }

  // Create PostgreSQL connection pool
  pool = new Pool({
    host: dbHost,
    port: dbPort,
    database: dbName,
    user: dbUser,
    password: dbPassword,
    ssl: {
      rejectUnauthorized: false
    }
  });

  // Initialize Drizzle ORM with connection pool
  db = pgDrizzle(pool, { schema });

  // Test connection
  pool.query('SELECT NOW()')
    .then(res => {
      console.log('Connected to PostgreSQL database:', dbHost);
    })
    .catch(err => {
      console.error('Database connection error:', err);
      // Don't crash the app, but log the error
      console.error('Check your database credentials and connectivity');
    });
}

// Export the database connection
export { pool, db };
