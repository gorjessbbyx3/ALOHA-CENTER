import { AWSStorage } from './aws-storage';
import { storage, Storage } from './storage';

// Database configuration options
export enum DatabaseType {
  MEMORY = 'memory',  // In-memory database (for development/testing)
  POSTGRES = 'postgres',  // Local PostgreSQL database
  AWS_RDS = 'aws-rds'  // AWS RDS PostgreSQL database
}

// Get database type from environment variables
// Database configuration options
export enum DatabaseType {
  MEMORY = 'memory',  // In-memory database (for development/testing)
  POSTGRES = 'postgres',  // Local PostgreSQL database
  AWS_RDS = 'aws-rds'  // AWS RDS PostgreSQL database
}

const dbType = (process.env.DB_TYPE as DatabaseType) || DatabaseType.MEMORY;

// Export the appropriate storage implementation from storage.ts
// The storage variable is already exported from './storage'
console.log(`Using database type: ${dbType}`);

// Application configuration
export const config = {
  port: process.env.PORT || 5000,
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isElectron: process.env.IS_ELECTRON === 'true',
  
  // AWS configuration
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    dbInstanceIdentifier: process.env.DB_INSTANCE_IDENTIFIER,
    dbName: process.env.DB_NAME || 'clinic_management',
    secretArn: process.env.DB_SECRET_ARN,
    resourceArn: process.env.DB_RESOURCE_ARN,
    s3Bucket: process.env.S3_BUCKET || 'ac-terminal-bucket--use1-az4--x-s3',
    s3BucketArn: process.env.S3_BUCKET_ARN || 'arn:aws:s3express:us-east-1:631289602258:bucket/ac-terminal-bucket--use1-az4--x-s3'
  },
  
  // Stripe configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.VITE_STRIPE_PUBLIC_KEY
  },
  
  // Email configuration
  email: {
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.EMAIL_FROM || 'noreply@clinicmanagement.com'
  }
};