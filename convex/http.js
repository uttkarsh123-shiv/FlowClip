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
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }),
});

http.route({
  path: "/clips",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();
    
    // Handle screenshot data
    if (body.type === "image" && body.imageData) {
      await ctx.runMutation(api.items.createItem, {
        type: "image",
        content: body.content || "Screenshot captured",
        url: body.url,
        imageData: body.imageData
      });
    } else {
      // Handle regular text/link data
      const { content, url } = body;
      const type = url && content === url ? "link" : "text";
      await ctx.runMutation(api.items.createItem, { type, content, url });
    }
    
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
