import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import {
  generateToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  ACCESS_TOKEN_TTL,
} from "@/lib/auth-helpers";

export async function POST() {
  try {
    // 1. Read refresh token from HTTP-only cookie
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    // 2. Find session by refresh token
    const [session] = await sql`
      SELECT id, user_id, access_token, access_token_expires_at, refresh_token_expires_at
      FROM sessions
      WHERE refresh_token = ${refreshToken}
      LIMIT 1
    `;

    if (!session) {
      // Token not in DB — clear cookie
      const response = NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
      clearRefreshTokenCookie(response);
      return response;
    }

    // 3. Check refresh token expiry
    if (Date.now() > session.refresh_token_expires_at) {
      // Expired — delete session and clear cookie
      await sql`DELETE FROM sessions WHERE id = ${session.id}`;
      const response = NextResponse.json(
        { error: "Refresh token expired, please login again" },
        { status: 401 }
      );
      clearRefreshTokenCookie(response);
      return response;
    }

    // 4. If access token still valid (with 30s buffer) — return existing
    if (Date.now() < session.access_token_expires_at - 30000) {
      return NextResponse.json({
        accessToken: session.access_token,
        accessTokenExpiresAt: session.access_token_expires_at,
      });
    }

    // 5. Access token expired — generate new one
    const newAccessToken = generateToken();
    const newExpiresAt   = Date.now() + ACCESS_TOKEN_TTL;

    await sql`
      UPDATE sessions
      SET access_token = ${newAccessToken},
          access_token_expires_at = ${newExpiresAt}
      WHERE id = ${session.id}
    `;

    return NextResponse.json({
      accessToken: newAccessToken,
      accessTokenExpiresAt: newExpiresAt,
    });
  } catch (e) {
    console.error("[refresh]", e);
    return NextResponse.json({ error: "Token refresh failed" }, { status: 500 });
  }
}
