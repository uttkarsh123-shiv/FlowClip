import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createItem = mutation({
  args: {
    type: v.union(v.literal("text"), v.literal("link"), v.literal("image")),
    content: v.string(),
    url: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("items", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
 
export const getItems = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db
        .query("items")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("items").order("desc").collect();
  },
});

export const deleteItem = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
