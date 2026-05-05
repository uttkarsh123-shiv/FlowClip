import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    accessToken: v.string(),
    refreshToken: v.string(),
    accessTokenExpiresAt: v.number(),  // short-lived: ~15 mins
    refreshTokenExpiresAt: v.number(), // long-lived: ~30 days
    createdAt: v.number(),
  })
    .index("by_access_token", ["accessToken"])
    .index("by_refresh_token", ["refreshToken"])
    .index("by_user", ["userId"]),

  items: defineTable({
    type: v.optional(v.union(v.literal("text"), v.literal("link"), v.literal("image"))),
    content: v.string(),
    url: v.optional(v.string()),
    imageData: v.optional(v.string()),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});