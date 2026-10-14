import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { clearRefreshTokenCookie } from "@/lib/auth-helpers";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // Delete session from DB if refresh token exists
    if (refreshToken) {
      await prisma.session.deleteMany({
        where: { refreshToken },
      });
    }

    // Also handle access token revocation from request body
    // Extension sends accessToken in body for logout
    try {
      const { accessToken } = await request.json();
      if (accessToken) {
        await prisma.session.deleteMany({
          where: { accessToken },
        });
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
