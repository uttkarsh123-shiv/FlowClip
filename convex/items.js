import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { sanitizeText, sanitizeUrl } from "./lib/sanitize.js";

export const createItem = mutation({
  args: {
    type: v.union(v.literal("text"), v.literal("link"), v.literal("image")),
    content: v.string(),
    url: v.optional(v.string()),
    imageData: v.optional(v.string()),      // legacy base64
    imageStorageId: v.optional(v.id("_storage")), // new Convex Storage
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sanitizedContent = sanitizeText(args.content);
    const sanitizedUrl = args.url ? sanitizeUrl(args.url) : undefined;

    if (!sanitizedContent && !args.imageData && !args.imageStorageId) {
      throw new Error("Content cannot be empty");
    }

    if (args.imageData) {
      if (typeof args.imageData !== 'string' || args.imageData.length > 5000000) {
        throw new Error("Invalid image data");
      }
      if (!args.imageData.startsWith('data:image/')) {
        throw new Error("Invalid image format");
      }
    }

    return await ctx.db.insert("items", {
      type: args.type,
      content: sanitizedContent,
      url: sanitizedUrl,
      imageData: args.imageData,
      imageStorageID: args.imageStorageId,
      userId: args.userId,
      createdAt: Date.now(),
    });
  },
});

export const getItems = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Generate URLs for items using Convex Storage
    return await Promise.all(items.map(async (item) => {
      if (item.imageStorageID) {
        const imageUrl = await ctx.storage.getUrl(item.imageStorageID);
        return { ...item, imageUrl };
      }
      return item;
    }));
  },
});

export const deleteItem = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
