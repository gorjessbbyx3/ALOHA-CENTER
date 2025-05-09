
import * as schema from "@shared/schema";
import { DatabaseType } from './config';
import Database from 'better-sqlite3';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { Pool } from 'pg';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';

// Get database type from environment variables
const dbType = process.env.DB_TYPE || 'memory';

console.log(`Using database type: ${dbType}`);

// Check if using RDS Proxy
const useRdsProxy = process.env.USE_RDS_PROXY === 'true';

// Define variables with proper initialization
let pool;
let db;

// Initialize database based on configuration
if (dbType === 'memory' || dbType === DatabaseType.MEMORY) {
  console.log('Using in-memory SQLite database');
  
  try {
    // Create in-memory SQLite database
    const sqlite = new Database(':memory:');
    db = drizzleSqlite(sqlite, { schema });
    
    // Create schema tables immediately for SQLite
    createSchemaIfNeeded().catch(err => {
      console.error('Error creating schema tables:', err);
    });
  } catch (error) {
    console.error('Error initializing SQLite database:', error);
  }
} else {
  console.log('Using PostgreSQL database');
  
  try {
    let dbHost, dbPort, dbName, dbUser, dbPassword, sslConfig;
    
    // Determine connection details based on whether we're using RDS Proxy
    if (useRdsProxy) {
      // RDS Proxy connection
      dbHost = process.env.DB_PROXY_ENDPOINT || 'replit.proxy-cshguag6ii9q.us-east-1.rds.amazonaws.com';
      dbPort = Number(process.env.DB_PROXY_PORT || '5432');
      dbName = process.env.DB_NAME || 'clinic_management';
      dbUser = process.env.DB_USERNAME || 'postgres';
      dbPassword = process.env.DB_PASSWORD;
      sslConfig = true; // RDS Proxy requires SSL
      
      console.log('Using RDS Proxy endpoint for connection');
    } else {
      // Direct RDS connection
      dbHost = process.env.DB_ENDPOINT || 'database-alohacenter.cshguag6ii9q.us-east-1.rds.amazonaws.com';
      dbPort = Number(process.env.DB_PORT || '5432');
      dbName = process.env.DB_NAME || 'clinic_management';
      dbUser = process.env.DB_USERNAME || 'postgres';
      dbPassword = process.env.DB_PASSWORD;
      sslConfig = { rejectUnauthorized: false };
    }

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
      ssl: sslConfig,
      // RDS Proxy recommended settings
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 30000 * 60, // Match the 30 minute proxy timeout
      max: 10 // Limit connections
    });

    // Initialize Drizzle ORM with connection pool
    db = drizzlePg(pool, { schema });

    // Test connection
    pool.query('SELECT NOW()')
      .then(res => {
        console.log('Connected to PostgreSQL database:', dbHost);
      })
      .catch(err => {
        console.error('Database connection error:', err);
        console.error('Check your database credentials and connectivity');
      });
  } catch (error) {
    console.error('Error initializing PostgreSQL database:', error);
  }
}

// Create schema tables for SQLite in-memory database
async function createSchemaIfNeeded() {
  if (dbType === 'memory' || dbType === DatabaseType.MEMORY) {
    try {
      // Skip if db is not initialized
      if (!db || !db.run) {
        console.error('Database not properly initialized for schema creation');
        return;
      }
      
      // Create users table
      await db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          email TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'patient',
          created_at TIMESTAMP DEFAULT (datetime('now')),
          updated_at TIMESTAMP DEFAULT (datetime('now'))
        )
      `);
      
      // Create patients table
      await db.run(`
        CREATE TABLE IF NOT EXISTS patients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          patient_id TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          date_of_birth TIMESTAMP,
          address TEXT,
          insurance_provider TEXT,
          insurance_number TEXT,
          last_visit TIMESTAMP,
          status TEXT DEFAULT 'active',
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
      
      // Create services table
      await db.run(`
        CREATE TABLE IF NOT EXISTS services (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          duration INTEGER NOT NULL,
          price NUMERIC NOT NULL
        )
      `);
      
      // Create rooms table
      await db.run(`
        CREATE TABLE IF NOT EXISTS rooms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          capacity INTEGER DEFAULT 1,
          is_active BOOLEAN DEFAULT true
        )
      `);
      
      // Create appointments table
      await db.run(`
        CREATE TABLE IF NOT EXISTS appointments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER,
          service_id INTEGER,
          room_id INTEGER,
          date TIMESTAMP NOT NULL,
          time TEXT NOT NULL,
          duration INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'scheduled',
          notes TEXT,
          payment_status TEXT DEFAULT 'pending',
          payment_amount NUMERIC,
          payment_method TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id),
          FOREIGN KEY (service_id) REFERENCES services(id),
          FOREIGN KEY (room_id) REFERENCES rooms(id)
        )
      `);
      
      // Create treatment_packages table
      await db.run(`
        CREATE TABLE IF NOT EXISTS treatment_packages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          display_name TEXT NOT NULL,
          description TEXT,
          focus TEXT,
          ideal_for TEXT,
          duration TEXT,
          session_type TEXT,
          session_count INTEGER,
          session_cost NUMERIC,
          total_cost NUMERIC,
          add_ons TEXT,
          bonuses TEXT,
          active BOOLEAN DEFAULT 1,
          category TEXT DEFAULT 'standard',
          package_type TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create treatment_plans table
      await db.run(`
        CREATE TABLE IF NOT EXISTS treatment_plans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          start_date TIMESTAMP NOT NULL,
          end_date TIMESTAMP,
          status TEXT NOT NULL DEFAULT 'active',
          goals TEXT,
          notes TEXT,
          progress TEXT,
          package_id INTEGER,
          sessions_completed INTEGER DEFAULT 0,
          total_sessions INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id),
          FOREIGN KEY (package_id) REFERENCES treatment_packages(id)
        )
      `);
      
      // Create gift_cards table
      await db.run(`
        CREATE TABLE IF NOT EXISTS gift_cards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT NOT NULL UNIQUE,
          amount NUMERIC NOT NULL,
          remaining_balance NUMERIC NOT NULL,
          issued_to TEXT,
          issued_email TEXT,
          purchased_by INTEGER,
          status TEXT NOT NULL DEFAULT 'active',
          expiry_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_used TIMESTAMP,
          FOREIGN KEY (purchased_by) REFERENCES patients(id)
        )
      `);
      
      // Create loyalty tables
      await db.run(`
        CREATE TABLE IF NOT EXISTS loyalty_points (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER NOT NULL,
          points INTEGER NOT NULL DEFAULT 0,
          total_earned INTEGER NOT NULL DEFAULT 0,
          level TEXT DEFAULT 'bronze',
          monthly_points_earned INTEGER DEFAULT 0,
          referrals_count INTEGER DEFAULT 0,
          birthday_month INTEGER,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
      `);
      
      await db.run(`
        CREATE TABLE IF NOT EXISTS loyalty_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER NOT NULL,
          points INTEGER NOT NULL,
          type TEXT NOT NULL,
          source TEXT,
          source_id INTEGER,
          description TEXT,
          dollars_spent NUMERIC,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
      `);
      
      await db.run(`
        CREATE TABLE IF NOT EXISTS loyalty_subscriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER NOT NULL,
          plan_type TEXT NOT NULL,
          monthly_fee NUMERIC NOT NULL,
          included_sessions INTEGER NOT NULL,
          includes_reiki BOOLEAN DEFAULT 0,
          includes_pet_add_on BOOLEAN DEFAULT 0,
          start_date TIMESTAMP NOT NULL,
          next_billing_date TIMESTAMP,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
      `);
      
      // Create payments table
      await db.run(`
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          appointment_id INTEGER,
          patient_id INTEGER,
          amount NUMERIC NOT NULL,
          payment_method TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          transaction_id TEXT,
          stripe_payment_intent_id TEXT,
          date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          invoice_pdf_path TEXT,
          FOREIGN KEY (appointment_id) REFERENCES appointments(id),
          FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
      `);
      
      // Create activities table
      await db.run(`
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          description TEXT NOT NULL,
          entity_id INTEGER,
          entity_type TEXT,
          user_id INTEGER,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
      
      // Add other tables as needed for treatment plans, packages, etc.
      
      console.log('Created schema tables for in-memory database');
    } catch (error) {
      console.error('Error creating schema tables:', error);
      throw error;
    }
  }
}

// Export the database connection
export { pool, db };
