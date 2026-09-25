import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/api-middleware";
import { getEmbedding } from "@/lib/embeddings";
import { cosineSimilarity } from "@/lib/cosine-similarity";

const SIMILARITY_THRESHOLD = 0.6;

// ─── POST /api/clips/search ───────────────────────────────────────────────────
// Semantic search — embed query with Gemini, rank clips by cosine similarity
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

    const startTime = Date.now();

    // 1. Embed the search query via Gemini
    const queryEmbedding = await getEmbedding(query.trim());
    const embeddingLatency = Date.now() - startTime;

    // 2. Fetch all user's non-image clips that have embeddings
    // Raw SQL — filtered by user_id index, excludes images and null embeddings
    const items = await sql`
      SELECT id, type, content, url, image_url, embedding, created_at
      FROM items
      WHERE user_id = ${userId}
        AND type != 'image'
        AND embedding IS NOT NULL
    `;

    const totalCandidates    = items.length;
    const embeddedCandidates = items.length; // all have embeddings (filtered above)

    // 3. Score each item by cosine similarity in JS
    const scored = items
      .map((item) => ({
        ...item,
        score: cosineSimilarity(queryEmbedding, item.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    const searchLatency = Date.now() - startTime;

    // 4. Keyword match — for semantic lift metric
    const queryTerms    = query.toLowerCase().split(/\s+/).filter(Boolean);
    const keywordMatches = items.filter((item) =>
      queryTerms.some((term) => item.content?.toLowerCase().includes(term))
    );

    // 5. Semantic-only results — what keyword search would have missed
    const aboveThreshold     = scored.filter((r) => r.score >= SIMILARITY_THRESHOLD);
    const semanticOnlyResults = aboveThreshold.filter(
      (r) => !keywordMatches.find((k) => k.id === r.id)
    );

    // 6. Score stats
    const scores             = scored.map((r) => r.score);
    const topScore           = scores[0] ?? 0;
    const avgScore           = scores.length > 0
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length
      : 0;
    const aboveThresholdCount = aboveThreshold.length;
    const semanticLiftPct    = aboveThresholdCount > 0
      ? Math.round((semanticOnlyResults.length / aboveThresholdCount) * 100)
      : 0;

    // Strip embedding from results — no need to send 3072 floats to client
    const results = scored.map(({ embedding, ...item }) => item);

    return NextResponse.json({
      results,
      meta: {
        totalCandidates,
        embeddedCandidates,
        embeddingCoverage: totalCandidates > 0
          ? Math.round((embeddedCandidates / totalCandidates) * 100)
          : 0,
        topScore:           Math.round(topScore * 1000) / 1000,
        avgScore:           Math.round(avgScore * 1000) / 1000,
        aboveThresholdCount,
        similarityThreshold: SIMILARITY_THRESHOLD,
        zeroResults:        aboveThresholdCount === 0,
        keywordMatchCount:  keywordMatches.length,
        semanticOnlyCount:  semanticOnlyResults.length,
        semanticLiftPct,
        embeddingLatency,
        searchLatency,
        queryWordCount:     queryTerms.length,
      },
    });
  } catch (e) {
    console.error("[POST /api/clips/search]", e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
