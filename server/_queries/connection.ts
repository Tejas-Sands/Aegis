import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";
import { setDbAvailable } from "./memoryStore";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>> | null = null;

export function getDb() {
  if (!instance) {
    const dbUrl = env.databaseUrl;
    if (!dbUrl || dbUrl === "") {
      setDbAvailable(false);
      throw new Error("DATABASE_URL not configured - using in-memory storage");
    }
    try {
      // Disable prefetch as it is not supported for "Transaction" pool mode in Supabase
      const client = postgres(dbUrl, { prepare: false });
      instance = drizzle(client, { schema: fullSchema });
      setDbAvailable(true);
    } catch (e) {
      console.error(e);
      setDbAvailable(false);
      throw new Error("Failed to connect to database - using in-memory storage");
    }
  }
  return instance;
}
