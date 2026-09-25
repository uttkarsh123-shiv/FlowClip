import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateToken, ACCESS_TOKEN_TTL } from "@/lib/auth-helpers";

// ─── POST /api/auth/refresh-with-token ───────────────────────────────────────
// Extension-specific refresh route — accepts refresh token in request body
// The main /api/auth/refresh reads from HTTP-only cookie (web app)
// Extensions can't access HTTP-only cookies so they send token in body instead

export async function POST(request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token required" }, { status: 400 });
    }

    // Find session by refresh token
    const [session] = await sql`
      SELECT id, user_id, access_token, access_token_expires_at, refresh_token_expires_at
      FROM sessions
      WHERE refresh_token = ${refreshToken}
      LIMIT 1
    `;

    if (!session) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    // Check refresh token expiry
    if (Date.now() > session.refresh_token_expires_at) {
      await sql`DELETE FROM sessions WHERE id = ${session.id}`;
      return NextResponse.json(
        { error: "Refresh token expired, please login again" },
        { status: 401 }
      );
    }

    // Return existing access token if still valid
    if (Date.now() < session.access_token_expires_at - 30000) {
      return NextResponse.json({
        accessToken:         session.access_token,
        accessTokenExpiresAt: session.access_token_expires_at,
      });
    }

    // Generate new access token
    const newAccessToken = generateToken();
    const newExpiresAt   = Date.now() + ACCESS_TOKEN_TTL;

    await sql`
      UPDATE sessions
      SET access_token = ${newAccessToken},
          access_token_expires_at = ${newExpiresAt}
      WHERE id = ${session.id}
    `;

    return NextResponse.json({
      accessToken:         newAccessToken,
      accessTokenExpiresAt: newExpiresAt,
    });
  } catch (e) {
    console.error("[refresh-with-token]", e);
    return NextResponse.json({ error: "Token refresh failed" }, { status: 500 });
  }
}
