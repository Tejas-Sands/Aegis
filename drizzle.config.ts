import "dotenv/config";
import { defineConfig } from "drizzle-kit";

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Drizzle Kit commands require a direct/session connection.
// If the connection URL uses Supabase's transaction pooler (port 6543),
// we automatically rewrite it to use the session pooler port (5432) to prevent hanging.
if (connectionString.includes(":6543")) {
  connectionString = connectionString.replace(":6543", ":5432");
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
