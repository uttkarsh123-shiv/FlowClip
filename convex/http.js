import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Handle CORS preflight
http.route({
  path: "/clips",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

http.route({
  path: "/clips",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const { content } = await req.json();
    await ctx.runMutation(api.items.createItem, { content });
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

http.route({
  path: "/clips",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const items = await ctx.runQuery(api.items.getItems);
    return new Response(JSON.stringify(items), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

export default http;
