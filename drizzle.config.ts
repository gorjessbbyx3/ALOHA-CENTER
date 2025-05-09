
import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Build connection string from environment variables or use DATABASE_URL if set
const dbHost = process.env.DB_ENDPOINT || 'database-alohacenter.cshguag6ii9q.us-east-1.rds.amazonaws.com';
const dbPort = Number(process.env.DB_PORT || '5432');
const dbName = process.env.DB_NAME || 'clinic_management';
const dbUser = process.env.DB_USERNAME || 'postgres';
const dbPassword = process.env.DB_PASSWORD;

// Create connection URL
const connectionUrl = process.env.DATABASE_URL || 
  `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionUrl,
  },
});
