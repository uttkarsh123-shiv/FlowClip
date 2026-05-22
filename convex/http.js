import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { validateEmail, validatePassword } from "./lib/sanitize.js";
import { applyRateLimit } from "./lib/rateLimit.js";

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

for (const path of ["/clips", "/auth/register", "/auth/login", "/auth/logout", "/auth/refresh", "/auth/me", "/storage/generate-upload-url"]) {
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
    // Apply rate limiting (no userId for registration)
    const rateLimitResult = applyRateLimit(req, "/auth/register", null);
    if (rateLimitResult) {
      return json(rateLimitResult.body, rateLimitResult.status);
    }
    
    try {
      const { email, password, name } = await req.json();
      
      // Validate required fields
      if (!email || !password) {
        return json({ error: "Email and password required" }, 400);
      }
      
      // Additional validation at HTTP layer
      if (!validateEmail(email)) {
        return json({ error: "Invalid email format" }, 400);
      }
      
      if (!validatePassword(password)) {
        return json({ error: "Password must be between 8-128 characters" }, 400);
      }
      
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
    // Apply rate limiting (no userId for login)
    const rateLimitResult = applyRateLimit(req, "/auth/login", null);
    if (rateLimitResult) {
      return json(rateLimitResult.body, rateLimitResult.status);
    }
    
    try {
      const { email, password } = await req.json();
      
      // Validate required fields
      if (!email || !password) {
        return json({ error: "Email and password required" }, 400);
      }
      
      // Additional validation at HTTP layer
      if (!validateEmail(email)) {
        return json({ error: "Invalid email or password" }, 401);
      }
      
      if (!validatePassword(password)) {
        return json({ error: "Invalid email or password" }, 401);
      }
      
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
      
      // Get user from access token for rate limiting
      const user = await ctx.runQuery(api.auth.getMe, { accessToken });
      const userId = user?._id;
      
      // Apply rate limiting with userId if available
      const rateLimitResult = applyRateLimit(req, "/auth/logout", userId);
      if (rateLimitResult) {
        return json(rateLimitResult.body, rateLimitResult.status);
      }
      
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
      
      // Get user from refresh token to apply user-specific rate limiting
      const session = await ctx.runQuery(api.auth.getMeByRefreshToken, { refreshToken });
      const userId = session?.userId;
      
      // Apply rate limiting with userId if available
      const rateLimitResult = applyRateLimit(req, "/auth/refresh", userId);
      if (rateLimitResult) {
        return json(rateLimitResult.body, rateLimitResult.status);
      }
      
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
      
      // Apply rate limiting with userId
      const rateLimitResult = applyRateLimit(req, "/auth/me", user._id);
      if (rateLimitResult) {
        return json(rateLimitResult.body, rateLimitResult.status);
      }
      
      return json(user);
    } catch (e) {
      return json({ error: e.message }, 401);
    }
  }),
});

// ─── Clips routes ─────────────────────────────────────────────────────────────

// Helper to get userId from Authorization header
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

    // Apply rate limiting with userId
    const rateLimitResult = applyRateLimit(req, "/clips", userId);
    if (rateLimitResult) {
      return json(rateLimitResult.body, rateLimitResult.status);
    }
    
    try {
      const body = await req.json();
      
      // Validate content exists
      if (!body.content && !body.imageData) {
        return json({ error: "Content is required" }, 400);
      }
      
      // Validate content length
      if (body.content && body.content.length > 10000) {
        return json({ error: "Content too long" }, 400);
      }
      
      // Validate URL if provided
      if (body.url && (typeof body.url !== 'string' || body.url.length > 2048)) {
        return json({ error: "Invalid URL" }, 400);
      }

      if (body.type === "image" && body.imageData) {
        await ctx.runMutation(api.items.createItem, {
          type: "image",
          content: body.content || "Screenshot captured",
          url: body.url,
          imageData: body.imageData,
          userId,
        });
      } else {
        const { content, url } = body;
        const isUrl = /^https?:\/\//i.test(content?.trim());
        const type = isUrl ? "link" : "text";
        await ctx.runMutation(api.items.createItem, { type, content, url, userId });
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

    // Apply rate limiting with userId
    const rateLimitResult = applyRateLimit(req, "/clips", userId);
    if (rateLimitResult) {
      return json(rateLimitResult.body, rateLimitResult.status);
    }
    
    const items = await ctx.runQuery(api.items.getItems, { userId });
    return json(items);
  }),
});

// ─── Storage routes ───────────────────────────────────────────────────────────

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

export default http;
