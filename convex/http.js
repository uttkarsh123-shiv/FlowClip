import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// ─── CORS helper ─────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

// ─── CORS preflight for all routes ───────────────────────────────────────────

for (const path of ["/clips", "/auth/register", "/auth/login", "/auth/logout", "/auth/refresh", "/auth/me"]) {
  http.route({
    path,
    method: "OPTIONS",
    handler: httpAction(async () => new Response(null, { status: 204, headers: CORS_HEADERS })),
  });
}

// ─── Auth routes ─────────────────────────────────────────────────────────────

http.route({
  path: "/auth/register",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const { email, password, name } = await req.json();
      if (!email || !password) return json({ error: "Email and password required" }, 400);
      const result = await ctx.runMutation(api.auth.register, { email, password, name });
      return json(result);
    } catch (e) {
      return json({ error: e.message }, 400);
    }
  }),
});

http.route({
  path: "/auth/login",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const { email, password } = await req.json();
      if (!email || !password) return json({ error: "Email and password required" }, 400);
      const result = await ctx.runMutation(api.auth.login, { email, password });
      return json(result);
    } catch (e) {
      return json({ error: e.message }, 401);
    }
  }),
});

http.route({
  path: "/auth/logout",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const { accessToken } = await req.json();
      if (!accessToken) return json({ error: "Access token required" }, 400);
      const result = await ctx.runMutation(api.auth.logout, { accessToken });
      return json(result);
    } catch (e) {
      return json({ error: e.message }, 400);
    }
  }),
});

http.route({
  path: "/auth/refresh",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const { refreshToken } = await req.json();
      if (!refreshToken) return json({ error: "Refresh token required" }, 400);
      const result = await ctx.runMutation(api.auth.refreshToken, { refreshToken });
      return json(result);
    } catch (e) {
      return json({ error: e.message }, 401);
    }
  }),
});

http.route({
  path: "/auth/me",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    try {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
      const accessToken = authHeader.slice(7);
      const user = await ctx.runQuery(api.auth.getMe, { accessToken });
      if (!user) return json({ error: "Unauthorized" }, 401);
      return json(user);
    } catch (e) {
      return json({ error: e.message }, 401);
    }
  }),
});

// ─── Clips routes ─────────────────────────────────────────────────────────────

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
      const isUrl = /^https?:\/\//i.test(content?.trim());
      const type = isUrl ? "link" : "text";
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
