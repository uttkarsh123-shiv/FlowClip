import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
function loadEnv() {
  for (const p of [resolve(__dirname, "../../../.env.local"), resolve(__dirname, "../.env.local")]) {
    try {
      for (const line of readFileSync(p, "utf8").split("\n")) {
        const eq = line.indexOf("=");
        if (eq > 0) { const k = line.slice(0,eq).trim(); const v = line.slice(eq+1).trim().replace(/^"|"$/g,""); if (!process.env[k]) process.env[k] = v; }
      }
    } catch {}
  }
}
loadEnv();

import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 1 });

const images = await sql`
  SELECT id, content, image_url, created_at
  FROM items
  WHERE type = 'image'
  ORDER BY created_at DESC
`;

console.log(`\nFound ${images.length} image clip(s):\n`);
for (const img of images) {
  console.log(`id:        ${img.id}`);
  console.log(`image_url: ${img.image_url ?? "NULL"}`);
  console.log(`content:   ${(img.content ?? "").slice(0, 80)}`);
  console.log(`created:   ${img.created_at}`);
  console.log("─".repeat(60));
}

await sql.end();
