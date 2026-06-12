import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { getEmbedding } from "./embeddings.js";

// Creates a clip and generates its embedding in one action
// Actions can call external APIs (Gemini), mutations cannot
export const createItemWithEmbedding = action({
  args: {
    type: v.union(v.literal("text"), v.literal("link"), v.literal("image")),
    content: v.string(),
    url: v.optional(v.string()),
    imageData: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // 1. Save the item first so the user sees it immediately
    const itemId = await ctx.runMutation(api.items.createItem, args);

    // 2. Generate embedding for text/link content only (not images)
    if (args.type !== "image" && args.content && args.content !== "Screenshot captured") {
      try {
        const embedding = await getEmbedding(args.content);
        await ctx.runMutation(api.items.updateEmbedding, { id: itemId, embedding });
      } catch (e) {
        // Embedding failure is non-fatal — clip is already saved
        console.error("Embedding generation failed:", e.message);
      }
    }

    return itemId;
  },
});

// Backfill embeddings for all existing clips that don't have one
// Run once via: npx convex run actions:backfillEmbeddings
export const backfillEmbeddings = action({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.runQuery(api.items.getAllItemsForBackfill);

    let success = 0;
    let skipped = 0;
    let failed = 0;

    for (const item of items) {
      // Skip images and items that already have embeddings
      if (item.type === "image" || item.embedding) {
        skipped++;
        continue;
      }

      // Skip empty or placeholder content
      if (!item.content || item.content === "Screenshot captured") {
        skipped++;
        continue;
      }

      try {
        const embedding = await getEmbedding(item.content);
        await ctx.runMutation(api.items.updateEmbedding, { id: item._id, embedding });
        success++;
        console.log(`Embedded item ${item._id}: "${item.content.slice(0, 50)}"`);
      } catch (e) {
        failed++;
        console.error(`Failed to embed item ${item._id}:`, e.message);
      }
    }

    return { success, skipped, failed, total: items.length };
  },
});
