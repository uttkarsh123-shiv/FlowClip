import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { getEmbedding } from "./embeddings.js";
import { cosineSimilarity } from "./lib/cosineSimilarity.js";

// Minimum cosine similarity score to consider a result relevant
const SIMILARITY_THRESHOLD = 0.6;

// Semantic search — embeds the query and ranks clips by cosine similarity
export const semanticSearch = action({
  args: {
    query: v.string(),
    userId: v.id("users"),
    topK: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.topK ?? 10;
    const startTime = Date.now();

    // 1. Embed the search query
    const queryEmbedding = await getEmbedding(args.query);
    const embeddingLatency = Date.now() - startTime;

    // 2. Fetch all user's items that have embeddings
    const items = await ctx.runQuery(api.items.getItemsWithEmbeddings, {
      userId: args.userId,
    });

    const totalCandidates = items.length;
    const embeddedCandidates = items.filter(
      (item) => item.embedding && item.embedding.length > 0
    ).length;

    // 3. Score each item by cosine similarity
    const scored = items
      .filter((item) => item.embedding && item.embedding.length > 0)
      .map((item) => ({
        ...item,
        score: cosineSimilarity(queryEmbedding, item.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const searchLatency = Date.now() - startTime;

    // 4. Keyword match — find items whose content contains the raw query terms
    const queryTerms = args.query.toLowerCase().split(/\s+/).filter(Boolean);
    const keywordMatches = items.filter((item) =>
      queryTerms.some((term) => item.content?.toLowerCase().includes(term))
    );

    // 5. Semantic-only results — relevant results keyword search would have missed
    const aboveThreshold = scored.filter((r) => r.score >= SIMILARITY_THRESHOLD);
    const semanticOnlyResults = aboveThreshold.filter(
      (r) => !keywordMatches.find((k) => k._id === r._id)
    );

    // 6. Score distribution
    const scores = scored.map((r) => r.score);
    const topScore = scores[0] ?? 0;
    const avgScore =
      scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : 0;
    const aboveThresholdCount = aboveThreshold.length;
    const zeroResults = aboveThresholdCount === 0;

    // 7. Semantic lift — % of relevant results keyword search would have missed
    const semanticLiftPct =
      aboveThresholdCount > 0
        ? Math.round((semanticOnlyResults.length / aboveThresholdCount) * 100)
        : 0;

    return {
      results: scored,
      meta: {
        // Candidate stats
        totalCandidates,
        embeddedCandidates,
        embeddingCoverage:
          totalCandidates > 0
            ? Math.round((embeddedCandidates / totalCandidates) * 100)
            : 0,

        // Score distribution
        topScore: Math.round(topScore * 1000) / 1000,
        avgScore: Math.round(avgScore * 1000) / 1000,
        aboveThresholdCount,
        similarityThreshold: SIMILARITY_THRESHOLD,
        zeroResults,

        // Semantic lift vs keyword search
        keywordMatchCount: keywordMatches.length,
        semanticOnlyCount: semanticOnlyResults.length,
        semanticLiftPct,

        // Latency (ms)
        embeddingLatency,
        searchLatency,

        // Query info
        queryWordCount: queryTerms.length,
      },
    };
  },
});
