/**
 * Neon Cold Start Measurement
 * ───────────────────────────
 * Measures connection overhead by timing a trivial query across multiple
 * fresh connections. The difference between first and subsequent queries
 * is the cold start tax.
 *
 * Run: node benchmarks/neon-coldstart.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  for (const p of [resolve(__dirname, "../../../.env.local"), resolve(__dirname, "../.env.local")]) {
    try {
      for (const line of readFileSync(p, "utf8").split("\n")) {
        const eq = line.indexOf("=");
        if (eq > 0) {
          const k = line.slice(0, eq).trim();
          const v = line.slice(eq + 1).trim().replace(/^"|"$/g, "");
          if (!process.env[k]) process.env[k] = v;
        }
      }
    } catch {}
  }
}
loadEnv();

import postgres from "postgres";

const RUNS = 8;

async function pingOnce() {
  // New client per run = fresh connection = measures cold start every time
  const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 1 });
  const t0 = performance.now();
  await sql`SELECT 1`;
  const pingLatency = Math.round(performance.now() - t0);

  // Now run the actual clips fetch on the same warm connection
  const t1 = performance.now();
  await sql`
    SELECT id, content, embedding
    FROM items
    WHERE type != 'image' AND embedding IS NOT NULL
  `;
  const fetchLatency = Math.round(performance.now() - t1);

  await sql.end();
  return { pingLatency, fetchLatency };
}

async function main() {
  console.log(`\nRunning ${RUNS} fresh connections to measure Neon cold start...\n`);
  console.log(`${"Run".padEnd(6)} ${"Ping (cold connect)".padEnd(22)} ${"Clips fetch (warm conn)".padEnd(25)}`);
  console.log("─".repeat(55));

  const pings   = [];
  const fetches = [];

  for (let i = 1; i <= RUNS; i++) {
    const { pingLatency, fetchLatency } = await pingOnce();
    pings.push(pingLatency);
    fetches.push(fetchLatency);
    console.log(
      `  ${String(i).padEnd(4)} ${String(pingLatency + "ms").padEnd(22)} ${String(fetchLatency + "ms")}`
    );
  }

  const avg      = (arr) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
  const avgPing  = avg(pings);
  const avgFetch = avg(fetches);

  // The cold start overhead is the ping latency — establishing the TCP + TLS
  // connection to Neon. The fetch latency on the same connection is the real
  // query cost without cold start.
  const trueDbLatency      = avgFetch;
  const coldStartOverhead  = avgPing;
  const totalColdPath      = 620 + avgPing + avgFetch + 2;  // gemini + cold + fetch + rank
  const totalPersistentPath = 620 + avgFetch + 2;            // gemini + fetch + rank (no cold start)

  console.log("─".repeat(55));
  console.log(`  ${"AVG".padEnd(4)} ${String(avgPing + "ms").padEnd(22)} ${avgFetch + "ms"}`);

  console.log(`
─────────────────────────────────────────────────────
ANALYSIS
─────────────────────────────────────────────────────
  Neon cold start overhead   : ${coldStartOverhead}ms  (TCP + TLS handshake)
  True DB query latency      : ${trueDbLatency}ms  (warm connection)

  Search latency breakdown:
  ┌─────────────────────────────────────────────────┐
  │               Serverless (Neon cold start)       │
  │  Gemini embed :  620ms                          │
  │  DB cold start: +${String(coldStartOverhead + "ms").padEnd(32)}│
  │  DB fetch     : +${String(trueDbLatency + "ms").padEnd(32)}│
  │  Ranking      :   +2ms                          │
  │  Total        :  ${String(totalColdPath + "ms").padEnd(33)}│
  └─────────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────────┐
  │               Persistent (EC2 / always-on)       │
  │  Gemini embed :  620ms                          │
  │  DB cold start:   +0ms  (connection stays alive) │
  │  DB fetch     : +${String(trueDbLatency + "ms").padEnd(32)}│
  │  Ranking      :   +2ms                          │
  │  Total        :  ${String(totalPersistentPath + "ms").padEnd(33)}│
  └─────────────────────────────────────────────────┘

  Cold start adds ${coldStartOverhead}ms (${Math.round((coldStartOverhead / totalColdPath) * 100)}% of total search time)
  Persistent connection saves ${coldStartOverhead}ms per search
  With caching (Layer 3 hit): ~116ms regardless of connection type
`);
}

main().catch((e) => { console.error(e); process.exit(1); });
