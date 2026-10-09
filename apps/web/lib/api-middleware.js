// Shared middleware for Next.js API routes
import { sql } from "@/lib/db";
import { LRUCache } from "@/lib/cache";

// In-process session cache — avoids a DB round-trip on every API call
// TTL: 14 minutes (1 min less than the 15-min access token lifetime)
const sessionCache = new LRUCache(1000, 14 * 60 * 1000);

// Validates Bearer token and returns userId (null if invalid/expired)
// Also attaches Server-Timing header data to measure cache vs DB latency
export async function getUserIdFromRequest(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const accessToken = authHeader.slice(7);
  const t0 = performance.now();

  // Cache hit — skip DB entirely
  const cached = sessionCache.get(accessToken);
  if (cached) {
    const ms = (performance.now() - t0).toFixed(2);
    // Attach timing to request so route handlers can forward it
    request._authTiming = `auth-cache;dur=${ms};desc="token validation (cache)"`;
    return cached;
  }

  // Cache miss — hit the DB
  const [session] = await sql`
    SELECT user_id, access_token_expires_at
    FROM sessions
    WHERE access_token = ${accessToken}
      AND access_token_expires_at > ${Date.now()}
    LIMIT 1
  `;

  const ms = (performance.now() - t0).toFixed(2);
  request._authTiming = `auth-db;dur=${ms};desc="token validation (db)"`;

  if (!session?.user_id) return null;

  // Store in cache for subsequent requests
  const remainingTtl = session.access_token_expires_at - Date.now() - 60_000;
  if (remainingTtl > 0) {
    sessionCache.set(accessToken, session.user_id);
  }

  return session.user_id;
}
