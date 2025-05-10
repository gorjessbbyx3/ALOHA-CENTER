
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const { RDSDataClient, ExecuteStatementCommand } = require('@aws-sdk/client-rds-data');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

console.log('Checking AWS Configuration...');
console.log('--------------------------');

// Check for AWS credentials
console.log('AWS Credentials Check:');
console.log(`AWS_REGION: ${process.env.AWS_REGION ? '✅ Set' : '❌ Missing'}`);
console.log(`AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`);
console.log();

// Check for S3 configuration
console.log('S3 Configuration Check:');
console.log(`S3_BUCKET: ${process.env.S3_BUCKET ? '✅ Set' : '❌ Missing'}`);
console.log(`S3_BUCKET_ARN: ${process.env.S3_BUCKET_ARN ? '✅ Set' : '❌ Missing'}`);
console.log();

// Check for RDS configuration
console.log('RDS Configuration Check:');
console.log(`DB_TYPE: ${process.env.DB_TYPE ? '✅ Set' : '❌ Missing'}`);
console.log(`DB_SECRET_ARN: ${process.env.DB_SECRET_ARN ? '✅ Set' : '❌ Missing'}`);
console.log(`DB_RESOURCE_ARN: ${process.env.DB_RESOURCE_ARN ? '✅ Set' : '❌ Missing'}`);
console.log(`DB_NAME: ${process.env.DB_NAME ? '✅ Set' : '❌ Missing'}`);
console.log();

// Try to connect to S3
async function checkS3Connection() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('❌ Cannot test S3 connection: Missing AWS credentials');
    return;
  }

  console.log('Testing S3 Connection...');
  
  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    
    const response = await s3Client.send(new ListBucketsCommand({}));
    console.log(`✅ Successfully connected to S3! Found ${response.Buckets?.length || 0} buckets.`);
    
    // Check if our target bucket exists
    if (process.env.S3_BUCKET) {
      const bucketExists = response.Buckets?.some(bucket => bucket.Name === process.env.S3_BUCKET);
      if (bucketExists) {
        console.log(`✅ Target bucket '${process.env.S3_BUCKET}' found!`);
      } else {
        console.log(`❌ Target bucket '${process.env.S3_BUCKET}' not found in your account.`);
      }
    }
  } catch (error) {
    console.log(`❌ S3 connection failed: ${error.message}`);
  }
}

// Main function
async function main() {
  await checkS3Connection();
  
  // Print configuration summary
  console.log('\nConfiguration Summary:');
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('❌ AWS credentials are missing. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file.');
  } else {
    console.log('✅ AWS credentials are configured.');
  }
  
  if (!process.env.S3_BUCKET) {
    console.log('❌ S3 bucket is not configured. Please set S3_BUCKET in your .env file.');
  }
  
  console.log('\nRecommendations:');
  console.log('1. Ensure all AWS credentials are properly set in your .env file');
  console.log('2. Verify your IAM user has the appropriate permissions for S3 and RDS');
  console.log('3. Double-check that your S3 bucket and RDS database exist and are accessible');
}

main().catch(error => {
  console.error('Error running configuration check:', error);
});
// Simple AWS configuration checker
console.log("Checking AWS configuration...");

// Check for AWS environment variables
const awsVars = {
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_REGION: process.env.AWS_REGION || "",
  S3_BUCKET: process.env.AWS_S3_BUCKET || ""
};

// Log configuration status
console.log("AWS Configuration Status:");
Object.entries(awsVars).forEach(([key, value]) => {
  console.log(`- ${key}: ${value ? "✓ Set" : "✗ Missing"}`);
});

// Provide guidance
if (!awsVars.AWS_ACCESS_KEY_ID || !awsVars.AWS_SECRET_ACCESS_KEY) {
  console.log("\nRecommendation: Set AWS credentials using environment variables.");
  console.log("Use the Secrets tool in Replit to securely set your AWS credentials.");
} else {
  console.log("\nAWS credentials appear to be configured.");
}

console.log("\nNote: For local development with memory storage, AWS credentials are optional.");
console.log("S3 functionality will be disabled when using memory storage mode (DB_TYPE=memory).");
