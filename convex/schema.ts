import {defineSchema, defineTable} from "convex/server";
import {v} from "convex/values";

export default defineSchema({
    items:defineTable({
        content:v.string(),
        createdAt: v.number(),
    }),
})