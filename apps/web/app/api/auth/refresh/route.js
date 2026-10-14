import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import {
  generateToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  ACCESS_TOKEN_TTL,
} from "@/lib/auth-helpers";
import { LRUCache } from "@/lib/cache";

// Cache refresh token → { accessToken, accessTokenExpiresAt }
// Prevents redundant DB hits when multiple components call refresh simultaneously.
// TTL: 14 min (1 min less than the 15-min access token)
const refreshCache = new LRUCache(2000, 14 * 60 * 1000);

export async function POST() {
  try {
    // 1. Read refresh token from HTTP-only cookie
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    // 2. Serve from cache if the access token is still fresh (> 30s left)
    const cached = refreshCache.get(refreshToken);
    if (cached && Date.now() < cached.accessTokenExpiresAt - 30_000) {
      return NextResponse.json(cached);
    }

    // 3. Find session by refresh token
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      select: {
        id: true,
        userId: true,
        accessToken: true,
        accessTokenExpiresAt: true,
        refreshTokenExpiresAt: true,
      },
    });

    if (!session) {
      const response = NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
      clearRefreshTokenCookie(response);
      return response;
    }

    const accessTokenExpiresAt  = Number(session.accessTokenExpiresAt);
    const refreshTokenExpiresAt = Number(session.refreshTokenExpiresAt);

    // 4. Check refresh token expiry
    if (Date.now() > refreshTokenExpiresAt) {
      await prisma.session.delete({ where: { id: session.id } });
      const response = NextResponse.json(
        { error: "Refresh token expired, please login again" },
        { status: 401 }
      );
      clearRefreshTokenCookie(response);
      return response;
    }

    // 5. If access token still valid (with 30s buffer) — return existing + cache it
    if (Date.now() < accessTokenExpiresAt - 30_000) {
      const payload = {
        accessToken: session.accessToken,
        accessTokenExpiresAt,
      };
      refreshCache.set(refreshToken, payload);
      return NextResponse.json(payload);
    }

    // 6. Access token expired — generate new one
    const newAccessToken = generateToken();
    const newExpiresAt   = Date.now() + ACCESS_TOKEN_TTL;

    await prisma.session.update({
      where: { id: session.id },
      data: {
        accessToken:         newAccessToken,
        accessTokenExpiresAt: BigInt(newExpiresAt),
      },
    });

    const payload = {
      accessToken: newAccessToken,
      accessTokenExpiresAt: newExpiresAt,
    };
    refreshCache.set(refreshToken, payload);
    return NextResponse.json(payload);
  } catch (e) {
    console.error("[refresh]", e);
    return NextResponse.json({ error: "Token refresh failed" }, { status: 500 });
  }
}
