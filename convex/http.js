import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

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

for (const path of ["/clips", "/clips/search", "/auth/register", "/auth/login", "/auth/logout", "/auth/refresh", "/auth/me", "/storage/generate-upload-url"]) {
  http.route({
    path,
    method: "OPTIONS",
    handler: httpAction(async () => new Response(null, { status: 204, headers: CORS_HEADERS })),
  });
}

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

async function getUserIdFromRequest(ctx, req) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const accessToken = authHeader.slice(7);
  const user = await ctx.runQuery(api.auth.getMe, { accessToken });
  return user?._id ?? null;
}

http.route({
  path: "/clips",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const userId = await getUserIdFromRequest(ctx, req);
    if (!userId) return json({ error: "Unauthorized" }, 401);
    try {
      const body = await req.json();
      if (!body.content && !body.imageData && !body.imageStorageId) {
        return json({ error: "Content is required" }, 400);
      }
      if (body.type === "image" && body.imageStorageId) {
        await ctx.runAction(api.actions.createItemWithEmbedding, {
          type: "image",
          content: body.content || "Screenshot captured",
          url: body.url,
          imageStorageId: body.imageStorageId,
          userId,
        });
      } else if (body.type === "image" && body.imageData) {
        await ctx.runAction(api.actions.createItemWithEmbedding, {
          type: "image",
          content: body.content || "Screenshot captured",
          url: body.url,
          imageData: body.imageData,
          userId,
        });
      } else {
        const { content, url } = body;
        const type = /^https?:\/\//i.test(content?.trim()) ? "link" : "text";
        await ctx.runAction(api.actions.createItemWithEmbedding, { type, content, url, userId });
      }
      return json({ ok: true });
    } catch (e) {
      return json({ error: e.message }, 400);
    }
  }),
});

http.route({
  path: "/clips",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const userId = await getUserIdFromRequest(ctx, req);
    if (!userId) return json({ error: "Unauthorized" }, 401);
    const items = await ctx.runQuery(api.items.getItems, { userId });
    return json(items);
  }),
});

http.route({
  path: "/storage/generate-upload-url",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const userId = await getUserIdFromRequest(ctx, req);
    if (!userId) return json({ error: "Unauthorized" }, 401);
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return json({ uploadUrl });
  }),
});

http.route({
  path: "/clips/search",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const userId = await getUserIdFromRequest(ctx, req);
    if (!userId) return json({ error: "Unauthorized" }, 401);
    try {
      const { query } = await req.json();
      if (!query?.trim()) return json({ error: "Query is required" }, 400);
      const results = await ctx.runAction(api.semanticSearch.semanticSearch, {
        query: query.trim(),
        userId,
        topK: 10,
      });
      return json(results);
    } catch (e) {
      return json({ error: e.message }, 400);
    }
  }),
});

export default http;
