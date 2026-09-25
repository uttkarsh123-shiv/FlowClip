import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load .env.local for drizzle-kit CLI (Next.js doesn't auto-load it for CLI tools)
config({ path: "../../.env.local" });
// fallback to apps/web/.env.local if root doesn't have it
config({ path: ".env.local" });

export default defineConfig({
  schema:    "./lib/db/schema.js",
  out:       "./lib/db/migrations",
  dialect:   "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
  verbose: true,
  strict:  true,
});
