import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { getEmbedding } from "./embeddings.js";

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
    const itemId = await ctx.runMutation(api.items.createItem, args);

    if (args.type !== "image" && args.content && args.content !== "Screenshot captured") {
      try {
        const embedding = await getEmbedding(args.content);
        await ctx.runMutation(api.items.updateEmbedding, { id: itemId, embedding });
      } catch (e) {
        console.error("Embedding generation failed:", e.message);
      }
    }

    return itemId;
  },
});

export const backfillEmbeddings = action({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.runQuery(api.items.getAllItemsForBackfill);
    let success = 0, skipped = 0, failed = 0;

    for (const item of items) {
      if (item.type === "image" || item.embedding || !item.content || item.content === "Screenshot captured") {
        skipped++;
        continue;
      }
      try {
        const embedding = await getEmbedding(item.content);
        await ctx.runMutation(api.items.updateEmbedding, { id: item._id, embedding });
        success++;
      } catch (e) {
        failed++;
        console.error(`Failed to embed item ${item._id}:`, e.message);
      }
    }

    return { success, skipped, failed, total: items.length };
  },
});
