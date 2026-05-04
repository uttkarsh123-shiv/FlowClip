import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  items: defineTable({
    type: v.optional(v.union(v.literal("text"), v.literal("link"), v.literal("image"))),
    content: v.string(),
    url: v.optional(v.string()),
    imageData: v.optional(v.string()), // Base64 image data for screenshots
    userId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
