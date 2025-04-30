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
  // Install necessary types that might be missing
  console.log('\n📦 Ensuring all dependencies are properly installed...');
  try {
    // Ensuring TypeScript and ESBuild are available
    if (!fs.existsSync('./node_modules/.bin/tsc')) {
      console.log('Installing TypeScript...');
      execSync('npm install typescript@latest --no-save', { stdio: 'inherit' });
    }
    
    if (!fs.existsSync('./node_modules/.bin/esbuild')) {
      console.log('Installing ESBuild...');
      execSync('npm install esbuild@latest --no-save', { stdio: 'inherit' });
    }
  } catch (depError) {
    console.warn('Warning: Could not install additional dependencies:', depError.message);
  }

  // Build the client application
  console.log('\n📦 Building client application...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Build the server application - using CommonJS format for better Vercel compatibility
  console.log('\n📦 Building server application...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=cjs --outdir=dist', {
    stdio: 'inherit'
  });
  
  // Fix any ESM/CJS compatibility issues
  console.log('\n🔧 Applying build fixes for Vercel compatibility...');
  
  // Create a basic index.js entry point for Vercel
  const indexPath = path.join(__dirname, 'dist', 'index.js');
  if (fs.existsSync(indexPath)) {
    console.log('✅ Ensuring index.js is properly formatted');
    const content = fs.readFileSync(indexPath, 'utf8');
    
    // Add a shebang if missing 
    if (!content.startsWith('#!/usr/bin/env node')) {
      fs.writeFileSync(
        indexPath,
        `#!/usr/bin/env node\n${content}`
      );
    }
    
    // Make the file executable
    try {
      fs.chmodSync(indexPath, '755');
    } catch (chmodError) {
      console.warn('Warning: Could not make index.js executable:', chmodError.message);
    }
    
    // Copy the error handler to the dist directory
    console.log('✅ Setting up Vercel error handling...');
    try {
      fs.copyFileSync(
        path.join(__dirname, 'vercel-error-handler.js'),
        path.join(__dirname, 'dist', 'vercel-error-handler.js')
      );
    } catch (copyError) {
      console.warn('Warning: Could not copy error handler:', copyError.message);
    }
  }
  
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
# CALENDLY_API_KEY=
# CALENDLY_USER_URI=
# CALENDLY_ORG_URI=
`
    );
    console.log('✅ Created .env.production file');
  }
  
  console.log('\n🚀 Build process complete! Ready for Vercel deployment.');
  
} catch (error) {
  console.error(`\n❌ Build failed: ${error.message}`);
  process.exit(1);
}