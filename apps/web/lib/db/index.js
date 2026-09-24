import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// postgres.js connection — uses Neon's PgBouncer pooled URL for serverless
// max: 1 because PgBouncer manages the real pool across all serverless instances
const client = postgres(process.env.DATABASE_URL, {
  ssl: "require",
  max: 1,
});

export const db = drizzle(client, { schema });

// Also export raw sql tag for writing raw SQL queries
export { client as sql };
