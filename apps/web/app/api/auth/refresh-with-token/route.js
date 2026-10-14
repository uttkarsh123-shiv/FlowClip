import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      select: {
        id: true,
        accessToken: true,
        accessTokenExpiresAt: true,
        refreshTokenExpiresAt: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    const accessTokenExpiresAt  = Number(session.accessTokenExpiresAt);
    const refreshTokenExpiresAt = Number(session.refreshTokenExpiresAt);

    // Check refresh token expiry
    if (Date.now() > refreshTokenExpiresAt) {
      await prisma.session.delete({ where: { id: session.id } });
      return NextResponse.json(
        { error: "Refresh token expired, please login again" },
        { status: 401 }
      );
    }

    // Return existing access token if still valid
    if (Date.now() < accessTokenExpiresAt - 30000) {
      return NextResponse.json({
        accessToken:          session.accessToken,
        accessTokenExpiresAt,
      });
    }

    // Generate new access token
    const newAccessToken = generateToken();
    const newExpiresAt   = Date.now() + ACCESS_TOKEN_TTL;

    await prisma.session.update({
      where: { id: session.id },
      data: {
        accessToken:          newAccessToken,
        accessTokenExpiresAt: BigInt(newExpiresAt),
      },
    });

    return NextResponse.json({
      accessToken:          newAccessToken,
      accessTokenExpiresAt: newExpiresAt,
    });
  } catch (e) {
    console.error("[refresh-with-token]", e);
    return NextResponse.json({ error: "Token refresh failed" }, { status: 500 });
  }
}
