// This file serves as an entry point for the Electron app
// that loads environment variables before starting the actual Electron process

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to env file - create if it doesn't exist
const envFilePath = path.join(__dirname, '.env');
if (!fs.existsSync(envFilePath)) {
  console.log('Creating .env file...');
  fs.writeFileSync(envFilePath, '# Environment variables for Clinic Management System\n');
}

// Load environment variables
require('dotenv').config({ path: envFilePath });

// Check for AWS credentials
const awsCredentials = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'DB_INSTANCE_IDENTIFIER',
  'DB_NAME',
  'DB_SECRET_ARN',
  'DB_RESOURCE_ARN'
];

const missingCredentials = awsCredentials.filter(cred => !process.env[cred]);

if (missingCredentials.length > 0) {
  console.log('Missing AWS credentials:');
  missingCredentials.forEach(cred => console.log(`- ${cred}`));
  console.log('\nPlease set these environment variables in the .env file.');
}

// Set a flag to indicate we're running in Electron
process.env.IS_ELECTRON = 'true';

// Start the Electron process
console.log('Starting Electron application...');
const electronProcess = spawn('electron', ['.'], {
  stdio: 'inherit',
  env: process.env
});

electronProcess.on('close', (code) => {
  console.log(`Electron process exited with code ${code}`);
  process.exit(code);
});