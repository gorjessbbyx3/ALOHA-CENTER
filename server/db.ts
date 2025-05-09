
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/pg';
import * as schema from "@shared/schema";

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
export const pool = new Pool({
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
export const db = drizzle(pool, { schema });

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to PostgreSQL database:', dbHost);
  }
});
