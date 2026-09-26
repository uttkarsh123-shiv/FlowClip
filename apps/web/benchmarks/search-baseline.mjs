/**
 * Search Benchmark — Cold vs Warm Cache
 * ──────────────────────────────────────
 * Measures real latency of each cache layer by hitting the live API:
 *
 *   Run 1 (cold)  — no cache, full Gemini + DB + ranking pipeline
 *   Run 2 (warm)  — result cache hit (Layer 3), should be ~1ms
 *   Run 3 (warm)  — result cache hit again
 *   Run 4 (embed) — new but similar query, embedding cache hit (Layer 1)
 *
 * Run: node benchmarks/search-baseline.mjs
 * Requires: dev server running on localhost:3000
 *           Valid access token (login first and paste below)
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

// ─── Config ───────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:3000";

// Get a fresh access token by logging in
async function getAccessToken() {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      email:    "uttkarshsingh450@gmail.com",
      password: "Flowclip@2026",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Login failed: ${err}`);
  }
  const data = await res.json();
  return data.accessToken;
}

// ─── Search helper ────────────────────────────────────────────────────────────
async function search(query, accessToken) {
  const t0  = performance.now();
  const res = await fetch(`${BASE_URL}/api/clips/search`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query, topK: 10 }),
  });
  const latency = Math.round(performance.now() - t0);

  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const data = await res.json();
  return { latency, meta: data.meta, resultCount: data.results?.length ?? 0 };
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\nLogging in...");
  const accessToken = await getAccessToken();
  console.log("Login OK\n");

  // Queries designed to test each cache layer
  const QUERIES = [
    "javascript performance optimization",
    "react hooks tutorial",
    "database indexing strategies",
    "authentication best practices",
    "machine learning basics",
  ];

  // Similar queries — should hit Layer 2 (semantic cache)
  const SIMILAR_QUERIES = [
    "js performance tips",           // similar to "javascript performance optimization"
    "react hooks guide",             // similar to "react hooks tutorial"
    "database index performance",    // similar to "database indexing strategies"
    "auth security best practices",  // similar to "authentication best practices"
    "ml fundamentals",               // similar to "machine learning basics"
  ];

  console.log("─".repeat(75));
  console.log("PHASE 1 — COLD PATH (first run, no cache)");
  console.log("─".repeat(75));

  const coldLatencies = [];
  for (const query of QUERIES) {
    const { latency, meta } = await search(query, accessToken);
    coldLatencies.push(latency);
    console.log(
      `  "${query.slice(0, 38).padEnd(38)}"  ${String(latency + "ms").padStart(7)}  layer=${meta.cacheLayer ?? 0}  embHit=${meta.embeddingCacheHit ?? false}`
    );
  }

  console.log("\n─".repeat(75));
  console.log("PHASE 2 — WARM PATH (same queries, Layer 3 result cache)");
  console.log("─".repeat(75));

  const warmLatencies = [];
  for (const query of QUERIES) {
    const { latency, meta } = await search(query, accessToken);
    warmLatencies.push(latency);
    console.log(
      `  "${query.slice(0, 38).padEnd(38)}"  ${String(latency + "ms").padStart(7)}  layer=${meta.cacheLayer}  hit=${meta.cacheHit}`
    );
  }

  console.log("\n─".repeat(75));
  console.log("PHASE 3 — SEMANTIC CACHE (similar but different queries, Layer 2)");
  console.log("─".repeat(75));

  const semanticLatencies = [];
  for (let i = 0; i < SIMILAR_QUERIES.length; i++) {
    const query = SIMILAR_QUERIES[i];
    const { latency, meta } = await search(query, accessToken);
    semanticLatencies.push(latency);
    console.log(
      `  "${query.slice(0, 38).padEnd(38)}"  ${String(latency + "ms").padStart(7)}  layer=${meta.cacheLayer}  hit=${meta.cacheHit}  sim=${meta.semanticSimilarity ?? "n/a"}`
    );
  }

  // ─── Summary ─────────────────────────────────────────────────────────────────
  const avg = (arr) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
  const coldAvg    = avg(coldLatencies);
  const warmAvg    = avg(warmLatencies);
  const semanticAvg = avg(semanticLatencies);

  console.log("\n" + "─".repeat(75));
  console.log("SUMMARY");
  console.log("─".repeat(75));
  console.log(`  Cold path avg    (no cache)       : ${coldAvg}ms`);
  console.log(`  Warm path avg    (Layer 3 hit)     : ${warmAvg}ms`);
  console.log(`  Semantic avg     (Layer 2 hit)     : ${semanticAvg}ms`);
  console.log(`\n  Speedup (cold → warm)  : ${Math.round(coldAvg / Math.max(warmAvg, 1))}x faster`);
  console.log(`  Speedup (cold → semantic): ${Math.round(coldAvg / Math.max(semanticAvg, 1))}x faster`);
  console.log(`\n  Baseline (pre-cache):  ~906ms`);
  console.log(`  Current cold path:     ${coldAvg}ms`);
  console.log(`  Current warm path:     ${warmAvg}ms`);
  console.log();
}

main().catch((e) => { console.error(e); process.exit(1); });
