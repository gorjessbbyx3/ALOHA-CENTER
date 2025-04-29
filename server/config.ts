import { AWSStorage } from './aws-storage';
import { DatabaseStorage } from './storage';
import { MemStorage } from './storage';

// Database configuration options
export enum DatabaseType {
  MEMORY = 'memory',  // In-memory database (for development/testing)
  POSTGRES = 'postgres',  // Local PostgreSQL database
  AWS_RDS = 'aws-rds'  // AWS RDS PostgreSQL database
}

// Determine which database to use based on environment variable
const dbType = process.env.DB_TYPE as DatabaseType || DatabaseType.POSTGRES;

// Export the appropriate storage implementation based on configuration
export const storage = (() => {
  console.log(`Using database type: ${dbType}`);
  
  switch (dbType) {
    case DatabaseType.AWS_RDS:
      if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.error('AWS credentials not found. Defaulting to PostgreSQL database.');
        return new DatabaseStorage();
      }
      return new AWSStorage();
      
    case DatabaseType.POSTGRES:
      if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL not found. Defaulting to in-memory database.');
        return new MemStorage();
      }
      return new DatabaseStorage();
      
    case DatabaseType.MEMORY:
    default:
      return new MemStorage();
  }
})();

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
    resourceArn: process.env.DB_RESOURCE_ARN
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