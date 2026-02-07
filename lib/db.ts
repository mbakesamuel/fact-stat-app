// db.ts
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

// Ensure DATABASE_URL is defined
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("❌ DATABASE_URL is not defined in environment variables");
}

// Create a Neon SQL client
export const sql: NeonQueryFunction<false, false> = neon(databaseUrl);

// Optional: check connection on startup
export const initDB = async (): Promise<void> => {
  try {
    // Run a simple query to confirm connection
    await sql`SELECT 1`;
    console.log("✅ Database connection initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
};
