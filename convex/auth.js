import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { validateEmail, sanitizeName, validatePassword } from "./lib/sanitize.js";

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial, 256
  );
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
  return `${saltHex}:${hashHex}`;
}

async function verifyPassword(password, stored) {
  const [saltHex, storedHash] = stored.split(":");
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial, 256
  );
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex === storedHash;
}

function generateToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

const ACCESS_TOKEN_TTL  = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60 * 1000;

export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!validateEmail(args.email)) throw new Error("Invalid email format");
    if (!validatePassword(args.password)) throw new Error("Password must be 8-128 characters");

    const name = args.name ? sanitizeName(args.name) : undefined;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .first();

    if (existing) throw new Error("Email already registered");

    const passwordHash = await hashPassword(args.password);
    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase().trim(),
      passwordHash,
      name,
      createdAt: Date.now(),
    });

    return await createSession(ctx, userId);
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    if (!validateEmail(args.email) || !validatePassword(args.password)) {
      throw new Error("Invalid email or password");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .first();

    if (!user) throw new Error("Invalid email or password");

    const valid = await verifyPassword(args.password, user.passwordHash);
    if (!valid) throw new Error("Invalid email or password");

    return await createSession(ctx, user._id);
  },
});

export const logout = mutation({
  args: { accessToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_access_token", (q) => q.eq("accessToken", args.accessToken))
      .first();
    if (session) await ctx.db.delete(session._id);
    return { success: true };
  },
});

export const refreshToken = mutation({
  args: { refreshToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_refresh_token", (q) => q.eq("refreshToken", args.refreshToken))
      .first();

    if (!session) throw new Error("Invalid refresh token");
    if (Date.now() > session.refreshTokenExpiresAt) {
      await ctx.db.delete(session._id);
      throw new Error("Refresh token expired, please login again");
    }

    if (Date.now() < session.accessTokenExpiresAt - 30000) {
      return {
        accessToken: session.accessToken,
        accessTokenExpiresAt: session.accessTokenExpiresAt,
      };
    }

    const newAccessToken = generateToken();
    const newExpiry = Date.now() + ACCESS_TOKEN_TTL;
    await ctx.db.patch(session._id, {
      accessToken: newAccessToken,
      accessTokenExpiresAt: newExpiry,
    });

    return { accessToken: newAccessToken, accessTokenExpiresAt: newExpiry };
  },
});

export const getMe = query({
  args: { accessToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_access_token", (q) => q.eq("accessToken", args.accessToken))
      .first();

    if (!session || Date.now() > session.accessTokenExpiresAt) return null;

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    return { _id: user._id, email: user.email, name: user.name };
  },
});


async function createSession(ctx, userId) {
  const accessToken = generateToken();
  const refreshToken = generateToken();
  const now = Date.now();

  await ctx.db.insert("sessions", {
    userId,
    accessToken,
    refreshToken,
    accessTokenExpiresAt: now + ACCESS_TOKEN_TTL,
    refreshTokenExpiresAt: now + REFRESH_TOKEN_TTL,
    createdAt: now,
  });

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: now + ACCESS_TOKEN_TTL,
    refreshTokenExpiresAt: now + REFRESH_TOKEN_TTL,
  };
}
