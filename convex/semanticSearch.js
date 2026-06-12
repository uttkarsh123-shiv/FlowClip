import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { getEmbedding } from "./embeddings.js";
import { cosineSimilarity } from "./lib/cosineSimilarity.js";

// Semantic search — embeds the query and ranks clips by cosine similarity
export const semanticSearch = action({
  args: {
    query: v.string(),
    userId: v.id("users"),
    topK: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.topK ?? 10;

    // 1. Embed the search query
    const queryEmbedding = await getEmbedding(args.query);

    // 2. Fetch all user's items that have embeddings
    const items = await ctx.runQuery(api.items.getItemsWithEmbeddings, {
      userId: args.userId,
    });

    // 3. Score each item by cosine similarity
    const scored = items
      .filter((item) => item.embedding && item.embedding.length > 0)
      .map((item) => ({
        ...item,
        score: cosineSimilarity(queryEmbedding, item.embedding),
      }))
      .sort((a, b) => b.score - a.score) // highest similarity first
      .slice(0, limit);

    return scored;
  },
});
