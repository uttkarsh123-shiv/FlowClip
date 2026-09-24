// Shared auth utilities for Next.js API routes
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12; // cost factor — higher = slower = harder to brute force

// ─── Token TTLs ───────────────────────────────────────────────────────────────
export const ACCESS_TOKEN_TTL  = 15 * 60 * 1000;           // 15 minutes
export const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

// ─── Password hashing (bcrypt) ────────────────────────────────────────────────
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ─── Token generation ─────────────────────────────────────────────────────────
export function generateToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ─── Input validation ─────────────────────────────────────────────────────────
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim());
}

export function validatePassword(password) {
  return typeof password === "string" && password.length >= 8 && password.length <= 128;
}

// ─── Cookie helper ────────────────────────────────────────────────────────────
export function setRefreshTokenCookie(response, refreshToken, expiresAt) {
  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export function clearRefreshTokenCookie(response) {
  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(0),
  });
}
