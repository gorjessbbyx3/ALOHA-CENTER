#!/usr/bin/env node

/**
 * This script helps with database migrations on Vercel
 * Run it with: `node vercel-db-migrate.js`
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

// Ensure we're in the project root
process.chdir(path.resolve(__dirname));

// Check if drizzle.config.ts exists
if (!existsSync('./drizzle.config.ts')) {
  console.error('❌ Drizzle configuration not found. Make sure drizzle.config.ts exists.');
  process.exit(1);
}

// Check if DATABASE_URL environment variable is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set.');
  console.error('Make sure to set it in your Vercel project settings.');
  process.exit(1);
}

console.log('🔍 Verifying database connection...');
try {
  // Simple database connection check
  execSync('npx drizzle-kit generate:pg');
  console.log('✅ Database connection verified!');
} catch (error) {
  console.error('❌ Unable to connect to database:', error.message);
  console.error('Please check your DATABASE_URL and make sure your database is accessible from Vercel.');
  process.exit(1);
}

console.log('🔄 Running database migrations...');
try {
  execSync('npx drizzle-kit push', { stdio: 'inherit' });
  console.log('✅ Database migrations completed successfully!');
} catch (error) {
  console.error('❌ Database migration failed:', error.message);
  process.exit(1);
}

console.log('\n🚀 Your database is now ready to use with your Vercel deployment!');
console.log('📝 Note: If you make schema changes, you need to run this script again.');