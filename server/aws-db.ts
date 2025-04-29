import { RDSClient, DescribeDBInstancesCommand } from '@aws-sdk/client-rds';
import { RDSDataClient, ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { drizzle } from 'drizzle-orm/aws-data-api/pg';
import * as schema from '@shared/schema';

// Check for required environment variables
if (!process.env.AWS_REGION) {
  console.warn('AWS_REGION environment variable is missing. Defaulting to us-east-1');
}

if (!process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_ACCESS_KEY_ID) {
  console.error('AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) must be set');
}

// Initialize RDS client
const rdsClient = new RDSClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

// Initialize RDS Data client for data API operations
const rdsDataClient = new RDSDataClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

// Settings for connecting to the database
const DB_INSTANCE_IDENTIFIER = process.env.DB_INSTANCE_IDENTIFIER;
const DB_NAME = process.env.DB_NAME || 'clinic_management';
const DB_SECRET_ARN = process.env.DB_SECRET_ARN;
const DB_RESOURCE_ARN = process.env.DB_RESOURCE_ARN;

// Get database instance details (useful for troubleshooting)
export async function getDBInstanceDetails() {
  if (!DB_INSTANCE_IDENTIFIER) {
    throw new Error('DB_INSTANCE_IDENTIFIER environment variable must be set');
  }

  try {
    const command = new DescribeDBInstancesCommand({
      DBInstanceIdentifier: DB_INSTANCE_IDENTIFIER,
    });
    
    const response = await rdsClient.send(command);
    return response.DBInstances?.[0];
  } catch (error) {
    console.error('Error getting DB instance details:', error);
    throw error;
  }
}

// Initialize Drizzle ORM with AWS RDS Data API
export const db = drizzle(
  {
    client: rdsDataClient,
    database: DB_NAME,
    secretArn: DB_SECRET_ARN,
    resourceArn: DB_RESOURCE_ARN,
  },
  { schema }
);

// Function to execute raw SQL using Data API
export async function executeSQL(sql: string, parameters: any[] = []) {
  if (!DB_SECRET_ARN || !DB_RESOURCE_ARN) {
    throw new Error('DB_SECRET_ARN and DB_RESOURCE_ARN environment variables must be set');
  }
  
  try {
    const params = {
      secretArn: DB_SECRET_ARN,
      resourceArn: DB_RESOURCE_ARN,
      database: DB_NAME,
      sql,
      parameters: parameters.map((value) => ({ 
        value: typeof value === 'object' ? JSON.stringify(value) : String(value) 
      })),
    };
    
    const command = new ExecuteStatementCommand(params);
    const result = await rdsDataClient.send(command);
    return result;
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
}

// Function to check database connection
export async function checkDatabaseConnection() {
  try {
    const result = await executeSQL('SELECT 1 as connection_test');
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}