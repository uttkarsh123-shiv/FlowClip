import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { clearRefreshTokenCookie } from "@/lib/auth-helpers";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // Delete session from DB if refresh token exists
    // Even if token is already expired, clean it up
    if (refreshToken) {
      await sql`
        DELETE FROM sessions
        WHERE refresh_token = ${refreshToken}
      `;
    }

    // Also handle access token revocation from request body
    // Extension sends accessToken in body for logout
    try {
      const { accessToken } = await request.json();
      if (accessToken) {
        await sql`
          DELETE FROM sessions
          WHERE access_token = ${accessToken}
        `;
      }
    } catch {
      // body might be empty — that's fine
    }

    const response = NextResponse.json({ ok: true });
    clearRefreshTokenCookie(response);
    return response;
  } catch (e) {
    console.error("[logout]", e);
    // Still clear the cookie even if DB delete fails
    const response = NextResponse.json({ ok: true });
    clearRefreshTokenCookie(response);
    return response;
  }
}
