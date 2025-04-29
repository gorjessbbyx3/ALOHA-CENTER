#!/usr/bin/env node

/**
 * This script is used by Vercel to build the application for deployment
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure we're in the project root
process.chdir(path.resolve(__dirname));

console.log('🔧 Building application for Vercel deployment...');

try {
  // Build the client application
  console.log('\n📦 Building client application...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Build the server application
  console.log('\n📦 Building server application...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', {
    stdio: 'inherit'
  });
  
  // Verify the build
  if (fs.existsSync(path.join(__dirname, 'dist'))) {
    console.log('\n✅ Build completed successfully!');
  } else {
    console.error('\n❌ Build failed: dist directory not found');
    process.exit(1);
  }
  
  // Create .env file for Vercel if it doesn't exist
  const envFilePath = path.join(__dirname, '.env.production');
  if (!fs.existsSync(envFilePath)) {
    console.log('\n📝 Creating .env.production file...');
    fs.writeFileSync(
      envFilePath,
      `# Environment variables for production
NODE_ENV=production
# Please set these variables in your Vercel project settings
# DATABASE_URL=
# STRIPE_SECRET_KEY=
# VITE_STRIPE_PUBLIC_KEY=
`
    );
    console.log('✅ Created .env.production file');
  }
  
} catch (error) {
  console.error(`\n❌ Build failed: ${error.message}`);
  process.exit(1);
}