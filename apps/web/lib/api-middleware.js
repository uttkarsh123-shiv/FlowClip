// Shared middleware for Next.js API routes
import { prisma } from "@/lib/db";
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
    request._authTiming = `auth-cache;dur=${ms};desc="token validation (cache)"`;
    return cached;
  }

  // Cache miss — hit the DB
  const session = await prisma.session.findFirst({
    where: {
      accessToken,
      accessTokenExpiresAt: { gt: BigInt(Date.now()) },
    },
    select: { userId: true, accessTokenExpiresAt: true },
  });

  const ms = (performance.now() - t0).toFixed(2);
  request._authTiming = `auth-db;dur=${ms};desc="token validation (db)"`;

  if (!session?.userId) return null;

  // Store in cache for subsequent requests
  const remainingTtl = Number(session.accessTokenExpiresAt) - Date.now() - 60_000;
  if (remainingTtl > 0) {
    sessionCache.set(accessToken, session.userId);
  }

  return session.userId;
}
