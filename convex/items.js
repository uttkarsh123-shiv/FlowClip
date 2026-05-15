import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { sanitizeText, sanitizeUrl } from "./lib/sanitize.js";

export const createItem = mutation({
  args: {
    type: v.union(v.literal("text"), v.literal("link"), v.literal("image")),
    content: v.string(),
    url: v.optional(v.string()),
    imageData: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Sanitize content - remove dangerous content but preserve text
    const sanitizedContent = sanitizeText(args.content);
    
    // Sanitize URL if provided
    const sanitizedUrl = args.url ? sanitizeUrl(args.url) : undefined;
    
    // Validate that we have actual content
    if (!sanitizedContent && !args.imageData) {
      throw new Error("Content cannot be empty");
    }
    
    // For image data, basic validation (should be base64)
    let sanitizedImageData = args.imageData;
    if (args.imageData) {
      if (typeof args.imageData !== 'string' || args.imageData.length > 5000000) { // ~5MB limit
        throw new Error("Invalid image data");
      }
      // Basic base64 validation
      if (!args.imageData.startsWith('data:image/')) {
        throw new Error("Invalid image format");
      }
    }
    
    return await ctx.db.insert("items", {
      type: args.type,
      content: sanitizedContent,
      url: sanitizedUrl,
      imageData: sanitizedImageData,
      userId: args.userId,
      createdAt: Date.now(),
    });
  },
});

export const getItems = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const deleteItem = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
