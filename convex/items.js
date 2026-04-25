import { v } from "convex/values";
import {mutation, query} from "./_generated/server";

export const createItem = mutation({
    args: { content: v.string(), url: v.optional(v.string()) },
    handler: async (ctx, args) => {
        return await ctx.db.insert("items", {
            content: args.content,
            url: args.url,
            createdAt: Date.now(),
        });
    },
});

export const getItems = query({
    handler: async (ctx) =>  {
        return await ctx.db.query("items").collect();
    },
});