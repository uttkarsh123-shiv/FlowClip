import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  for (const p of [
    resolve(__dirname, "../../../.env.local"),
    resolve(__dirname, "../.env.local"),
  ]) {
    try {
      for (const line of readFileSync(p, "utf8").split("\n")) {
        const eq = line.indexOf("=");
        if (eq > 0) {
          const k = line.slice(0, eq).trim();
          const v = line.slice(eq + 1).trim();
          if (!process.env[k]) process.env[k] = v;
        }
      }
    } catch {}
  }
}
loadEnv();

import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 1 });

const [row] = await sql`
  SELECT id, embedding, pg_typeof(embedding) as pg_type
  FROM items WHERE embedding IS NOT NULL LIMIT 1
`;

console.log("pg_type      :", row.pg_type);
console.log("js typeof    :", typeof row.embedding);
console.log("is Array     :", Array.isArray(row.embedding));
console.log("raw preview  :", JSON.stringify(row.embedding).slice(0, 120));

// Try to normalise it
let vec = row.embedding;
if (typeof vec === "string") vec = JSON.parse(vec);
else if (vec && typeof vec === "object" && !Array.isArray(vec)) vec = Object.values(vec);

console.log("normalised   :", Array.isArray(vec), "length:", vec?.length, "first:", vec?.[0]);

await sql.end();
