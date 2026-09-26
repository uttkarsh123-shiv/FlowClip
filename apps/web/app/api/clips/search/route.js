import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/api-middleware";
import { getEmbedding } from "@/lib/embeddings";
import { cosineSimilarity } from "@/lib/cosine-similarity";
import {
  embeddingCache,
  semanticCache,
  resultCache,
  normalizeQuery,
  hashQuery,
} from "@/lib/cache";

const SIMILARITY_THRESHOLD  = 0.6;
const SEMANTIC_CACHE_THRESHOLD = 0.92; // min similarity to reuse a cached query's results

// ─── POST /api/clips/search ───────────────────────────────────────────────────
// Semantic search with 3-layer cache:
//
//   Layer 1 — Embedding cache  (normalizedQuery → embedding)
//   Layer 2 — Semantic cache   (userId → [{embedding, results}])
//             if a previously cached query's embedding is ≥0.92 similar to
//             the current query, return its results directly
//   Layer 3 — Result cache     (userId:queryHash → results)
//             exact query match, shortest TTL
//
export async function POST(request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { query, topK = 10 } = await request.json();

    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const startTime   = Date.now();
    const normalized  = normalizeQuery(query);
    const queryHash   = hashQuery(normalized);
    const resultKey   = `${userId}:${queryHash}`;

    // ── Layer 3: Result cache (exact query match) ─────────────────────────────
    const cachedResult = resultCache.get(resultKey);
    if (cachedResult) {
      return NextResponse.json({
        results: cachedResult,
        meta: {
          cacheLayer:   3,
          cacheHit:     true,
          searchLatency: Date.now() - startTime,
        },
      });
    }

    // ── Layer 1: Embedding cache ───────────────────────────────────────────────
    let queryEmbedding = embeddingCache.get(normalized);
    let embeddingLatency = 0;
    let embeddingCacheHit = false;

    if (queryEmbedding) {
      embeddingCacheHit = true;
    } else {
      const embStart   = Date.now();
      queryEmbedding   = await getEmbedding(normalized);
      embeddingLatency = Date.now() - embStart;
      // Write-through: cache immediately after generating
      embeddingCache.set(normalized, queryEmbedding);
    }

    // ── Layer 2: Semantic cache (similar query match) ─────────────────────────
    // Check if any previously cached query for this user is semantically
    // similar enough that its results are still valid
    const userSemanticEntries = semanticCache.get(userId) ?? [];
    for (const entry of userSemanticEntries) {
      const similarity = cosineSimilarity(queryEmbedding, entry.embedding);
      if (similarity >= SEMANTIC_CACHE_THRESHOLD) {
        // Close enough — reuse results, cache in Layer 3 for next time
        resultCache.set(resultKey, entry.results);
        return NextResponse.json({
          results: entry.results,
          meta: {
            cacheLayer:        2,
            cacheHit:          true,
            semanticSimilarity: Math.round(similarity * 1000) / 1000,
            searchLatency:     Date.now() - startTime,
          },
        });
      }
    }

    // ── Cache miss — full search ───────────────────────────────────────────────
    const dbStart = Date.now();
    const items = await sql`
      SELECT id, type, content, url, image_url, embedding, created_at
      FROM items
      WHERE user_id = ${userId}
        AND type != 'image'
        AND embedding IS NOT NULL
    `;
    const dbLatency = Date.now() - dbStart;

    const totalCandidates = items.length;

    // Score each clip by cosine similarity
    // postgres.js returns jsonb as JSON string — parse before use
    const rankStart = Date.now();
    const scored = items
      .map((item) => ({
        ...item,
        score: cosineSimilarity(
          queryEmbedding,
          typeof item.embedding === "string" ? JSON.parse(item.embedding) : item.embedding
        ),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
    const rankLatency = Date.now() - rankStart;

    const searchLatency = Date.now() - startTime;

    // Keyword match — for semantic lift metric
    const queryTerms     = normalized.split(/\s+/).filter(Boolean);
    const keywordMatches = items.filter((item) =>
      queryTerms.some((term) => item.content?.toLowerCase().includes(term))
    );

    const aboveThreshold      = scored.filter((r) => r.score >= SIMILARITY_THRESHOLD);
    const semanticOnlyResults = aboveThreshold.filter(
      (r) => !keywordMatches.find((k) => k.id === r.id)
    );

    const scores    = scored.map((r) => r.score);
    const topScore  = scores[0] ?? 0;
    const avgScore  = scores.length > 0
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length
      : 0;

    // Strip embeddings from results before caching + returning
    const results = scored.map(({ embedding, ...item }) => item);

    // ── Populate caches ────────────────────────────────────────────────────────
    // Layer 3: exact result
    resultCache.set(resultKey, results);

    // Layer 2: store embedding + results so future similar queries can reuse
    const updatedEntries = [
      { embedding: queryEmbedding, results },
      // Keep last 20 entries per user — prevents unbounded growth
      ...userSemanticEntries.slice(0, 19),
    ];
    semanticCache.set(userId, updatedEntries);

    return NextResponse.json({
      results,
      meta: {
        cacheHit:           false,
        cacheLayer:         0,
        embeddingCacheHit,
        embeddingLatency,
        dbLatency,
        rankLatency,
        searchLatency,
        totalCandidates,
        embeddedCandidates: totalCandidates,
        embeddingCoverage:  100,
        topScore:           Math.round(topScore * 1000) / 1000,
        avgScore:           Math.round(avgScore * 1000) / 1000,
        aboveThresholdCount: aboveThreshold.length,
        similarityThreshold: SIMILARITY_THRESHOLD,
        zeroResults:        aboveThreshold.length === 0,
        keywordMatchCount:  keywordMatches.length,
        semanticOnlyCount:  semanticOnlyResults.length,
        semanticLiftPct:    aboveThreshold.length > 0
          ? Math.round((semanticOnlyResults.length / aboveThreshold.length) * 100)
          : 0,
        queryWordCount:     queryTerms.length,
        cacheStats: {
          embedding: embeddingCache.stats(),
          semantic:  semanticCache.stats(),
          result:    resultCache.stats(),
        },
      },
    });
  } catch (e) {
    console.error("[POST /api/clips/search]", e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
